package com.softchaos.dto.mapper;

import com.softchaos.dto.request.CreateCommentRequest;
import com.softchaos.dto.response.CommentResponse;
import com.softchaos.model.Comment;
import org.springframework.stereotype.Component;

@Component
public class CommentMapper {

    public CommentResponse toResponse(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .authorName(comment.getAuthorName())
                .content(comment.getContent())
                .status(comment.getStatus())
                .createdAt(comment.getCreatedAt())
                .articleTitle(comment.getArticle().getTitle())
                .build();
    }

    public Comment toEntity(CreateCommentRequest request) {
        Comment comment = new Comment();
        comment.setAuthorName(request.getAuthorName());
        comment.setAuthorEmail(request.getAuthorEmail());
        comment.setContent(request.getContent());
        return comment;
    }
}
