package com.softchaos.dto.mapper;

import com.softchaos.dto.request.CreateArticleRequest;
import com.softchaos.dto.request.UpdateArticleRequest;
import com.softchaos.dto.response.ArticleResponse;
import com.softchaos.dto.response.ArticleSummaryResponse;
import com.softchaos.model.Article;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ArticleMapper {

    private final UserMapper userMapper;
    private final CategoryMapper categoryMapper;
    private final TagMapper tagMapper;
    private final MediaMapper mediaMapper;

    public ArticleResponse toResponse(Article article, Long commentsCount) {
        return ArticleResponse.builder()
                .id(article.getId())
                .title(article.getTitle())
                .slug(article.getSlug())
                .summary(article.getSummary())
                .content(article.getContent())
                .coverImageUrl(article.getCoverImageUrl())
                .author(userMapper.toSummaryResponse(article.getAuthor()))
                .category(categoryMapper.toResponse(article.getCategory(), null))
                .tags(article.getTags().stream()
                        .map(tag -> tagMapper.toResponse(tag, null))
                        .collect(Collectors.toSet()))
                .mediaFiles(article.getMediaFiles().stream()
                        .map(mediaMapper::toResponse)
                        .collect(Collectors.toSet()))
                .status(article.getStatus())
                .featured(article.getFeatured())
                .pinned(article.getPinned())
                .viewCount(article.getViewCount())
                .commentsCount(commentsCount)
                .publishedAt(article.getPublishedAt())
                .scheduledFor(article.getScheduledFor())
                .createdAt(article.getCreatedAt())
                .updatedAt(article.getUpdatedAt())
                .build();
    }

    public ArticleSummaryResponse toSummaryResponse(Article article, Long commentsCount) {
        return ArticleSummaryResponse.builder()
                .id(article.getId())
                .title(article.getTitle())
                .slug(article.getSlug())
                .summary(article.getSummary())
                .coverImageUrl(article.getCoverImageUrl())
                .author(userMapper.toSummaryResponse(article.getAuthor()))
                .category(categoryMapper.toResponse(article.getCategory(), null))
                .status(article.getStatus())
                .featured(article.getFeatured())
                .pinned(article.getPinned())
                .viewCount(article.getViewCount())
                .commentsCount(commentsCount)
                .publishedAt(article.getPublishedAt())
                .build();
    }

    public Article toEntity(CreateArticleRequest request) {
        Article article = new Article();
        article.setTitle(request.getTitle());
        article.setSummary(request.getSummary());
        article.setContent(request.getContent());
        article.setCoverImageUrl(request.getCoverImageUrl());
        article.setStatus(request.getStatus());
        article.setFeatured(request.getFeatured());
        article.setPinned(request.getPinned());
        article.setScheduledFor(request.getScheduledFor());
        return article;
    }

    public void updateEntity(Article article, UpdateArticleRequest request) {
        if (request.getTitle() != null) {
            article.setTitle(request.getTitle());
        }
        if (request.getSummary() != null) {
            article.setSummary(request.getSummary());
        }
        if (request.getContent() != null) {
            article.setContent(request.getContent());
        }
        if (request.getCoverImageUrl() != null) {
            article.setCoverImageUrl(request.getCoverImageUrl());
        }
        if (request.getStatus() != null) {
            article.setStatus(request.getStatus());
        }
        if (request.getFeatured() != null) {
            article.setFeatured(request.getFeatured());
        }
        if (request.getPinned() != null) {
            article.setPinned(request.getPinned());
        }
        if (request.getScheduledFor() != null) {
            article.setScheduledFor(request.getScheduledFor());
        }
    }
}
