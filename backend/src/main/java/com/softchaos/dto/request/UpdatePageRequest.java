package com.softchaos.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePageRequest {

    @Size(max = 200, message = "Título deve ter no máximo 200 caracteres")
    private String title;

    private String content;

    private Boolean published;
}
