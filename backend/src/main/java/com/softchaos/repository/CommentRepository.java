package com.softchaos.repository;

import com.softchaos.model.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    /**
     * Busca comentários de um artigo (aprovados)
     */
    Page<Comment> findByArticleIdAndApprovedTrueOrderByCreatedAtDesc(Long articleId, Pageable pageable);

    /**
     * Busca comentários pendentes de aprovação
     */
    Page<Comment> findByApprovedFalseOrderByCreatedAtDesc(Pageable pageable);

    /**
     * Conta comentários aprovados de um artigo
     */
    Long countByArticleIdAndApprovedTrue(Long articleId);

    /**
     * Conta comentários pendentes de aprovação
     */
    Long countByApprovedFalse();

    /**
     * Busca todos os comentários de um artigo (incluindo não aprovados)
     */
    List<Comment> findByArticleIdOrderByCreatedAtDesc(Long articleId);

    // Buscar comentários recentes
    Page<Comment> findAllByOrderByCreatedAtDesc(Pageable pageable);

}
