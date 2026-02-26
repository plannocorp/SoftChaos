package com.softchaos.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {

    // Contadores gerais
    private Long totalArticles;
    private Long totalUsers;
    private Long totalComments;
    private Long totalCategories;
    private Long totalTags;

    // Artigos por status
    private Long publishedArticles;
    private Long draftArticles;
    private Long scheduledArticles;

    // Usuários por status
    private Long activeUsers;
    private Long inactiveUsers;

    // Comentários por status
    private Long pendingComments;
    private Long approvedComments;

    // Artigos mais visualizados
    private List<TopArticle> topArticles;

    // Artigos recentes
    private List<RecentArticle> recentArticles;

    // Comentários recentes
    private List<RecentComment> recentComments;

    // Classes internas
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopArticle {
        private Long id;
        private String title;
        private String slug;
        private Long views;
        private String authorName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentArticle {
        private Long id;
        private String title;
        private String slug;
        private String status;
        private String authorName;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentComment {
        private Long id;
        private String content;
        private String authorName;
        private String articleTitle;
        private String status;
        private LocalDateTime createdAt;
    }
}
