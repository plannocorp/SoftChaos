package com.softchaos.dto.request;

import com.softchaos.model.Article;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateArticleRequest {

    @NotBlank(message = "Título é obrigatório")
    @Size(max = 200, message = "Título deve ter no máximo 200 caracteres")
    private String title;

    @Size(max = 300, message = "Resumo deve ter no máximo 300 caracteres")
    private String summary;

    @NotBlank(message = "Conteúdo é obrigatório")
    private String content;

    private String coverImageUrl;

    @NotNull(message = "Categoria é obrigatória")
    private Long categoryId;

    private Set<Long> tagIds;

    @NotNull(message = "Status é obrigatório")
    private Article.Status status;

    private Boolean featured = false;

    private Boolean pinned = false;

    private LocalDateTime scheduledFor;
}
