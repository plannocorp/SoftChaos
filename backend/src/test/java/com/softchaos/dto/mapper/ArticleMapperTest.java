package com.softchaos.dto.mapper;

import com.softchaos.dto.request.CreateArticleRequest;
import com.softchaos.dto.request.UpdateArticleRequest;
import com.softchaos.model.Article;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;

class ArticleMapperTest {

    private final ArticleMapper articleMapper = new ArticleMapper(
            mock(UserMapper.class),
            mock(CategoryMapper.class),
            mock(MediaMapper.class)
    );

    @Test
    void toEntityShouldCreateMutableExternalVideoLinksCollection() {
        CreateArticleRequest request = CreateArticleRequest.builder()
                .title("Titulo")
                .content("Conteudo")
                .categoryId(1L)
                .status(Article.Status.DRAFT)
                .externalVideoLinks(List.of("https://example.com/video"))
                .build();

        Article article = articleMapper.toEntity(request);

        assertDoesNotThrow(() -> article.getExternalVideoLinks().add("https://example.com/outro-video"));
        assertEquals(2, article.getExternalVideoLinks().size());
    }

    @Test
    void updateEntityShouldReplaceExternalVideoLinksWithMutableCollection() {
        Article article = new Article();
        article.setExternalVideoLinks(new java.util.ArrayList<>(List.of("https://example.com/original")));

        UpdateArticleRequest request = UpdateArticleRequest.builder()
                .externalVideoLinks(List.of("https://example.com/novo"))
                .build();

        articleMapper.updateEntity(article, request);

        assertDoesNotThrow(() -> article.getExternalVideoLinks().add("https://example.com/extra"));
        assertTrue(article.getExternalVideoLinks().contains("https://example.com/novo"));
        assertTrue(article.getExternalVideoLinks().contains("https://example.com/extra"));
    }
}
