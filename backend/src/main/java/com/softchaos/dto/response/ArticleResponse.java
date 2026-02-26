package com.softchaos.dto.response;

import com.softchaos.model.Article;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArticleResponse {
    private Long id;
    private String title;
    private String slug;
    private String summary;
    private String content;
    private String coverImageUrl;
    private UserSummaryResponse author;
    private CategoryResponse category;
    private Set<TagResponse> tags;
    private Set<MediaResponse> mediaFiles;
    private Article.Status status;
    private Boolean featured;
    private Boolean pinned;
    private Long viewCount;
    private Long commentsCount;
    private LocalDateTime publishedAt;
    private LocalDateTime scheduledFor;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
