package com.softchaos.repository;

import com.softchaos.model.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PageRepository extends JpaRepository<Page, Long> {

    /**
     * Busca página por slug
     */
    Optional<Page> findBySlug(String slug);

    /**
     * Verifica se existe página com determinado slug
     */
    boolean existsBySlug(String slug);

    /**
     * Busca páginas publicadas
     */
    List<Page> findByPublishedTrue();

    /**
     * Busca todas as páginas ordenadas por título
     */
    List<Page> findAllByOrderByTitleAsc();
}
