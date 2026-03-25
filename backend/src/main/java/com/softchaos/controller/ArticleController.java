package com.softchaos.controller;

import com.softchaos.dto.request.CreateArticleRequest;
import com.softchaos.dto.request.UpdateArticleRequest;
import com.softchaos.dto.response.ApiResponse;
import com.softchaos.dto.response.ArticleResponse;
import com.softchaos.dto.response.ArticleSummaryResponse;
import com.softchaos.dto.response.PagedResponse;
import com.softchaos.security.UserPrincipal;
import com.softchaos.service.ArticleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
@Tag(name = "Artigos", description = "Gerenciamento de artigos do blog")
public class ArticleController {

    private final ArticleService articleService;

    /**
     * Cria novo artigo
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR', 'AUTHOR')")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Criar artigo", description = "Cria um novo artigo (requer autenticação)")
    public ResponseEntity<ApiResponse<ArticleResponse>> createArticle(
            @Valid @RequestBody CreateArticleRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        ArticleResponse article = articleService.createArticle(request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Artigo criado com sucesso", article));
    }

    /**
     * Busca artigo por ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Buscar artigo por ID", description = "Retorna detalhes completos de um artigo")
    public ResponseEntity<ApiResponse<ArticleResponse>> getArticleById(@PathVariable Long id) {
        ArticleResponse article = articleService.getArticleById(id);
        return ResponseEntity.ok(ApiResponse.success(article));
    }

    /**
     * Busca artigo por slug
     */
    @GetMapping("/slug/{slug}")
    @Operation(summary = "Buscar artigo por slug", description = "Retorna artigo pela URL amigável")
    public ResponseEntity<ApiResponse<ArticleResponse>> getArticleBySlug(@PathVariable String slug) {
        ArticleResponse article = articleService.getArticleBySlug(slug);

        // Incrementa contador de visualizações
        articleService.incrementViewCount(article.getId());

        return ResponseEntity.ok(ApiResponse.success(article));
    }

    /**
     * Lista artigos publicados
     */
    @GetMapping
    @Operation(summary = "Listar artigos publicados", description = "Retorna lista paginada de artigos publicados")
    public ResponseEntity<ApiResponse<PagedResponse<ArticleSummaryResponse>>> getPublishedArticles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "publishedAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction) {

