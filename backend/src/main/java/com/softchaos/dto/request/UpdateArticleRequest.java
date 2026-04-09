package com.softchaos.dto.request;

import com.softchaos.model.Article;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateArticleRequest {

    @Size(max = 200, message = "Título deve ter no máximo 200 caracteres")
    private String title;

    @Size(max = 300, message = "Resumo deve ter no máximo 300 caracteres")
    private String summary;

    private String content;

    private String coverImageUrl;

    private Long categoryId;

    private Article.Status status;

    private Boolean featured;

    private Boolean pinned;

    private LocalDateTime scheduledFor;

    private List<String> externalVideoLinks;
}
