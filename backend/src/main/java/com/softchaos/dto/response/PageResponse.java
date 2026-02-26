package com.softchaos.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageResponse {
    private Long id;
    private String title;
    private String slug;
    private String content;
    private Boolean published;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
