package com.softchaos.controller;

import com.softchaos.dto.request.UploadMediaRequest;
import com.softchaos.dto.response.ApiResponse;
import com.softchaos.dto.response.MediaResponse;
import com.softchaos.model.Media;
import com.softchaos.service.MediaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
@Tag(name = "Mídia", description = "Gerenciamento de arquivos e imagens")
public class MediaController {

    private final MediaService mediaService;

    /**
     * Faz upload de arquivo
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR', 'AUTHOR')")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Upload de arquivo", description = "Faz upload de imagem, vídeo ou documento")
    public ResponseEntity<ApiResponse<MediaResponse>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") Media.MediaType type,
            @RequestParam(required = false) String altText,
            @RequestParam(required = false) Long articleId) {

        UploadMediaRequest request = UploadMediaRequest.builder()
                .type(type)
                .altText(altText)
                .articleId(articleId)
                .build();

        MediaResponse media = mediaService.uploadFile(file, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Arquivo enviado com sucesso", media));
    }

    /**
     * Busca mídia por ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR', 'AUTHOR')")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Buscar mídia por ID", description = "Retorna detalhes de um arquivo")
    public ResponseEntity<ApiResponse<MediaResponse>> getMediaById(@PathVariable Long id) {
        MediaResponse media = mediaService.getMediaById(id);
        return ResponseEntity.ok(ApiResponse.success(media));
    }

    /**
     * Lista mídias de um artigo
     */
    @GetMapping("/article/{articleId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR', 'AUTHOR')")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Mídias do artigo", description = "Lista todas as mídias de um artigo")
    public ResponseEntity<ApiResponse<List<MediaResponse>>> getMediaByArticle(@PathVariable Long articleId) {
        List<MediaResponse> media = mediaService.getMediaByArticle(articleId);
        return ResponseEntity.ok(ApiResponse.success(media));
    }

    /**
     * Lista mídias por tipo
     */
    @GetMapping("/type/{type}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR', 'AUTHOR')")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Listar por tipo", description = "Retorna mídias de um tipo específico (IMAGE, VIDEO, DOCUMENT)")
    public ResponseEntity<ApiResponse<List<MediaResponse>>> getMediaByType(@PathVariable Media.MediaType type) {
        List<MediaResponse> media = mediaService.getMediaByType(type);
        return ResponseEntity.ok(ApiResponse.success(media));
    }

    /**
     * Lista mídias órfãs
     */
    @GetMapping("/orphan")
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Mídias órfãs", description = "Lista mídias sem artigo associado")
    public ResponseEntity<ApiResponse<List<MediaResponse>>> getOrphanMedia() {
        List<MediaResponse> media = mediaService.getOrphanMedia();
        return ResponseEntity.ok(ApiResponse.success(media));
    }

    /**
     * Associa mídia a artigo
     */
    @PutMapping("/{mediaId}/associate/{articleId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR', 'AUTHOR')")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Associar mídia", description = "Associa uma mídia a um artigo")
    public ResponseEntity<ApiResponse<MediaResponse>> associateMediaToArticle(
            @PathVariable Long mediaId,
            @PathVariable Long articleId) {

        MediaResponse media = mediaService.associateMediaToArticle(mediaId, articleId);
        return ResponseEntity.ok(ApiResponse.success("Mídia associada com sucesso", media));
    }

    /**
     * Atualiza alt text
     */
    @PutMapping("/{id}/alt-text")
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR', 'AUTHOR')")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Atualizar alt text", description = "Atualiza o texto alternativo da mídia")
    public ResponseEntity<ApiResponse<MediaResponse>> updateAltText(
            @PathVariable Long id,
            @RequestParam String altText) {

        MediaResponse media = mediaService.updateAltText(id, altText);
        return ResponseEntity.ok(ApiResponse.success("Alt text atualizado com sucesso", media));
    }

    /**
     * Calcula espaço usado
     */
    @GetMapping("/storage/used")
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Espaço usado", description = "Retorna o espaço total usado em bytes")
    public ResponseEntity<ApiResponse<Long>> getTotalStorageUsed() {
        Long totalBytes = mediaService.calculateTotalStorageUsed();
        return ResponseEntity.ok(ApiResponse.success(totalBytes));
    }

    /**
     * Deleta mídia
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Deletar mídia", description = "Remove uma mídia permanentemente")
    public ResponseEntity<ApiResponse<Void>> deleteMedia(@PathVariable Long id) {
        mediaService.deleteMedia(id);
        return ResponseEntity.ok(ApiResponse.success("Mídia deletada com sucesso", null));
    }
}
