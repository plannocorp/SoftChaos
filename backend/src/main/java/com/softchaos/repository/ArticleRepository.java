package com.softchaos.repository;

import com.softchaos.model.Article;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {

    // ========== BUSCAR POR CAMPOS ==========

    /**
     * Buscar por slug
     */
    Optional<Article> findBySlug(String slug);

    Optional<Article> findBySlugAndStatus(String slug, Article.Status status);

    /**
     * Verifica se existe por slug
     */
    boolean existsBySlug(String slug);

    // ========== BUSCAR POR STATUS ==========

    /**
     * Buscar por status com ordenação por data de publicação
     */
    Page<Article> findByStatusOrderByPublishedAtDesc(Article.Status status, Pageable pageable);

    Page<Article> findByStatus(Article.Status status, Pageable pageable);

    Page<Article> findByAuthorIdAndStatus(Long authorId, Article.Status status, Pageable pageable);

    @Query("""
            SELECT a FROM Article a
            WHERE a.status = :status
              AND (:categoryId IS NULL OR a.category.id = :categoryId)
              AND a.publishedAt >= :startDate
              AND a.publishedAt < :endDate
            """)
    Page<Article> findByStatusWithFilters(
            @Param("status") Article.Status status,
            @Param("categoryId") Long categoryId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );

    @Query("""
            SELECT a FROM Article a
            WHERE a.author.id = :authorId
              AND a.status = :status
              AND (:categoryId IS NULL OR a.category.id = :categoryId)
              AND a.publishedAt >= :startDate
              AND a.publishedAt < :endDate
            """)
    Page<Article> findByAuthorIdAndStatusWithFilters(
            @Param("authorId") Long authorId,
            @Param("status") Article.Status status,
            @Param("categoryId") Long categoryId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );

    /**
     * Buscar por status com ordenação por visualizações
     */
    Page<Article> findByStatusOrderByViewCountDesc(Article.Status status, Pageable pageable);

    /**
     * Contar por status
     */
    Long countByStatus(Article.Status status);

    // ========== BUSCAR POR AUTOR ==========

    /**
     * Contar artigos por autor
     */
    Long countByAuthorId(Long authorId);

    /**
     * Contar artigos publicados por autor
     */
    @Query("SELECT COUNT(a) FROM Article a WHERE a.author.id = :authorId AND a.status = 'PUBLISHED'")
    Long countPublishedArticlesByAuthorId(@Param("authorId") Long authorId);

    // ========== BUSCAR POR CATEGORIA ==========

    /**
     * Buscar por categoria e status
     */
    Page<Article> findByCategoryIdAndStatus(Long categoryId, Article.Status status, Pageable pageable);

    /**
     * Contar artigos por categoria
     */
    Long countByCategoryId(Long categoryId);

    /**
     * Contar artigos publicados por categoria
     */
    @Query("SELECT COUNT(a) FROM Article a WHERE a.category.id = :categoryId AND a.status = 'PUBLISHED'")
    Long countPublishedArticlesByCategoryId(@Param("categoryId") Long categoryId);




    // ========== ARTIGOS EM DESTAQUE ==========

    /**
     * Buscar artigos em destaque
     */
    Page<Article> findByFeaturedTrueAndStatusOrderByPublishedAtDesc(Article.Status status, Pageable pageable);

    // ========== ARTIGOS FIXADOS ==========

    /**
     * Buscar artigos fixados
     */
    List<Article> findByPinnedTrueAndStatusOrderByPublishedAtDesc(Article.Status status);

    // ========== ARTIGOS MAIS VISUALIZADOS ==========

    /**
     * Buscar artigos mais visualizados (com query customizada)
     */
    @Query("SELECT a FROM Article a WHERE a.status = :status ORDER BY a.viewCount DESC")
    Page<Article> findMostViewed(@Param("status") Article.Status status, Pageable pageable);

    /**
     * Incrementar contador de visualizações
     */
    @Modifying
    @Query("UPDATE Article a SET a.viewCount = a.viewCount + 1 WHERE a.id = :id")
    void incrementViewCount(@Param("id") Long id);

    // ========== ÚLTIMOS ARTIGOS ==========

    /**
     * Buscar últimos artigos publicados
     */
    @Query("SELECT a FROM Article a WHERE a.status = 'PUBLISHED' ORDER BY a.publishedAt DESC")
    List<Article> findLatestPublished(Pageable pageable);

    /**
     * Buscar todos os artigos ordenados por data de criação
     */
    Page<Article> findAllByOrderByCreatedAtDesc(Pageable pageable);

    // ========== ARTIGOS RELACIONADOS ==========

    /**
     * Buscar artigos relacionados (mesma categoria, exceto o atual)
     */
    @Query("SELECT a FROM Article a WHERE a.category.id = :categoryId AND a.id != :articleId AND a.status = 'PUBLISHED' ORDER BY a.publishedAt DESC")
    List<Article> findRelatedArticles(@Param("categoryId") Long categoryId, @Param("articleId") Long articleId, Pageable pageable);

    // ========== BUSCA POR TERMO ==========

    /**
     * Buscar artigos por termo (título ou conteúdo)
     */
    @Query("SELECT a FROM Article a WHERE a.status = :status AND (LOWER(a.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(a.content) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<Article> searchArticles(@Param("searchTerm") String searchTerm, @Param("status") Article.Status status, Pageable pageable);

    // ========== ARTIGOS AGENDADOS ==========

    /**
     * Buscar artigos agendados para publicar
     */
    @Query("SELECT a FROM Article a WHERE a.status = 'SCHEDULED' AND a.scheduledFor <= :now")
    List<Article> findScheduledArticlesToPublish(@Param("now") LocalDateTime now);
}
