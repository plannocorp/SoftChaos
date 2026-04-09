package com.softchaos.dto.mapper;

import com.softchaos.dto.request.CreateArticleRequest;
import com.softchaos.dto.request.UpdateArticleRequest;
import com.softchaos.dto.response.ArticleResponse;
import com.softchaos.dto.response.ArticleSummaryResponse;
import com.softchaos.model.Article;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ArticleMapper {

    private final UserMapper userMapper;
    private final CategoryMapper categoryMapper;
    private final MediaMapper mediaMapper;

    public ArticleResponse toResponse(Article article, Long commentsCount) {
        return ArticleResponse.builder()
                .id(article.getId())
                .title(article.getTitle())
                .slug(article.getSlug())
                .summary(article.getSummary())
                .content(article.getContent())
                .coverImageUrl(article.getCoverImageUrl())
                .externalVideoLinks(article.getExternalVideoLinks() == null ? List.of() : List.copyOf(article.getExternalVideoLinks()))
                .author(userMapper.toSummaryResponse(article.getAuthor()))
                .category(categoryMapper.toResponse(article.getCategory(), null))
                .mediaFiles(article.getMediaFiles().stream()
                        .sorted(Comparator.comparing(
                                media -> media.getUploadedAt(),
                                Comparator.nullsLast(Comparator.naturalOrder())
                        ))
                        .map(mediaMapper::toResponse)
                        .collect(Collectors.toCollection(LinkedHashSet::new)))
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
                .externalVideoLinks(article.getExternalVideoLinks() == null ? List.of() : List.copyOf(article.getExternalVideoLinks()))
                .author(userMapper.toSummaryResponse(article.getAuthor()))
                .category(categoryMapper.toResponse(article.getCategory(), null))
                .status(article.getStatus())
                .featured(article.getFeatured())
                .pinned(article.getPinned())
                .viewCount(article.getViewCount())
                .commentsCount(commentsCount)
                .publishedAt(article.getPublishedAt())
                .scheduledFor(article.getScheduledFor())
                .createdAt(article.getCreatedAt())
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
        article.setExternalVideoLinks(request.getExternalVideoLinks() == null ? List.of() : List.copyOf(request.getExternalVideoLinks()));
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
        if (request.getStatus() != null && request.getStatus() != Article.Status.SCHEDULED) {
            article.setScheduledFor(null);
        } else if (request.getScheduledFor() != null) {
            article.setScheduledFor(request.getScheduledFor());
        }
        if (request.getExternalVideoLinks() != null) {
            article.setExternalVideoLinks(List.copyOf(request.getExternalVideoLinks()));
        }
    }
}
