package com.softchaos.service;

import com.softchaos.dto.mapper.MediaMapper;
import com.softchaos.dto.request.UploadMediaRequest;
import com.softchaos.dto.response.MediaResponse;
import com.softchaos.exception.BadRequestException;
import com.softchaos.exception.ResourceNotFoundException;
import com.softchaos.model.Article;
import com.softchaos.model.Media;
import com.softchaos.repository.ArticleRepository;
import com.softchaos.repository.MediaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class MediaService {

    private static final int MAX_IMAGE_MEDIA_PER_ARTICLE = 5;
    private static final Set<Media.MediaType> IMAGE_MEDIA_TYPES = Set.of(Media.MediaType.IMAGE);
    private static final Set<String> ALLOWED_IMAGE_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp"
    );

    private final MediaRepository mediaRepository;
    private final ArticleRepository articleRepository;
    private final MediaMapper mediaMapper;
    private final SupabaseStorageService supabaseStorageService;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Value("${app.upload.max-file-size:10485760}")
    private Long maxFileSize;

    public MediaResponse uploadFile(MultipartFile file, UploadMediaRequest request) {
        log.info("Fazendo upload de arquivo: {}", file.getOriginalFilename());

        if (file.isEmpty()) {
            throw new BadRequestException("Arquivo nao pode estar vazio");
        }

        if (file.getSize() > maxFileSize) {
            throw new BadRequestException("Arquivo excede o tamanho maximo permitido de " +
                    (maxFileSize / 1024 / 1024) + "MB");
        }

        if (request.getType() == Media.MediaType.VIDEO) {
            throw new BadRequestException("Upload direto de videos foi desativado. Use links externos no artigo.");
        }

        String contentType = file.getContentType();
        if (!isValidFileType(contentType, request.getType())) {
            throw new BadRequestException("Tipo de arquivo invalido para " + request.getType());
        }

        Article article = null;
        if (request.getArticleId() != null) {
            article = articleRepository.findById(request.getArticleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Artigo", "id", request.getArticleId()));
            validateImageLimit(request.getArticleId(), request.getType());
        }

        Path filePath = null;
        try {
            String originalFilename = file.getOriginalFilename() != null
                    ? file.getOriginalFilename()
                    : "arquivo";
            String extension = request.getType() == Media.MediaType.IMAGE
                    ? detectImageExtension(file.getBytes())
                    : FilenameUtils.getExtension(originalFilename);

            if (extension == null || extension.isBlank()) {
                throw new BadRequestException("Imagem invalida. Envie um arquivo JPEG, PNG, GIF ou WEBP.");
            }

            String uniqueFilename = extension == null || extension.isBlank()
                    ? UUID.randomUUID().toString()
                    : UUID.randomUUID() + "." + extension;
            String storedFilename = uniqueFilename;
            String storedUrl;

            if (supabaseStorageService.isEnabled()) {
                storedFilename = "articles/" + uniqueFilename;
                storedUrl = supabaseStorageService.uploadImage(file, storedFilename);
            } else {
                Path uploadPath = resolveUploadPath();
                filePath = uploadPath.resolve(uniqueFilename);
                copyFileWithFallback(file, filePath, uniqueFilename);
                storedUrl = "/uploads/" + uniqueFilename;
            }

            Media media = new Media();
            media.setFilename(storedFilename);
            media.setUrl(storedUrl);
            media.setType(request.getType());
            media.setAltText(request.getAltText());
            media.setFileSize(file.getSize());

            if (article != null) {
                media.setArticle(article);
            }

            Media savedMedia = mediaRepository.save(media);
            log.info("Arquivo salvo com sucesso. ID: {}, Nome: {}", savedMedia.getId(), storedFilename);

            return mediaMapper.toResponse(savedMedia);

        } catch (IOException e) {
            log.error("Erro ao fazer upload do arquivo", e);
            throw new BadRequestException("Erro ao salvar arquivo: " + e.getMessage());
        } catch (RuntimeException e) {
            deletePhysicalFileIfExists(filePath);
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public MediaResponse getMediaById(Long id) {
        log.info("Buscando midia por ID: {}", id);

        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Midia", "id", id));

        return mediaMapper.toResponse(media);
    }

    @Transactional(readOnly = true)
    public List<MediaResponse> getMediaByArticle(Long articleId) {
        log.info("Listando midias do artigo ID: {}", articleId);

        if (!articleRepository.existsById(articleId)) {
            throw new ResourceNotFoundException("Artigo", "id", articleId);
        }

        return mediaRepository.findByArticleIdOrderByUploadedAtAsc(articleId).stream()
                .map(mediaMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MediaResponse> getMediaByType(Media.MediaType type) {
        log.info("Listando midias do tipo: {}", type);

        return mediaRepository.findByType(type).stream()
                .map(mediaMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MediaResponse> getOrphanMedia() {
        log.info("Listando midias orfas");

        return mediaRepository.findOrphanMedia().stream()
                .map(mediaMapper::toResponse)
                .collect(Collectors.toList());
    }

    public MediaResponse associateMediaToArticle(Long mediaId, Long articleId) {
        log.info("Associando midia ID: {} ao artigo ID: {}", mediaId, articleId);

        Media media = mediaRepository.findById(mediaId)
                .orElseThrow(() -> new ResourceNotFoundException("Midia", "id", mediaId));

        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new ResourceNotFoundException("Artigo", "id", articleId));

        validateImageLimit(articleId, media.getType());
        media.setArticle(article);

        Media updatedMedia = mediaRepository.save(media);
        return mediaMapper.toResponse(updatedMedia);
    }

    public MediaResponse updateAltText(Long id, String altText) {
        log.info("Atualizando alt text da midia ID: {}", id);

        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Midia", "id", id));

        media.setAltText(altText);
        Media updatedMedia = mediaRepository.save(media);

        return mediaMapper.toResponse(updatedMedia);
    }

    public void deleteMedia(Long id) {
        log.info("Deletando midia ID: {}", id);

        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Midia", "id", id));

        try {
            if (supabaseStorageService.isEnabled()) {
                supabaseStorageService.deleteObject(media.getFilename());
            } else {
                Path filePath = resolveUploadPath().resolve(media.getFilename());
                Files.deleteIfExists(filePath);
            }
        } catch (IOException e) {
            log.error("Erro ao deletar arquivo fisico", e);
        }

        mediaRepository.delete(media);
    }

    @Transactional(readOnly = true)
    public Long calculateTotalStorageUsed() {
        Long totalBytes = mediaRepository.calculateTotalStorageUsed();
        return totalBytes != null ? totalBytes : 0L;
    }

    private boolean isValidFileType(String contentType, Media.MediaType mediaType) {
        if (contentType == null) {
            return false;
        }

        return switch (mediaType) {
            case IMAGE -> ALLOWED_IMAGE_CONTENT_TYPES.contains(contentType.toLowerCase());
            case VIDEO -> contentType.startsWith("video/");
            case DOCUMENT -> contentType.equals("application/pdf")
                    || contentType.equals("application/msword")
                    || contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document")
                    || contentType.equals("application/vnd.ms-excel")
                    || contentType.equals("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        };
    }

    private String detectImageExtension(byte[] bytes) {
        if (bytes == null || bytes.length < 12) {
            return null;
        }

        if (bytes[0] == (byte) 0xFF && bytes[1] == (byte) 0xD8 && bytes[2] == (byte) 0xFF) {
            return "jpg";
        }

        if (bytes[0] == (byte) 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4E && bytes[3] == 0x47
                && bytes[4] == 0x0D && bytes[5] == 0x0A && bytes[6] == 0x1A && bytes[7] == 0x0A) {
            return "png";
        }

        if (bytes[0] == 0x47 && bytes[1] == 0x49 && bytes[2] == 0x46
                && bytes[3] == 0x38 && (bytes[4] == 0x37 || bytes[4] == 0x39) && bytes[5] == 0x61) {
            return "gif";
        }

        if (bytes[0] == 0x52 && bytes[1] == 0x49 && bytes[2] == 0x46 && bytes[3] == 0x46
                && bytes[8] == 0x57 && bytes[9] == 0x45 && bytes[10] == 0x42 && bytes[11] == 0x50) {
            return "webp";
        }

        return null;
    }

    private void validateImageLimit(Long articleId, Media.MediaType mediaType) {
        if (!IMAGE_MEDIA_TYPES.contains(mediaType)) {
            return;
        }

        Long currentImageCount = mediaRepository.countByArticleIdAndTypeIn(articleId, IMAGE_MEDIA_TYPES);
        if (currentImageCount != null && currentImageCount >= MAX_IMAGE_MEDIA_PER_ARTICLE) {
            throw new BadRequestException("Cada artigo pode ter no maximo 5 imagens");
        }
    }

    private void deletePhysicalFileIfExists(Path filePath) {
        if (filePath == null) {
            return;
        }

        try {
            Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            log.warn("Nao foi possivel remover o arquivo {} apos falha no upload", filePath, ex);
        }
    }

    private Path resolveUploadPath() {
        if (isUnixStylePathOnWindows(uploadDir)) {
            Path fallbackPath = buildFallbackUploadPath();
            createDirectoriesOrFail(fallbackPath);
            log.warn("Diretorio de upload {} e incompatível com Windows. Usando fallback em {}", uploadDir, fallbackPath);
            return fallbackPath;
        }

        Path preferredPath = Paths.get(uploadDir);

        try {
            Files.createDirectories(preferredPath);
            return preferredPath;
        } catch (IOException | RuntimeException ex) {
            Path fallbackPath = buildFallbackUploadPath();
            createDirectoriesOrFail(fallbackPath);
            log.warn("Nao foi possivel usar o diretorio de upload configurado ({}). Usando fallback em {}",
                    preferredPath, fallbackPath);
            return fallbackPath;
        }
    }

    private void copyFileWithFallback(MultipartFile file, Path preferredTarget, String uniqueFilename) throws IOException {
        try {
            Files.copy(file.getInputStream(), preferredTarget, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            Path fallbackPath = buildFallbackUploadPath();
            createDirectoriesOrFail(fallbackPath);

            Path fallbackTarget = fallbackPath.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), fallbackTarget, StandardCopyOption.REPLACE_EXISTING);
            log.warn("Falha ao gravar em {}. Arquivo salvo no fallback {}", preferredTarget, fallbackTarget);
        }
    }

    private void createDirectoriesOrFail(Path path) {
        try {
            Files.createDirectories(path);
        } catch (IOException ex) {
            throw new BadRequestException("Erro ao preparar diretorio de upload: " + ex.getMessage());
        }
    }

    private Path buildFallbackUploadPath() {
        return Paths.get(System.getProperty("user.home"), "softchaos-uploads", "runtime");
    }

    private boolean isUnixStylePathOnWindows(String pathValue) {
        String osName = System.getProperty("os.name", "").toLowerCase();
        return osName.contains("win") && (pathValue.startsWith("/") || pathValue.startsWith("\\"));
    }
}

