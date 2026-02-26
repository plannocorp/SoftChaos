package com.softchaos.dto.response;

import com.softchaos.model.Article;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


//para listagens/cards


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArticleSummaryResponse {
    private Long id;
    private String title;
    private String slug;
    private String summary;
    private String coverImageUrl;
    private UserSummaryResponse author;
    private CategoryResponse category;
    private Article.Status status;
    private Boolean featured;
    private Boolean pinned;
    private Long viewCount;
    private Long commentsCount;
    private LocalDateTime publishedAt;
}
