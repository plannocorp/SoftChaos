package com.softchaos.dto.request;

import com.softchaos.model.Media;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UploadMediaRequest {

    @NotNull(message = "Tipo de mídia é obrigatório")
    private Media.MediaType type;

    private String altText;

    private Long articleId;
}
