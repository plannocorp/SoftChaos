package com.softchaos.service;

import com.softchaos.config.DatabaseSequenceSynchronizer;
import com.softchaos.dto.mapper.ArticleMapper;
import com.softchaos.dto.request.CreateArticleRequest;
import com.softchaos.dto.request.UpdateArticleRequest;
import com.softchaos.dto.response.ArticleResponse;
import com.softchaos.dto.response.ArticleSummaryResponse;
import com.softchaos.dto.response.PagedResponse;
import com.softchaos.enums.CommentStatus;
import com.softchaos.exception.BadRequestException;
import com.softchaos.exception.ResourceNotFoundException;
import com.softchaos.model.Article;
import com.softchaos.model.Category;
import com.softchaos.model.User;
import com.softchaos.repository.ArticleRepository;
import com.softchaos.repository.CategoryRepository;
import com.softchaos.repository.CommentRepository;
import com.softchaos.repository.UserRepository;
import com.softchaos.util.SlugGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.URISyntaxException;
import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final CommentRepository commentRepository;
    private final ArticleMapper articleMapper;
    private final DatabaseSequenceSynchronizer databaseSequenceSynchronizer;

    /**
     * Cria um novo artigo
     */
    public ArticleResponse createArticle(CreateArticleRequest request, Long authorId) {
        log.info("Criando novo artigo: {} por autor ID: {}", request.getTitle(), authorId);

        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", "id", authorId));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoria", "id", request.getCategoryId()));

        validateScheduledPublication(request.getStatus(), request.getScheduledFor());
        request.setExternalVideoLinks(normalizeExternalVideoLinks(request.getExternalVideoLinks()));

        String slug = generateUniqueSlug(request.getTitle());

        Article article = articleMapper.toEntity(request);
        article.setSlug(slug);
        article.setAuthor(author);
        article.setCategory(category);

        if (article.getStatus() == Article.Status.PUBLISHED) {
            article.setPublishedAt(LocalDateTime.now());
        }

        databaseSequenceSynchronizer.synchronizeArticlesSequence();
        Article savedArticle = articleRepository.save(article);
        log.info("Artigo criado com sucesso. ID: {}, Slug: {}", savedArticle.getId(), savedArticle.getSlug());

        return articleMapper.toResponse(savedArticle, 0L);
    }

    /**
     * Busca artigo por ID
     */
    @Transactional(readOnly = true)
    public ArticleResponse getArticleById(Long id) {
        log.info("Buscando artigo por ID: {}", id);

        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Artigo", "id", id));

        Long commentsCount = commentRepository.countByArticleIdAndStatus(article.getId(), CommentStatus.APPROVED);
        return articleMapper.toResponse(article, commentsCount);
    }

    /**
     * Busca artigo por slug
     */
    public ArticleResponse getArticleBySlug(String slug) {
        log.info("Buscando artigo por slug: {}", slug);

        Article article = articleRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Artigo", "slug", slug));

        articleRepository.incrementViewCount(article.getId());
        article.setViewCount(article.getViewCount() + 1);

        Long commentsCount = commentRepository.countByArticleIdAndStatus(article.getId(), CommentStatus.APPROVED);
        return articleMapper.toResponse(article, commentsCount);
    }

    /**
     * Incrementa visualizações do artigo
     */
    public void incrementViewCount(Long id) {
        log.debug("Incrementando visualizações do artigo ID: {}", id);
        articleRepository.incrementViewCount(id);
    }

    /**
     * Lista artigos publicados
     */
    @Transactional(readOnly = true)
    public PagedResponse<ArticleSummaryResponse> getPublishedArticles(Pageable pageable) {
        log.info("Listando artigos publicados");
        Page<Article> articlesPage = articleRepository.findByStatusOrderByPublishedAtDesc(
                Article.Status.PUBLISHED, pageable);
        return buildPagedSummaryResponse(articlesPage);
    }

    /**
     * Lista artigos por categoria
     */
    @Transactional(readOnly = true)
    public PagedResponse<ArticleSummaryResponse> getArticlesByCategory(Long categoryId, Pageable pageable) {
        log.info("Listando artigos da categoria ID: {}", categoryId);
        if (!categoryRepository.existsById(categoryId)) {
            throw new ResourceNotFoundException("Categoria", "id", categoryId);
        }
        Page<Article> articlesPage = articleRepository.findByCategoryIdAndStatus(
                categoryId, Article.Status.PUBLISHED, pageable);
        return buildPagedSummaryResponse(articlesPage);
    }

    /**
     * Lista artigos por autor
     */
    @Transactional(readOnly = true)
    public PagedResponse<ArticleSummaryResponse> getArticlesByAuthor(Long authorId, Pageable pageable) {
        log.info("Listando artigos do autor ID: {}", authorId);
        if (!userRepository.existsById(authorId)) {
            throw new ResourceNotFoundException("Usuário", "id", authorId);
        }
        Page<Article> articlesPage = articleRepository.findByAuthorIdAndStatus(
                authorId, Article.Status.PUBLISHED, pageable);
        return buildPagedSummaryResponse(articlesPage);
    }

    /**
     * Lista artigos em destaque
     */
    @Transactional(readOnly = true)
    public PagedResponse<ArticleSummaryResponse> getFeaturedArticles(Pageable pageable) {
        log.info("Listando artigos em destaque");
        Page<Article> articlesPage = articleRepository.findByFeaturedTrueAndStatusOrderByPublishedAtDesc(
                Article.Status.PUBLISHED, pageable);
        return buildPagedSummaryResponse(articlesPage);
    }

    /**
     * Lista artigos fixados
     */
    @Transactional(readOnly = true)
    public List<ArticleSummaryResponse> getPinnedArticles() {
        log.info("Listando artigos fixados");
        return articleRepository.findByPinnedTrueAndStatusOrderByPublishedAtDesc(Article.Status.PUBLISHED)
                .stream()
                .map(article -> {
                    Long commentsCount = commentRepository.countByArticleIdAndStatus(article.getId(), CommentStatus.APPROVED);
                    return articleMapper.toSummaryResponse(article, commentsCount);
                })
                .collect(Collectors.toList());
    }

    /**
     * Lista artigos mais lidos
     */
    @Transactional(readOnly = true)
    public PagedResponse<ArticleSummaryResponse> getMostViewedArticles(Pageable pageable) {
        log.info("Listando artigos mais lidos");
        Page<Article> articlesPage = articleRepository.findMostViewed(Article.Status.PUBLISHED, pageable);
        return buildPagedSummaryResponse(articlesPage);
    }

    /**
     * Lista últimos artigos publicados (para homepage)
     */
    @Transactional(readOnly = true)
    public List<ArticleSummaryResponse> getLatestPublishedArticles(int limit) {
        log.info("Listando {} últimos artigos publicados", limit);
        Pageable pageable = PageRequest.of(0, limit);
        return articleRepository.findLatestPublished(pageable).stream()
                .map(article -> {
                    Long commentsCount = commentRepository.countByArticleIdAndStatus(article.getId(), CommentStatus.APPROVED);
                    return articleMapper.toSummaryResponse(article, commentsCount);
                })
                .collect(Collectors.toList());
    }

    /**
     * Busca artigos relacionados (mesma categoria)
     */
    @Transactional(readOnly = true)
    public List<ArticleSummaryResponse> getRelatedArticles(Long articleId, int limit) {
        log.info("Buscando artigos relacionados ao artigo ID: {}", articleId);
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new ResourceNotFoundException("Artigo", "id", articleId));

        Pageable pageable = PageRequest.of(0, limit);
        return articleRepository.findRelatedArticles(article.getCategory().getId(), articleId, pageable)
                .stream()
                .map(relatedArticle -> {
                    Long commentsCount = commentRepository.countByArticleIdAndStatus(relatedArticle.getId(), CommentStatus.APPROVED);
                    return articleMapper.toSummaryResponse(relatedArticle, commentsCount);
                })
                .collect(Collectors.toList());
    }

    /**
     * Busca artigos por termo
     */
    @Transactional(readOnly = true)
    public PagedResponse<ArticleSummaryResponse> searchArticles(String searchTerm, Pageable pageable) {
        log.info("Buscando artigos com termo: {}", searchTerm);
        Page<Article> articlesPage = articleRepository.searchArticles(
                searchTerm, Article.Status.PUBLISHED, pageable);
        return buildPagedSummaryResponse(articlesPage);
    }

    /**
     * Lista artigos do painel por status
     */
    @Transactional(readOnly = true)
    public PagedResponse<ArticleSummaryResponse> getAdminArticlesByStatus(
            Article.Status status,
            Long userId,
            User.Role role,
            Pageable pageable
    ) {
        log.info("Listando artigos do painel. Status: {}, Usuario: {}, Role: {}", status, userId, role);

        Page<Article> articlesPage = role == User.Role.AUTHOR
                ? articleRepository.findByAuthorIdAndStatus(userId, status, pageable)
                : articleRepository.findByStatus(status, pageable);

        return buildPagedSummaryResponse(articlesPage);
    }

    /**
     * Atualiza artigo
     */
    public ArticleResponse updateArticle(Long id, UpdateArticleRequest request) {
        log.info("Atualizando artigo ID: {}", id);
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Artigo", "id", id));

        Article.Status targetStatus = request.getStatus() != null ? request.getStatus() : article.getStatus();
        LocalDateTime targetScheduledFor = targetStatus == Article.Status.SCHEDULED
                ? (request.getScheduledFor() != null ? request.getScheduledFor() : article.getScheduledFor())
                : null;
        validateScheduledPublication(targetStatus, targetScheduledFor);

        if (request.getExternalVideoLinks() != null) {
            request.setExternalVideoLinks(normalizeExternalVideoLinks(request.getExternalVideoLinks()));
        }

        if (request.getTitle() != null && !request.getTitle().equals(article.getTitle())) {
            article.setSlug(generateUniqueSlug(request.getTitle()));
        }

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Categoria", "id", request.getCategoryId()));
            article.setCategory(category);
        }

        if (request.getStatus() != null) {
            Article.Status oldStatus = article.getStatus();
            Article.Status newStatus = request.getStatus();
            if (oldStatus != Article.Status.PUBLISHED && newStatus == Article.Status.PUBLISHED) {
                article.setPublishedAt(LocalDateTime.now());
            }
        }

        articleMapper.updateEntity(article, request);
        Article updatedArticle = articleRepository.save(article);

        Long commentsCount = commentRepository.countByArticleIdAndStatus(updatedArticle.getId(), CommentStatus.APPROVED);
        return articleMapper.toResponse(updatedArticle, commentsCount);
    }

    /**
     * Publica artigo agendado
     */
    public void publishScheduledArticle(Long id) {
        log.info("Publicando artigo agendado ID: {}", id);
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Artigo", "id", id));

        if (article.getStatus() != Article.Status.SCHEDULED) {
            throw new BadRequestException("Apenas artigos agendados podem ser publicados por este método");
        }

        article.setStatus(Article.Status.PUBLISHED);
        article.setPublishedAt(LocalDateTime.now());
        articleRepository.save(article);
    }

    /**
     * Processa artigos agendados (chamado por job)
     */
    public void processScheduledArticles() {
        log.info("Processando artigos agendados");
        List<Article> scheduledArticles = articleRepository.findScheduledArticlesToPublish(LocalDateTime.now());
        for (Article article : scheduledArticles) {
            article.setStatus(Article.Status.PUBLISHED);
            article.setPublishedAt(LocalDateTime.now());
            articleRepository.save(article);
        }
    }

    /**
     * Arquiva artigo
     */
    public void archiveArticle(Long id) {
        log.info("Arquivando artigo ID: {}", id);
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Artigo", "id", id));

        article.setStatus(Article.Status.ARCHIVED);
        articleRepository.save(article);
    }

    /**
     * Deleta artigo
     */
    public void deleteArticle(Long id) {
        log.info("Deletando artigo ID: {}", id);
        if (!articleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Artigo", "id", id);
        }
        articleRepository.deleteById(id);
    }

    /**
     * Conta artigos por status
     */
    @Transactional(readOnly = true)
    public Long countArticlesByStatus(Article.Status status) {
        return articleRepository.countByStatus(status);
    }

    /**
     * Gera slug único para artigo
     */
    private String generateUniqueSlug(String title) {
        String baseSlug = SlugGenerator.toSlug(title);
        String slug = baseSlug;
        int suffix = 0;
        while (articleRepository.existsBySlug(slug)) {
            suffix++;
            slug = SlugGenerator.toUniqueSlug(baseSlug, suffix);
        }
        return slug;
    }

    /**
     * Método auxiliar para construir resposta paginada resumida
     */
    private void validateScheduledPublication(Article.Status status, LocalDateTime scheduledFor) {
        if (status == Article.Status.SCHEDULED && scheduledFor == null) {
            throw new BadRequestException("Defina a data de publicacao para artigos agendados");
        }
    }

    private List<String> normalizeExternalVideoLinks(List<String> rawLinks) {
        if (rawLinks == null || rawLinks.isEmpty()) {
            return List.of();
        }

        List<String> sanitizedLinks = rawLinks.stream()
                .filter(link -> link != null && !link.isBlank())
                .map(String::trim)
                .collect(Collectors.collectingAndThen(
                        Collectors.toCollection(LinkedHashSet::new),
                        List::copyOf
                ));

        if (sanitizedLinks.size() > 5) {
            throw new BadRequestException("Voce pode adicionar no maximo 5 links externos de video");
        }

        sanitizedLinks.forEach(this::validateExternalVideoLink);
        return sanitizedLinks;
    }

    private void validateExternalVideoLink(String link) {
        try {
            URI uri = new URI(link);
            String host = uri.getHost() == null ? "" : uri.getHost().toLowerCase(Locale.ROOT);

            boolean supportedHost = host.equals("youtube.com")
                    || host.equals("www.youtube.com")
                    || host.equals("m.youtube.com")
                    || host.equals("youtu.be")
                    || host.equals("www.youtu.be")
                    || host.equals("instagram.com")
                    || host.equals("www.instagram.com");

            if (!supportedHost) {
                throw new BadRequestException("Use apenas links do YouTube ou Instagram");
            }
        } catch (URISyntaxException ex) {
            throw new BadRequestException("Informe links externos validos para os videos");
        }
    }

    private PagedResponse<ArticleSummaryResponse> buildPagedSummaryResponse(Page<Article> articlesPage) {
        Page<ArticleSummaryResponse> responsePage = articlesPage.map(article -> {
            Long commentsCount = commentRepository.countByArticleIdAndStatus(article.getId(), CommentStatus.APPROVED);
            return articleMapper.toSummaryResponse(article, commentsCount);
        });

        return PagedResponse.<ArticleSummaryResponse>builder()
                .content(responsePage.getContent())
                .pageNumber(responsePage.getNumber())
                .pageSize(responsePage.getSize())
                .totalElements(responsePage.getTotalElements())
                .totalPages(responsePage.getTotalPages())
                .last(responsePage.isLast())
                .build();
    }
}
