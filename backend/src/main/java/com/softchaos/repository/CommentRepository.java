package com.softchaos.repository;

import com.softchaos.enums.CommentStatus;
import com.softchaos.model.Comment;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    @EntityGraph(attributePaths = "article")
    Page<Comment> findByArticleIdAndStatusOrderByCreatedAtDesc(Long articleId, CommentStatus status, Pageable pageable);

    @EntityGraph(attributePaths = "article")
    Page<Comment> findByStatusOrderByCreatedAtDesc(CommentStatus status, Pageable pageable);

    Page<Comment> findByStatusInOrderByCreatedAtDesc(List<CommentStatus> statuses, Pageable pageable);

    Long countByArticleIdAndStatus(Long articleId, CommentStatus status);

    // Mantenha apenas ESTE para contagem por status
    long countByStatus(CommentStatus status);

    List<Comment> findByArticleIdOrderByCreatedAtDesc(Long articleId);

    Page<Comment> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @EntityGraph(attributePaths = "article")
    @Query("""
            SELECT c FROM Comment c
            JOIN c.article a
            WHERE (:status IS NULL OR c.status = :status)
            AND (:createdFrom IS NULL OR c.createdAt >= :createdFrom)
            AND (:createdUntil IS NULL OR c.createdAt < :createdUntil)
            ORDER BY c.createdAt DESC
            """)
    Page<Comment> findAdminComments(
            @Param("status") CommentStatus status,
            @Param("createdFrom") LocalDateTime createdFrom,
            @Param("createdUntil") LocalDateTime createdUntil,
            Pageable pageable
    );

    @EntityGraph(attributePaths = "article")
    @Query("""
            SELECT c FROM Comment c
            JOIN c.article a
            WHERE (:status IS NULL OR c.status = :status)
            AND (LOWER(a.title) LIKE :articlePattern OR LOWER(a.slug) LIKE :articlePattern)
            AND (:createdFrom IS NULL OR c.createdAt >= :createdFrom)
            AND (:createdUntil IS NULL OR c.createdAt < :createdUntil)
            ORDER BY c.createdAt DESC
            """)
    Page<Comment> findAdminCommentsByArticleQuery(
            @Param("status") CommentStatus status,
            @Param("articlePattern") String articlePattern,
            @Param("createdFrom") LocalDateTime createdFrom,
            @Param("createdUntil") LocalDateTime createdUntil,
            Pageable pageable
    );

    @Modifying
    @Query("""
            DELETE FROM Comment c
            WHERE c.status IN :statuses
            AND c.statusUpdatedAt IS NOT NULL
            AND c.statusUpdatedAt < :threshold
            """)
    int deleteExpiredModeratedComments(
            @Param("statuses") List<CommentStatus> statuses,
            @Param("threshold") LocalDateTime threshold
    );

    // Este método deve ser removido ou atualizado se o campo 'approved' não existir mais
    // long countByApprovedFalse();
}
