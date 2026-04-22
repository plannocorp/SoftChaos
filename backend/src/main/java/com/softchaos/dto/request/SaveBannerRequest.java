package com.softchaos.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SaveBannerRequest {

    @NotBlank(message = "Titulo e obrigatorio")
    @Size(max = 180, message = "Titulo deve ter no maximo 180 caracteres")
    private String title;

    @Size(max = 320, message = "Subtitulo deve ter no maximo 320 caracteres")
    private String subtitle;

    @Size(max = 60, message = "Texto do botao deve ter no maximo 60 caracteres")
    private String buttonLabel;

    @Size(max = 1000, message = "Link do banner deve ter no maximo 1000 caracteres")
    private String targetUrl;

    @Size(max = 255, message = "Texto alternativo deve ter no maximo 255 caracteres")
    private String imageAltText;

    @Min(value = 1, message = "A ordem minima e 1")
    @Max(value = 5, message = "A ordem maxima e 5")
    private Integer displayOrder;

    private Boolean active;
}
