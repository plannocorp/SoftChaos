package com.softchaos.controller;

import com.softchaos.dto.request.CreateTagRequest;
import com.softchaos.dto.request.UpdateTagRequest;
import com.softchaos.dto.response.ApiResponse;
import com.softchaos.dto.response.TagResponse;
import com.softchaos.service.TagService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
@Tag(name = "Tags", description = "Gerenciamento de tags")
public class TagController {

    private final TagService tagService;

    /**
     * Cria nova tag
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Criar tag", description = "Cria uma nova tag")
    public ResponseEntity<ApiResponse<TagResponse>> createTag(
            @Valid @RequestBody CreateTagRequest request) {

        TagResponse tag = tagService.createTag(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tag criada com sucesso", tag));
    }

    /**
     * Busca tag por ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Buscar tag por ID", description = "Retorna detalhes de uma tag")
    public ResponseEntity<ApiResponse<TagResponse>> getTagById(@PathVariable Long id) {
        TagResponse tag = tagService.getTagById(id);
        return ResponseEntity.ok(ApiResponse.success(tag));
    }

    /**
     * Busca tag por slug
     */
    @GetMapping("/slug/{slug}")
    @Operation(summary = "Buscar tag por slug", description = "Retorna tag pela URL amigável")
    public ResponseEntity<ApiResponse<TagResponse>> getTagBySlug(@PathVariable String slug) {
        TagResponse tag = tagService.getTagBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success(tag));
    }

    /**
     * Lista todas as tags
     */
    @GetMapping
    @Operation(summary = "Listar tags", description = "Retorna todas as tags")
    public ResponseEntity<ApiResponse<List<TagResponse>>> getAllTags() {
        List<TagResponse> tags = tagService.getAllTags();
        return ResponseEntity.ok(ApiResponse.success(tags));
    }

    /**
     * Lista tags mais usadas
     */
    @GetMapping("/popular")
    @Operation(summary = "Tags populares", description = "Retorna as tags mais usadas")
    public ResponseEntity<ApiResponse<List<TagResponse>>> getMostUsedTags(
            @RequestParam(defaultValue = "10") int limit) {

        List<TagResponse> tags = tagService.getMostUsedTags(limit);
        return ResponseEntity.ok(ApiResponse.success(tags));
    }

    /**
     * Busca tags por nome (autocomplete)
     */
    @GetMapping("/search")
    @Operation(summary = "Buscar tags", description = "Busca tags por nome (para autocomplete)")
    public ResponseEntity<ApiResponse<List<TagResponse>>> searchTags(@RequestParam String q) {
        List<TagResponse> tags = tagService.searchTagsByName(q);
        return ResponseEntity.ok(ApiResponse.success(tags));
    }

    /**
     * Atualiza tag
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Atualizar tag", description = "Atualiza uma tag existente")
    public ResponseEntity<ApiResponse<TagResponse>> updateTag(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTagRequest request) {

        TagResponse tag = tagService.updateTag(id, request);
        return ResponseEntity.ok(ApiResponse.success("Tag atualizada com sucesso", tag));
    }

    /**
     * Deleta tag
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Deletar tag", description = "Remove uma tag")
    public ResponseEntity<ApiResponse<Void>> deleteTag(@PathVariable Long id) {
        tagService.deleteTag(id);
        return ResponseEntity.ok(ApiResponse.success("Tag deletada com sucesso", null));
    }
}
