package com.softchaos.repository;

import com.softchaos.model.Media;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MediaRepository extends JpaRepository<Media, Long> {

    /**
     * Busca mídias de um artigo
     */
    List<Media> findByArticleId(Long articleId);

    /**
     * Busca mídias por tipo
     */
    List<Media> findByType(Media.MediaType type);

    /**
     * Busca mídias por nome de arquivo
     */
    List<Media> findByFilenameContainingIgnoreCase(String filename);

    /**
     * Conta quantas mídias um artigo tem
     */
    Long countByArticleId(Long articleId);

    /**
     * Busca mídias órfãs (sem artigo associado)
     */
    @Query("SELECT m FROM Media m WHERE m.article IS NULL")
    List<Media> findOrphanMedia();

    /**
     * Calcula espaço total usado por mídias (em bytes)
     */
    @Query("SELECT SUM(m.fileSize) FROM Media m")
    Long calculateTotalStorageUsed();
}
