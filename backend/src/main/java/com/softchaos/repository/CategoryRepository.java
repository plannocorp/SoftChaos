package com.softchaos.repository;

import com.softchaos.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    /**
     * Busca categoria por slug
     */
    Optional<Category> findBySlug(String slug);

    /**
     * Verifica se existe categoria com determinado slug
     */
    boolean existsBySlug(String slug);

    /**
     * Verifica se existe categoria com determinado nome
     */
    boolean existsByName(String name);

    /**
     * Busca categorias com artigos publicados
     */
    @Query("SELECT DISTINCT c FROM Category c JOIN c.articles a WHERE a.status = 'PUBLISHED'")
    List<Category> findCategoriesWithPublishedArticles();

    /**
     * Conta quantos artigos publicados uma categoria tem
     */
    @Query("SELECT COUNT(a) FROM Article a WHERE a.category.id = :categoryId AND a.status = 'PUBLISHED'")
    Long countPublishedArticlesByCategory(@Param("categoryId") Long categoryId);

    /**
     * Busca categorias ordenadas por nome
     */
    List<Category> findAllByOrderByNameAsc();
}
