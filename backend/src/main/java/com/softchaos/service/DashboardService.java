package com.softchaos.service;

import com.softchaos.dto.response.DashboardStatsResponse;
import com.softchaos.enums.CommentStatus;
import com.softchaos.model.Article;
import com.softchaos.model.Comment;
import com.softchaos.repository.ArticleRepository;
import com.softchaos.repository.CategoryRepository;
import com.softchaos.repository.CommentRepository;
import com.softchaos.repository.NewsletterRepository;
import com.softchaos.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class DashboardService {

    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final NewsletterRepository newsletterRepository;
    private final CategoryRepository categoryRepository;

    /**
     * Retorna todas as estatísticas do dashboard
     */
    public DashboardStatsResponse getDashboardStats() {
        log.info("Buscando estatísticas completas do dashboard");

        long totalActiveUsers = userRepository.findByActiveTrue(null).getTotalElements();

        return DashboardStatsResponse.builder()
                // Contadores gerais
                .totalArticles(articleRepository.count())
                .totalUsers(userRepository.count())
                .totalComments(commentRepository.count())
                .totalCategories(categoryRepository.count())

                // Artigos por status
                .publishedArticles(articleRepository.countByStatus(Article.Status.PUBLISHED))
                .draftArticles(articleRepository.countByStatus(Article.Status.DRAFT))
                .scheduledArticles(articleRepository.countByStatus(Article.Status.SCHEDULED))

                // Usuários por status
                .activeUsers(totalActiveUsers)
                .inactiveUsers(userRepository.count() - totalActiveUsers)

                // Comentários por status (CORRIGIDO: usando Enum)
                .pendingComments(commentRepository.countByStatus(CommentStatus.PENDING))
                .approvedComments(commentRepository.countByStatus(CommentStatus.APPROVED))

                // Listas
                .topArticles(getTopArticles())
                .recentArticles(getRecentArticles())
                .recentComments(getRecentComments())
                .build();
    }

    /**
     * Retorna os 5 artigos mais visualizados
     */
    private List<DashboardStatsResponse.TopArticle> getTopArticles() {
        Pageable topFive = PageRequest.of(0, 5);
        List<Article> articles = articleRepository.findByStatusOrderByViewCountDesc(
                Article.Status.PUBLISHED, topFive).getContent();

        return articles.stream()
                .map(article -> DashboardStatsResponse.TopArticle.builder()
                        .id(article.getId())
                        .title(article.getTitle())
                        .slug(article.getSlug())
                        .views(article.getViewCount())
                        .authorName(article.getAuthor().getName())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Retorna os 5 artigos mais recentes
     */
    private List<DashboardStatsResponse.RecentArticle> getRecentArticles() {
        Pageable topFive = PageRequest.of(0, 5);
        List<Article> articles = articleRepository.findAllByOrderByCreatedAtDesc(topFive).getContent();

        return articles.stream()
                .map(article -> DashboardStatsResponse.RecentArticle.builder()
                        .id(article.getId())
                        .title(article.getTitle())
                        .slug(article.getSlug())
                        .status(article.getStatus().name())
                        .authorName(article.getAuthor().getName())
                        .createdAt(article.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Retorna os 5 comentários mais recentes
     */
    private List<DashboardStatsResponse.RecentComment> getRecentComments() {
        Pageable topFive = PageRequest.of(0, 5);
        List<Comment> comments = commentRepository.findAllByOrderByCreatedAtDesc(topFive).getContent();

        return comments.stream()
                .map(comment -> DashboardStatsResponse.RecentComment.builder()
                        .id(comment.getId())
                        .content(comment.getContent().length() > 100
                                ? comment.getContent().substring(0, 100) + "..."
                                : comment.getContent())
                        .authorName(comment.getAuthorName())
                        .articleTitle(comment.getArticle().getTitle())
                        .status(comment.getStatus().name())
                        .createdAt(comment.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Retorna estatísticas gerais do sistema
     */
    public Map<String, Object> getGeneralStatistics() {
        log.info("Buscando estatísticas gerais");
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalArticles", articleRepository.count());
        stats.put("publishedArticles", articleRepository.countByStatus(Article.Status.PUBLISHED));
        stats.put("draftArticles", articleRepository.countByStatus(Article.Status.DRAFT));
        stats.put("scheduledArticles", articleRepository.countByStatus(Article.Status.SCHEDULED));
        stats.put("archivedArticles", articleRepository.countByStatus(Article.Status.ARCHIVED));

        stats.put("totalUsers", userRepository.count());
        stats.put("activeUsers", userRepository.findByActiveTrue(null).getTotalElements());

        stats.put("totalComments", commentRepository.count());
        // CORRIGIDO: usando Enum
        stats.put("pendingComments", commentRepository.countByStatus(CommentStatus.PENDING));

        stats.put("totalSubscribers", newsletterRepository.count());
        stats.put("activeSubscribers", newsletterRepository.countByActiveTrue());

        return stats;
    }

    /**
     * Retorna estatísticas de artigos
     */
    public Map<String, Object> getArticleStatistics() {
        log.info("Buscando estatísticas de artigos");
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalArticles", articleRepository.count());
        stats.put("published", articleRepository.countByStatus(Article.Status.PUBLISHED));
        stats.put("draft", articleRepository.countByStatus(Article.Status.DRAFT));
        stats.put("scheduled", articleRepository.countByStatus(Article.Status.SCHEDULED));
        stats.put("archived", articleRepository.countByStatus(Article.Status.ARCHIVED));

        return stats;
    }

    /**
     * Retorna estatísticas de usuários
     */
    public Map<String, Object> getUserStatistics() {
        log.info("Buscando estatísticas de usuários");
        Map<String, Object> stats = new HashMap<>();

        stats.put("total", userRepository.count());
        stats.put("active", userRepository.findByActiveTrue(null).getTotalElements());
        stats.put("admins", userRepository.findByRole(com.softchaos.model.User.Role.ADMIN, null).getTotalElements());
        stats.put("editors", userRepository.findByRole(com.softchaos.model.User.Role.EDITOR, null).getTotalElements());
        stats.put("authors", userRepository.findByRole(com.softchaos.model.User.Role.AUTHOR, null).getTotalElements());

        return stats;
    }

    /**
     * Retorna estatísticas de comentários
     */
    public Map<String, Object> getCommentStatistics() {
        log.info("Buscando estatísticas de comentários");
        Map<String, Object> stats = new HashMap<>();

        stats.put("total", commentRepository.count());
        // CORRIGIDO: usando Enum
        stats.put("pending", commentRepository.countByStatus(CommentStatus.PENDING));
        stats.put("approved", commentRepository.countByStatus(CommentStatus.APPROVED));

        return stats;
    }

    /**
     * Retorna estatísticas da newsletter
     */
    public Map<String, Object> getNewsletterStatistics() {
        log.info("Buscando estatísticas da newsletter");
        Map<String, Object> stats = new HashMap<>();

        stats.put("total", newsletterRepository.count());
        stats.put("active", newsletterRepository.countByActiveTrue());
        // Ajustado para o seu Repository (considerando que findByConfirmedAtIsNull retorna uma lista)
        stats.put("unconfirmed", newsletterRepository.findByConfirmedAtIsNull().size());

        return stats;
    }
}