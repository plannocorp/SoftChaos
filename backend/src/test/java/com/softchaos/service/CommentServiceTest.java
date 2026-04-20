package com.softchaos.service;

import com.softchaos.dto.mapper.CommentMapper;
import com.softchaos.dto.response.CommentResponse;
import com.softchaos.dto.response.PagedResponse;
import com.softchaos.enums.CommentStatus;
import com.softchaos.model.Comment;
import com.softchaos.repository.ArticleRepository;
import com.softchaos.repository.CommentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CommentServiceTest {

    @Mock
    private CommentRepository commentRepository;
    @Mock
    private ArticleRepository articleRepository;
    @Mock
    private CommentMapper commentMapper;

    @InjectMocks
    private CommentService commentService;

    @Test
    void getAdminCommentsShouldNormalizeArticleQueryBeforeRepositoryCall() {
        Comment comment = new Comment();
        comment.setId(1L);

        CommentResponse responseItem = CommentResponse.builder()
                .id(1L)
                .build();

        Page<Comment> commentsPage = new PageImpl<>(List.of(comment), PageRequest.of(0, 8), 1);

        when(commentRepository.findAdminComments(
                eq(CommentStatus.PENDING),
                eq("soft chaos"),
                eq(null),
                eq(null),
                eq(PageRequest.of(0, 8))
        )).thenReturn(commentsPage);
        when(commentMapper.toResponse(comment)).thenReturn(responseItem);

        PagedResponse<CommentResponse> response = commentService.getAdminComments(
                CommentStatus.PENDING,
                "  Soft Chaos  ",
                null,
                null,
                PageRequest.of(0, 8)
        );

        assertEquals(1, response.getContent().size());
        verify(commentRepository).findAdminComments(
                eq(CommentStatus.PENDING),
                eq("soft chaos"),
                eq(null),
                eq(null),
                eq(PageRequest.of(0, 8))
        );
    }
}
