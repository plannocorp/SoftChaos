package com.softchaos.service;

import com.softchaos.config.DatabaseSequenceSynchronizer;
import com.softchaos.dto.mapper.ArticleMapper;
import com.softchaos.dto.response.ArticleSummaryResponse;
import com.softchaos.dto.response.PagedResponse;
import com.softchaos.model.Article;
import com.softchaos.model.User;
import com.softchaos.repository.ArticleRepository;
import com.softchaos.repository.CategoryRepository;
import com.softchaos.repository.CommentRepository;
import com.softchaos.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ArticleServiceTest {

    @Mock
    private ArticleRepository articleRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private CommentRepository commentRepository;
    @Mock
    private ArticleMapper articleMapper;
    @Mock
    private DatabaseSequenceSynchronizer databaseSequenceSynchronizer;

    @InjectMocks
    private ArticleService articleService;

    @Test
    void publishScheduledArticleShouldClearScheduledDateAndSetPublishedAt() {
        Article article = new Article();
        article.setId(10L);
        article.setStatus(Article.Status.SCHEDULED);
        article.setScheduledFor(LocalDateTime.now().plusDays(1));

        when(articleRepository.findById(10L)).thenReturn(Optional.of(article));

        articleService.publishScheduledArticle(10L);

        assertEquals(Article.Status.PUBLISHED, article.getStatus());
        assertNull(article.getScheduledFor());
        assertNotNull(article.getPublishedAt());
        verify(articleRepository).save(article);
    }

    @Test
    void processScheduledArticlesShouldPublishAllReadyArticles() {
        Article first = new Article();
        first.setId(1L);
        first.setStatus(Article.Status.SCHEDULED);
        first.setScheduledFor(LocalDateTime.now().minusMinutes(10));

        Article second = new Article();
        second.setId(2L);
        second.setStatus(Article.Status.SCHEDULED);
        second.setScheduledFor(LocalDateTime.now().minusMinutes(5));

        when(articleRepository.findScheduledArticlesToPublish(org.mockito.ArgumentMatchers.any(LocalDateTime.class)))
                .thenReturn(List.of(first, second));

        articleService.processScheduledArticles();

        assertEquals(Article.Status.PUBLISHED, first.getStatus());
        assertEquals(Article.Status.PUBLISHED, second.getStatus());
        assertNull(first.getScheduledFor());
        assertNull(second.getScheduledFor());
        assertNotNull(first.getPublishedAt());
        assertNotNull(second.getPublishedAt());
        verify(articleRepository, times(2)).save(org.mockito.ArgumentMatchers.any(Article.class));
    }

    @Test
    void getAdminArticlesByStatusShouldResolveDefaultPublishedDateRangeForAdmin() {
        Article article = new Article();
        article.setId(7L);

        Page<Article> articlesPage = new PageImpl<>(List.of(article), PageRequest.of(0, 9), 1);
        ArticleSummaryResponse summary = ArticleSummaryResponse.builder()
                .id(7L)
                .title("Publicado")
                .build();

        when(articleRepository.findByStatusWithFilters(
                eq(Article.Status.PUBLISHED),
                eq(null),
                eq(LocalDate.of(1970, 1, 1).atStartOfDay()),
                eq(LocalDate.of(3000, 1, 1).atStartOfDay()),
                any(PageRequest.class)
        )).thenReturn(articlesPage);
        when(commentRepository.countByArticleIdAndStatus(eq(7L), any())).thenReturn(0L);
        when(articleMapper.toSummaryResponse(article, 0L)).thenReturn(summary);

        PagedResponse<ArticleSummaryResponse> response = articleService.getAdminArticlesByStatus(
                Article.Status.PUBLISHED,
                1L,
                User.Role.ADMIN,
                null,
                null,
                null,
                PageRequest.of(0, 9)
        );

        assertEquals(1, response.getContent().size());
        verify(articleRepository).findByStatusWithFilters(
                eq(Article.Status.PUBLISHED),
                eq(null),
                eq(LocalDate.of(1970, 1, 1).atStartOfDay()),
                eq(LocalDate.of(3000, 1, 1).atStartOfDay()),
                any(PageRequest.class)
        );
        verify(articleRepository, never()).findByStatus(eq(Article.Status.PUBLISHED), any(PageRequest.class));
    }

    @Test
    void getAdminArticlesByStatusShouldUseProvidedPublishedFiltersForAuthor() {
        Article article = new Article();
        article.setId(8L);

        LocalDateTime startDate = LocalDate.of(2026, 4, 1).atStartOfDay();
        LocalDateTime endDate = LocalDate.of(2026, 4, 30).atTime(23, 59);
        Page<Article> articlesPage = new PageImpl<>(List.of(article), PageRequest.of(0, 9), 1);
        ArticleSummaryResponse summary = ArticleSummaryResponse.builder()
                .id(8L)
                .title("Filtrado")
                .build();

        when(articleRepository.findByAuthorIdAndStatusWithFilters(
                eq(3L),
                eq(Article.Status.PUBLISHED),
                eq(5L),
                eq(startDate),
                eq(endDate),
                any(PageRequest.class)
        )).thenReturn(articlesPage);
        when(commentRepository.countByArticleIdAndStatus(eq(8L), any())).thenReturn(0L);
        when(articleMapper.toSummaryResponse(article, 0L)).thenReturn(summary);

        PagedResponse<ArticleSummaryResponse> response = articleService.getAdminArticlesByStatus(
                Article.Status.PUBLISHED,
                3L,
                User.Role.AUTHOR,
                5L,
                startDate,
                endDate,
                PageRequest.of(0, 9)
        );

        assertEquals(1, response.getContent().size());
        verify(articleRepository).findByAuthorIdAndStatusWithFilters(
                eq(3L),
                eq(Article.Status.PUBLISHED),
                eq(5L),
                eq(startDate),
                eq(endDate),
                any(PageRequest.class)
        );
        verify(articleRepository, never()).findByAuthorIdAndStatus(eq(3L), eq(Article.Status.PUBLISHED), any(PageRequest.class));
    }

    @Test
    void getAdminArticlesByStatusShouldUseSimpleStatusQueryForNonPublishedAdmin() {
        Article article = new Article();
        article.setId(9L);

        Page<Article> articlesPage = new PageImpl<>(List.of(article), PageRequest.of(0, 9), 1);
        ArticleSummaryResponse summary = ArticleSummaryResponse.builder()
                .id(9L)
                .title("Rascunho")
                .build();

        when(articleRepository.findByStatus(eq(Article.Status.DRAFT), any(PageRequest.class))).thenReturn(articlesPage);
        when(commentRepository.countByArticleIdAndStatus(eq(9L), any())).thenReturn(0L);
        when(articleMapper.toSummaryResponse(article, 0L)).thenReturn(summary);

        PagedResponse<ArticleSummaryResponse> response = articleService.getAdminArticlesByStatus(
                Article.Status.DRAFT,
                1L,
                User.Role.ADMIN,
                2L,
                LocalDate.of(2026, 4, 1).atStartOfDay(),
                LocalDate.of(2026, 4, 10).atStartOfDay(),
                PageRequest.of(0, 9)
        );

        assertEquals(1, response.getContent().size());
        verify(articleRepository).findByStatus(eq(Article.Status.DRAFT), any(PageRequest.class));
        verify(articleRepository, never()).findByStatusWithFilters(
                eq(Article.Status.DRAFT),
                eq(2L),
                any(LocalDateTime.class),
                any(LocalDateTime.class),
                any(PageRequest.class)
        );
    }
}
