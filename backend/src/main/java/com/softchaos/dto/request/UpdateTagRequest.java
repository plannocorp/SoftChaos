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
public class UpdateTagRequest {

    @Size(max = 50, message = "Nome deve ter no máximo 50 caracteres")
    private String name;
}
