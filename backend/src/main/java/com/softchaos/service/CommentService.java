package com.softchaos.service;

import com.softchaos.dto.mapper.CommentMapper;
import com.softchaos.dto.request.CreateCommentRequest;
import com.softchaos.dto.response.CommentResponse;
import com.softchaos.dto.response.PagedResponse;
import com.softchaos.enums.CommentStatus;
import com.softchaos.exception.ResourceNotFoundException;
import com.softchaos.model.Article;
import com.softchaos.model.Comment;
import com.softchaos.repository.ArticleRepository;
import com.softchaos.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CommentService {

    private final CommentRepository commentRepository;
    private final ArticleRepository articleRepository;
    private final CommentMapper commentMapper;

    public CommentResponse createComment(CreateCommentRequest request) {
        log.info("Criando novo comentario no artigo ID: {}", request.getArticleId());

        Article article = articleRepository.findById(request.getArticleId())
                .orElseThrow(() -> new ResourceNotFoundException("Artigo", "id", request.getArticleId()));

        Comment comment = commentMapper.toEntity(request);
        comment.setArticle(article);

        Comment savedComment = commentRepository.save(comment);
        log.info("Comentario criado com sucesso. ID: {}", savedComment.getId());

        return commentMapper.toResponse(savedComment);
    }

    @Transactional(readOnly = true)
    public PagedResponse<CommentResponse> getApprovedCommentsByArticle(Long articleId, Pageable pageable) {
        log.info("Listando comentarios aprovados do artigo ID: {}", articleId);

        if (!articleRepository.existsById(articleId)) {
            throw new ResourceNotFoundException("Artigo", "id", articleId);
        }

        Page<Comment> commentsPage = commentRepository
                .findByArticleIdAndStatusOrderByCreatedAtDesc(articleId, CommentStatus.APPROVED, pageable);

        return buildPagedResponse(commentsPage);
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getAllCommentsByArticle(Long articleId) {
        log.info("Listando todos os comentarios do artigo ID: {}", articleId);

        if (!articleRepository.existsById(articleId)) {
            throw new ResourceNotFoundException("Artigo", "id", articleId);
        }

        return commentRepository.findByArticleIdOrderByCreatedAtDesc(articleId).stream()
                .map(commentMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PagedResponse<CommentResponse> getPendingComments(Pageable pageable) {
        log.info("Listando comentarios pendentes de aprovacao");

        Page<Comment> commentsPage = commentRepository
                .findByStatusOrderByCreatedAtDesc(CommentStatus.PENDING, pageable);

        return buildPagedResponse(commentsPage);
    }

    @Transactional(readOnly = true)
    public PagedResponse<CommentResponse> getAdminComments(CommentStatus status, Pageable pageable) {
        log.info("Listando comentarios do painel com status: {}", status);

        Page<Comment> commentsPage = status == null
                ? commentRepository.findAllByOrderByCreatedAtDesc(pageable)
                : commentRepository.findByStatusOrderByCreatedAtDesc(status, pageable);

        return buildPagedResponse(commentsPage);
    }

    public CommentResponse approveComment(Long id) {
        log.info("Aprovando comentario ID: {}", id);

        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comentario", "id", id));

        comment.setStatus(CommentStatus.APPROVED);
        log.info("Comentario aprovado com sucesso. ID: {}", id);

        return commentMapper.toResponse(commentRepository.save(comment));
    }

    public CommentResponse rejectComment(Long id) {
        log.info("Reprovando comentario ID: {}", id);

        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comentario", "id", id));

        comment.setStatus(CommentStatus.REJECTED);
        log.info("Comentario reprovado com sucesso. ID: {}", id);

        return commentMapper.toResponse(commentRepository.save(comment));
    }

    public void deleteComment(Long id) {
        log.info("Marcando comentario como deletado. ID: {}", id);

        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comentario", "id", id));

        comment.setStatus(CommentStatus.DELETED);
        commentRepository.save(comment);
        log.info("Comentario marcado como deletado com sucesso. ID: {}", id);
    }

    @Transactional(readOnly = true)
    public Long countPendingComments() {
        return commentRepository.countByStatus(CommentStatus.PENDING);
    }

    private PagedResponse<CommentResponse> buildPagedResponse(Page<Comment> commentsPage) {
        Page<CommentResponse> responsePage = commentsPage.map(commentMapper::toResponse);

        return PagedResponse.<CommentResponse>builder()
                .content(responsePage.getContent())
                .pageNumber(responsePage.getNumber())
                .pageSize(responsePage.getSize())
                .totalElements(responsePage.getTotalElements())
                .totalPages(responsePage.getTotalPages())
                .last(responsePage.isLast())
                .build();
    }
}

