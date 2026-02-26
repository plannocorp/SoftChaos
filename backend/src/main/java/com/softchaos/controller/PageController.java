package com.softchaos.controller;

import com.softchaos.dto.request.CreatePageRequest;
import com.softchaos.dto.request.UpdatePageRequest;
import com.softchaos.dto.response.ApiResponse;
import com.softchaos.dto.response.PageResponse;
import com.softchaos.service.PageService;
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
@RequestMapping("/api/pages")
@RequiredArgsConstructor
@Tag(name = "Páginas", description = "Gerenciamento de páginas estáticas")
public class PageController {

    private final PageService pageService;

    /**
     * Cria nova página
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Criar página", description = "Cria uma nova página estática")
    public ResponseEntity<ApiResponse<PageResponse>> createPage(
            @Valid @RequestBody CreatePageRequest request) {

        PageResponse page = pageService.createPage(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Página criada com sucesso", page));
    }

    /**
     * Busca página por ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Buscar página por ID", description = "Retorna detalhes de uma página")
    public ResponseEntity<ApiResponse<PageResponse>> getPageById(@PathVariable Long id) {
        PageResponse page = pageService.getPageById(id);
        return ResponseEntity.ok(ApiResponse.success(page));
    }

    /**
     * Busca página por slug
     */
    @GetMapping("/slug/{slug}")
    @Operation(summary = "Buscar página por slug", description = "Retorna página pela URL amigável")
    public ResponseEntity<ApiResponse<PageResponse>> getPageBySlug(@PathVariable String slug) {
        PageResponse page = pageService.getPageBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success(page));
    }

    /**
     * Lista todas as páginas
     */
    @GetMapping
    @Operation(summary = "Listar páginas", description = "Retorna todas as páginas")
    public ResponseEntity<ApiResponse<List<PageResponse>>> getAllPages() {
        List<PageResponse> pages = pageService.getAllPages();
        return ResponseEntity.ok(ApiResponse.success(pages));
    }

    /**
     * Lista páginas publicadas
     */
    @GetMapping("/published")
    @Operation(summary = "Páginas publicadas", description = "Retorna apenas páginas publicadas")
    public ResponseEntity<ApiResponse<List<PageResponse>>> getPublishedPages() {
        List<PageResponse> pages = pageService.getPublishedPages();
        return ResponseEntity.ok(ApiResponse.success(pages));
    }

    /**
     * Atualiza página
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Atualizar página", description = "Atualiza uma página existente")
    public ResponseEntity<ApiResponse<PageResponse>> updatePage(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePageRequest request) {

        PageResponse page = pageService.updatePage(id, request);
        return ResponseEntity.ok(ApiResponse.success("Página atualizada com sucesso", page));
    }

    /**
     * Deleta página
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Deletar página", description = "Remove uma página permanentemente")
    public ResponseEntity<ApiResponse<Void>> deletePage(@PathVariable Long id) {
        pageService.deletePage(id);
        return ResponseEntity.ok(ApiResponse.success("Página deletada com sucesso", null));
    }
}
