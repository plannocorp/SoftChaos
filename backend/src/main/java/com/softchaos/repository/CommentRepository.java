package com.softchaos.repository;

import com.softchaos.enums.CommentStatus;
import com.softchaos.model.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    Page<Comment> findByArticleIdAndStatusOrderByCreatedAtDesc(Long articleId, CommentStatus status, Pageable pageable);

    Page<Comment> findByStatusOrderByCreatedAtDesc(CommentStatus status, Pageable pageable);

    Page<Comment> findByStatusInOrderByCreatedAtDesc(List<CommentStatus> statuses, Pageable pageable);

    Long countByArticleIdAndStatus(Long articleId, CommentStatus status);

    // Mantenha apenas ESTE para contagem por status
    long countByStatus(CommentStatus status);

    List<Comment> findByArticleIdOrderByCreatedAtDesc(Long articleId);

    Page<Comment> findAllByOrderByCreatedAtDesc(Pageable pageable);

    // Este método deve ser removido ou atualizado se o campo 'approved' não existir mais
    // long countByApprovedFalse();
}
