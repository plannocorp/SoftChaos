package com.softchaos.repository;

import com.softchaos.model.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {

    /**
     * Busca tag por slug
     */
    Optional<Tag> findBySlug(String slug);

    /**
     * Busca tag por nome
     */
    Optional<Tag> findByName(String name);

    /**
     * Verifica se existe tag com determinado slug
     */
    boolean existsBySlug(String slug);

    /**
     * Verifica se existe tag com determinado nome
     */
    boolean existsByName(String name);

    /**
     * Busca tags mais usadas (ordenadas por quantidade de artigos)
     */
    @Query("SELECT t FROM Tag t JOIN t.articles a WHERE a.status = 'PUBLISHED' GROUP BY t ORDER BY COUNT(a) DESC")
    List<Tag> findMostUsedTags(@Param("limit") int limit);

    /**
     * Busca tags de um artigo específico
     */
    @Query("SELECT t FROM Tag t JOIN t.articles a WHERE a.id = :articleId")
    List<Tag> findByArticleId(@Param("articleId") Long articleId);

    /**
     * Busca tags por nome parcial (para autocomplete)
     */
    @Query("SELECT t FROM Tag t WHERE LOWER(t.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Tag> searchByName(@Param("name") String name);

    /**
     * Busca tags ordenadas por nome
     */
    List<Tag> findAllByOrderByNameAsc();
}
