package com.softchaos.service;

import com.softchaos.dto.request.UploadMediaRequest;
import com.softchaos.dto.response.MediaResponse;
import com.softchaos.exception.BadRequestException;
import com.softchaos.exception.ResourceNotFoundException;
import com.softchaos.dto.mapper.MediaMapper;
import com.softchaos.model.Article;
import com.softchaos.model.Media;
import com.softchaos.repository.ArticleRepository;
import com.softchaos.repository.MediaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class MediaService {

    private final MediaRepository mediaRepository;
    private final ArticleRepository articleRepository;
    private final MediaMapper mediaMapper;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Value("${app.upload.max-file-size:10485760}") // 10MB default
    private Long maxFileSize;

    /**
     * Faz upload de arquivo
     */
    public MediaResponse uploadFile(MultipartFile file, UploadMediaRequest request) {
        log.info("Fazendo upload de arquivo: {}", file.getOriginalFilename());

        // Validações
        if (file.isEmpty()) {
            throw new BadRequestException("Arquivo não pode estar vazio");
        }

        if (file.getSize() > maxFileSize) {
            throw new BadRequestException("Arquivo excede o tamanho máximo permitido de " +
                    (maxFileSize / 1024 / 1024) + "MB");
        }

        // Valida tipo de arquivo
        String contentType = file.getContentType();
        if (!isValidFileType(contentType, request.getType())) {
            throw new BadRequestException("Tipo de arquivo inválido para " + request.getType());
        }

        try {
            // Cria diretório se não existir
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Gera nome único para o arquivo
            String originalFilename = file.getOriginalFilename();
            String extension = FilenameUtils.getExtension(originalFilename);
            String uniqueFilename = UUID.randomUUID() + "." + extension;

            // Salva arquivo no disco
            Path filePath = uploadPath.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Cria entidade Media
            Media media = new Media();
            media.setFilename(uniqueFilename);
            media.setUrl("/uploads/" + uniqueFilename); // URL relativa
            media.setType(request.getType());
            media.setAltText(request.getAltText());
            media.setFileSize(file.getSize());

            // Associa ao artigo se fornecido
            if (request.getArticleId() != null) {
                Article article = articleRepository.findById(request.getArticleId())
                        .orElseThrow(() -> new ResourceNotFoundException("Artigo", "id", request.getArticleId()));
                media.setArticle(article);
            }

            Media savedMedia = mediaRepository.save(media);

            log.info("Arquivo salvo com sucesso. ID: {}, Nome: {}", savedMedia.getId(), uniqueFilename);

            return mediaMapper.toResponse(savedMedia);

        } catch (IOException e) {
            log.error("Erro ao fazer upload do arquivo", e);
            throw new BadRequestException("Erro ao salvar arquivo: " + e.getMessage());
        }
    }

    /**
     * Busca mídia por ID
     */
    @Transactional(readOnly = true)
    public MediaResponse getMediaById(Long id) {
        log.info("Buscando mídia por ID: {}", id);

        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mídia", "id", id));

        return mediaMapper.toResponse(media);
    }

    /**
     * Lista mídias de um artigo
     */
    @Transactional(readOnly = true)
    public List<MediaResponse> getMediaByArticle(Long articleId) {
        log.info("Listando mídias do artigo ID: {}", articleId);

        if (!articleRepository.existsById(articleId)) {
            throw new ResourceNotFoundException("Artigo", "id", articleId);
        }

        return mediaRepository.findByArticleId(articleId).stream()
                .map(mediaMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lista mídias por tipo
     */
    @Transactional(readOnly = true)
    public List<MediaResponse> getMediaByType(Media.MediaType type) {
        log.info("Listando mídias do tipo: {}", type);

        return mediaRepository.findByType(type).stream()
                .map(mediaMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lista mídias órfãs (sem artigo associado)
     */
    @Transactional(readOnly = true)
    public List<MediaResponse> getOrphanMedia() {
        log.info("Listando mídias órfãs");

        return mediaRepository.findOrphanMedia().stream()
                .map(mediaMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Associa mídia a um artigo
     */
    public MediaResponse associateMediaToArticle(Long mediaId, Long articleId) {
        log.info("Associando mídia ID: {} ao artigo ID: {}", mediaId, articleId);

        Media media = mediaRepository.findById(mediaId)
                .orElseThrow(() -> new ResourceNotFoundException("Mídia", "id", mediaId));

        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new ResourceNotFoundException("Artigo", "id", articleId));

        media.setArticle(article);
        Media updatedMedia = mediaRepository.save(media);

        log.info("Mídia associada com sucesso");

        return mediaMapper.toResponse(updatedMedia);
    }

    /**
     * Atualiza alt text da mídia
     */
    public MediaResponse updateAltText(Long id, String altText) {
        log.info("Atualizando alt text da mídia ID: {}", id);

        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mídia", "id", id));

        media.setAltText(altText);
        Media updatedMedia = mediaRepository.save(media);

        log.info("Alt text atualizado com sucesso");

        return mediaMapper.toResponse(updatedMedia);
    }

    /**
     * Deleta mídia
     */
    public void deleteMedia(Long id) {
        log.info("Deletando mídia ID: {}", id);

        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mídia", "id", id));

        // Deleta arquivo físico
        try {
            Path filePath = Paths.get(uploadDir).resolve(media.getFilename());
            Files.deleteIfExists(filePath);
            log.info("Arquivo físico deletado: {}", media.getFilename());
        } catch (IOException e) {
            log.error("Erro ao deletar arquivo físico", e);
        }

        // Deleta registro do banco
        mediaRepository.delete(media);

        log.info("Mídia deletada com sucesso. ID: {}", id);
    }

    /**
     * Calcula espaço total usado
     */
    @Transactional(readOnly = true)
    public Long calculateTotalStorageUsed() {
        Long totalBytes = mediaRepository.calculateTotalStorageUsed();
        return totalBytes != null ? totalBytes : 0L;
    }

    /**
     * Valida tipo de arquivo
     */
    private boolean isValidFileType(String contentType, Media.MediaType mediaType) {
        if (contentType == null) {
            return false;
        }

        return switch (mediaType) {
            case IMAGE -> contentType.startsWith("image/");
            case VIDEO -> contentType.startsWith("video/");
            case DOCUMENT -> contentType.equals("application/pdf") ||
                    contentType.equals("application/msword") ||
                    contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document") ||
                    contentType.equals("application/vnd.ms-excel") ||
                    contentType.equals("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        };
    }
}
