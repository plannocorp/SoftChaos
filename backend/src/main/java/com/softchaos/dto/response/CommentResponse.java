package com.softchaos.dto.response;

import com.softchaos.enums.CommentStatus;
import com.softchaos.model.Comment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponse {
    private Long id;
    private String authorName;
    private String authorEmail;
    private String content;
    private CommentStatus status;
    private LocalDateTime createdAt;
    private String articleTitle;
    private String articleSlug;
    private String articleCoverImageUrl;
}
