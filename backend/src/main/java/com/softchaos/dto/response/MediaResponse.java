package com.softchaos.dto.response;

import com.softchaos.model.Media;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MediaResponse {
    private Long id;
    private String url;
    private String filename;
    private Media.MediaType type;
    private String altText;
    private Long fileSize;
    private String fileSizeFormatted; // Ex: "2.5 MB"
    private Long articleId;
    private LocalDateTime uploadedAt;
}
