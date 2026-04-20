package com.softchaos.service;

import com.softchaos.config.DatabaseSequenceSynchronizer;
import com.softchaos.dto.mapper.ArticleMapper;
import com.softchaos.model.Article;
import com.softchaos.repository.ArticleRepository;
import com.softchaos.repository.CategoryRepository;
import com.softchaos.repository.CommentRepository;
import com.softchaos.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
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
}
