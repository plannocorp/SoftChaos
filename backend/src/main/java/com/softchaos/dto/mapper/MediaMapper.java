package com.softchaos.dto.mapper;

import com.softchaos.dto.response.MediaResponse;
import com.softchaos.model.Media;
import org.springframework.stereotype.Component;

@Component
public class MediaMapper {

    /**
     * Converte Media para MediaResponse
     */
    public MediaResponse toResponse(Media media) {
        if (media == null) {
            return null;
        }

        MediaResponse response = new MediaResponse();
        response.setId(media.getId());
        response.setUrl(media.getUrl());
        response.setFilename(media.getFilename());
        response.setType(media.getType());
        response.setAltText(media.getAltText());
        response.setFileSize(media.getFileSize());
        response.setFileSizeFormatted(formatFileSize(media.getFileSize()));
        response.setUploadedAt(media.getUploadedAt());

        // Adiciona ID do artigo se existir
        if (media.getArticle() != null) {
            response.setArticleId(media.getArticle().getId());
        }

        return response;
    }

    /**
     * Formata tamanho do arquivo para leitura humana
     */
    private String formatFileSize(Long bytes) {
        if (bytes == null || bytes == 0) {
            return "0 B";
        }

        String[] units = {"B", "KB", "MB", "GB", "TB"};
        int unitIndex = 0;
        double size = bytes.doubleValue();

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return String.format("%.2f %s", size, units[unitIndex]);
    }
}