        Sort.Direction sortDirection = direction.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));

        PagedResponse<ArticleSummaryResponse> articles = articleService.getPublishedArticles(pageable);
        return ResponseEntity.ok(ApiResponse.success(articles));
    }

    /**
     * Lista artigos por categoria
     */
    @GetMapping("/category/{categoryId}")
    @Operation(summary = "Listar artigos por categoria", description = "Retorna artigos de uma categoria específica")
    public ResponseEntity<ApiResponse<PagedResponse<ArticleSummaryResponse>>> getArticlesByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<ArticleSummaryResponse> articles = articleService.getArticlesByCategory(categoryId, pageable);
        return ResponseEntity.ok(ApiResponse.success(articles));
    }


    /**
     * Lista artigos por autor
     */
    @GetMapping("/author/{authorId}")
    @Operation(summary = "Listar artigos por autor", description = "Retorna artigos de um autor específico")
    public ResponseEntity<ApiResponse<PagedResponse<ArticleSummaryResponse>>> getArticlesByAuthor(
            @PathVariable Long authorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<ArticleSummaryResponse> articles = articleService.getArticlesByAuthor(authorId, pageable);
        return ResponseEntity.ok(ApiResponse.success(articles));
    }

    /**
     * Lista artigos em destaque
     */
    @GetMapping("/featured")
    @Operation(summary = "Listar artigos em destaque", description = "Retorna artigos marcados como destaque")
    public ResponseEntity<ApiResponse<PagedResponse<ArticleSummaryResponse>>> getFeaturedArticles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size) {

        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<ArticleSummaryResponse> articles = articleService.getFeaturedArticles(pageable);
        return ResponseEntity.ok(ApiResponse.success(articles));
    }

    /**
     * Lista artigos fixados
     */
    @GetMapping("/pinned")
    @Operation(summary = "Listar artigos fixados", description = "Retorna artigos fixados no topo")
    public ResponseEntity<ApiResponse<List<ArticleSummaryResponse>>> getPinnedArticles() {
        List<ArticleSummaryResponse> articles = articleService.getPinnedArticles();
        return ResponseEntity.ok(ApiResponse.success(articles));
    }

    /**
     * Lista artigos mais lidos
     */
    @GetMapping("/most-viewed")
    @Operation(summary = "Artigos mais lidos", description = "Retorna artigos com mais visualizações")
    public ResponseEntity<ApiResponse<PagedResponse<ArticleSummaryResponse>>> getMostViewedArticles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<ArticleSummaryResponse> articles = articleService.getMostViewedArticles(pageable);
        return ResponseEntity.ok(ApiResponse.success(articles));
    }

    /**
     * Lista últimos artigos publicados
     */
    @GetMapping("/latest")
    @Operation(summary = "Últimos artigos", description = "Retorna os artigos mais recentes")
    public ResponseEntity<ApiResponse<List<ArticleSummaryResponse>>> getLatestArticles(
            @RequestParam(defaultValue = "5") int limit) {

        List<ArticleSummaryResponse> articles = articleService.getLatestPublishedArticles(limit);
        return ResponseEntity.ok(ApiResponse.success(articles));
    }

    /**
     * Busca artigos relacionados
     */
    @GetMapping("/{id}/related")
    @Operation(summary = "Artigos relacionados", description = "Retorna artigos relacionados (mesma categoria)")
    public ResponseEntity<ApiResponse<List<ArticleSummaryResponse>>> getRelatedArticles(
            @PathVariable Long id,
            @RequestParam(defaultValue = "4") int limit) {

        List<ArticleSummaryResponse> articles = articleService.getRelatedArticles(id, limit);
        return ResponseEntity.ok(ApiResponse.success(articles));
    }

    /**
     * Busca artigos por termo
     */
    @GetMapping("/search")
    @Operation(summary = "Buscar artigos", description = "Busca artigos por termo (título, resumo ou conteúdo)")
    public ResponseEntity<ApiResponse<PagedResponse<ArticleSummaryResponse>>> searchArticles(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<ArticleSummaryResponse> articles = articleService.searchArticles(q, pageable);
        return ResponseEntity.ok(ApiResponse.success(articles));
    }

    /**
     * Atualiza artigo
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR', 'AUTHOR')")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Atualizar artigo", description = "Atualiza um artigo existente")
    public ResponseEntity<ApiResponse<ArticleResponse>> updateArticle(
            @PathVariable Long id,
            @Valid @RequestBody UpdateArticleRequest request) {

        ArticleResponse article = articleService.updateArticle(id, request);
        return ResponseEntity.ok(ApiResponse.success("Artigo atualizado com sucesso", article));
    }

    /**
     * Publica artigo agendado
     */
    @PostMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Publicar artigo agendado", description = "Publica um artigo agendado imediatamente")
    public ResponseEntity<ApiResponse<Void>> publishScheduledArticle(@PathVariable Long id) {
        articleService.publishScheduledArticle(id);
        return ResponseEntity.ok(ApiResponse.success("Artigo publicado com sucesso", null));
    }

    /**
     * Arquiva artigo
     */
    @PostMapping("/{id}/archive")
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Arquivar artigo", description = "Move artigo para arquivados")
    public ResponseEntity<ApiResponse<Void>> archiveArticle(@PathVariable Long id) {
        articleService.archiveArticle(id);
        return ResponseEntity.ok(ApiResponse.success("Artigo arquivado com sucesso", null));
    }

    /**
     * Deleta artigo
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Deletar artigo", description = "Remove um artigo permanentemente")
    public ResponseEntity<ApiResponse<Void>> deleteArticle(@PathVariable Long id) {
        articleService.deleteArticle(id);
        return ResponseEntity.ok(ApiResponse.success("Artigo deletado com sucesso", null));
    }
}
