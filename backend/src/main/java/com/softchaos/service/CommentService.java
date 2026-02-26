package com.softchaos.service;

import com.softchaos.dto.mapper.CommentMapper;
import com.softchaos.dto.request.CreateCommentRequest;
import com.softchaos.dto.response.CommentResponse;
import com.softchaos.dto.response.PagedResponse;
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

    /**
     * Cria um novo comentário
     */
    public CommentResponse createComment(CreateCommentRequest request) {
        log.info("Criando novo comentário no artigo ID: {}", request.getArticleId());

        Article article = articleRepository.findById(request.getArticleId())
                .orElseThrow(() -> new ResourceNotFoundException("Artigo", "id", request.getArticleId()));

        Comment comment = commentMapper.toEntity(request);
        comment.setArticle(article);
        comment.setApproved(false); // Comentários precisam ser aprovados

        Comment savedComment = commentRepository.save(comment);

        log.info("Comentário criado com sucesso. ID: {}", savedComment.getId());

        return commentMapper.toResponse(savedComment);
    }

    /**
     * Lista comentários aprovados de um artigo
     */
    @Transactional(readOnly = true)
    public PagedResponse<CommentResponse> getApprovedCommentsByArticle(Long articleId, Pageable pageable) {
        log.info("Listando comentários aprovados do artigo ID: {}", articleId);

        if (!articleRepository.existsById(articleId)) {
            throw new ResourceNotFoundException("Artigo", "id", articleId);
        }

        Page<Comment> commentsPage = commentRepository.findByArticleIdAndApprovedTrueOrderByCreatedAtDesc(
                articleId, pageable);

        return buildPagedResponse(commentsPage);
    }

    /**
     * Lista todos os comentários de um artigo (incluindo não aprovados)
     */
    @Transactional(readOnly = true)
    public List<CommentResponse> getAllCommentsByArticle(Long articleId) {
        log.info("Listando todos os comentários do artigo ID: {}", articleId);

        if (!articleRepository.existsById(articleId)) {
            throw new ResourceNotFoundException("Artigo", "id", articleId);
        }

        return commentRepository.findByArticleIdOrderByCreatedAtDesc(articleId).stream()
                .map(commentMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lista comentários pendentes de aprovação
     */
    @Transactional(readOnly = true)
    public PagedResponse<CommentResponse> getPendingComments(Pageable pageable) {
        log.info("Listando comentários pendentes de aprovação");

        Page<Comment> commentsPage = commentRepository.findByApprovedFalseOrderByCreatedAtDesc(pageable);

        return buildPagedResponse(commentsPage);
    }

    /**
     * Aprova comentário
     */
    public CommentResponse approveComment(Long id) {
        log.info("Aprovando comentário ID: {}", id);

        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comentário", "id", id));

        comment.setApproved(true);
        Comment approvedComment = commentRepository.save(comment);

        log.info("Comentário aprovado com sucesso. ID: {}", id);

        return commentMapper.toResponse(approvedComment);
    }

    /**
     * Reprova comentário
     */
    public CommentResponse rejectComment(Long id) {
        log.info("Reprovando comentário ID: {}", id);

        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comentário", "id", id));

        comment.setApproved(false);
        Comment rejectedComment = commentRepository.save(comment);

        log.info("Comentário reprovado com sucesso. ID: {}", id);

        return commentMapper.toResponse(rejectedComment);
    }

    /**
     * Deleta comentário
     */
    public void deleteComment(Long id) {
        log.info("Deletando comentário ID: {}", id);

        if (!commentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Comentário", "id", id);
        }

        commentRepository.deleteById(id);

        log.info("Comentário deletado com sucesso. ID: {}", id);
    }

    /**
     * Conta comentários pendentes
     */
    @Transactional(readOnly = true)
    public Long countPendingComments() {
        return commentRepository.countByApprovedFalse();
    }

    /**
     * Método auxiliar para construir resposta paginada
     */
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
