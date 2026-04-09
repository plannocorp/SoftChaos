package com.softchaos.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.softchaos.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SupabaseStorageService {

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Value("${media.storage.provider:local}")
    private String storageProvider;

    @Value("${supabase.url:}")
    private String supabaseUrl;

    @Value("${supabase.service-role-key:}")
    private String serviceRoleKey;

    @Value("${supabase.storage.bucket:softchaos-media}")
    private String bucketName;

    private volatile boolean bucketChecked = false;

    public boolean isEnabled() {
        return "supabase".equalsIgnoreCase(storageProvider)
                && !supabaseUrl.isBlank()
                && !serviceRoleKey.isBlank()
                && !bucketName.isBlank();
    }

    public String uploadImage(MultipartFile file, String objectKey) {
        ensureBucketReady();

        String endpoint = normalizeBaseUrl() + "/storage/v1/object/" + bucketName + "/" + encodePath(objectKey);

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .header("Authorization", "Bearer " + serviceRoleKey)
                    .header("apikey", serviceRoleKey)
                    .header("x-upsert", "true")
                    .header("Content-Type", file.getContentType() != null ? file.getContentType() : "application/octet-stream")
                    .POST(HttpRequest.BodyPublishers.ofByteArray(file.getBytes()))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                throw new BadRequestException("Erro ao enviar imagem para o Supabase: " + extractErrorMessage(response.body()));
            }

            return buildPublicUrl(objectKey);
        } catch (IOException ex) {
            throw new BadRequestException("Falha ao comunicar com o Supabase Storage: " + ex.getMessage());
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new BadRequestException("Falha ao comunicar com o Supabase Storage: " + ex.getMessage());
        }
    }

    public void deleteObject(String objectKey) {
        if (!isEnabled() || objectKey == null || objectKey.isBlank()) {
            return;
        }

        String endpoint = normalizeBaseUrl() + "/storage/v1/object/" + bucketName;

        try {
            String body = objectMapper.writeValueAsString(Map.of("prefixes", List.of(objectKey)));
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .header("Authorization", "Bearer " + serviceRoleKey)
                    .header("apikey", serviceRoleKey)
                    .header("Content-Type", "application/json")
                    .method("DELETE", HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                log.warn("Nao foi possivel remover objeto {} do Supabase Storage: {}", objectKey, response.body());
            }
        } catch (IOException ex) {
            log.warn("Falha ao remover objeto {} do Supabase Storage", objectKey, ex);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            log.warn("Falha ao remover objeto {} do Supabase Storage", objectKey, ex);
        }
    }

    private synchronized void ensureBucketReady() {
        if (bucketChecked || !isEnabled()) {
            return;
        }

        createBucketIfNeeded();
        updateBucketToPublic();
        bucketChecked = true;
    }

    private void createBucketIfNeeded() {
        String endpoint = normalizeBaseUrl() + "/storage/v1/bucket";

        try {
            String body = objectMapper.writeValueAsString(Map.of(
                    "id", bucketName,
                    "name", bucketName,
                    "public", true
            ));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .header("Authorization", "Bearer " + serviceRoleKey)
                    .header("apikey", serviceRoleKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            String errorMessage = extractErrorMessage(response.body());
            boolean alreadyExists = errorMessage.toLowerCase().contains("already exists");

            if (response.statusCode() != 200 && response.statusCode() != 201 && response.statusCode() != 409 && !alreadyExists) {
                throw new BadRequestException("Erro ao preparar bucket no Supabase: " + errorMessage);
            }
        } catch (IOException ex) {
            throw new BadRequestException("Falha ao preparar bucket do Supabase: " + ex.getMessage());
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new BadRequestException("Falha ao preparar bucket do Supabase: " + ex.getMessage());
        }
    }

    private void updateBucketToPublic() {
        String endpoint = normalizeBaseUrl() + "/storage/v1/bucket/" + bucketName;

        try {
            String body = objectMapper.writeValueAsString(Map.of(
                    "id", bucketName,
                    "name", bucketName,
                    "public", true
            ));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .header("Authorization", "Bearer " + serviceRoleKey)
                    .header("apikey", serviceRoleKey)
                    .header("Content-Type", "application/json")
                    .PUT(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                throw new BadRequestException("Erro ao tornar bucket publico no Supabase: " + extractErrorMessage(response.body()));
            }
        } catch (IOException ex) {
            throw new BadRequestException("Falha ao atualizar bucket do Supabase: " + ex.getMessage());
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new BadRequestException("Falha ao atualizar bucket do Supabase: " + ex.getMessage());
        }
    }

    private String buildPublicUrl(String objectKey) {
        return normalizeBaseUrl() + "/storage/v1/object/public/" + bucketName + "/" + encodePath(objectKey);
    }

    private String normalizeBaseUrl() {
        return supabaseUrl.endsWith("/") ? supabaseUrl.substring(0, supabaseUrl.length() - 1) : supabaseUrl;
    }

    private String encodePath(String path) {
        String[] segments = path.split("/");
        StringBuilder encoded = new StringBuilder();

        for (int i = 0; i < segments.length; i++) {
            if (i > 0) {
                encoded.append('/');
            }
            encoded.append(URLEncoder.encode(segments[i], StandardCharsets.UTF_8));
        }

        return encoded.toString();
    }

    private String extractErrorMessage(String responseBody) {
        try {
            JsonNode jsonNode = objectMapper.readTree(responseBody);
            if (jsonNode.hasNonNull("message")) {
                return jsonNode.get("message").asText();
            }
            if (jsonNode.hasNonNull("error")) {
                return jsonNode.get("error").asText();
            }
        } catch (Exception ignored) {
        }

        return responseBody == null || responseBody.isBlank() ? "resposta vazia" : responseBody;
    }
}
