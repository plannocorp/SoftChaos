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
public class NewsletterResponse {
    private Long id;
    private String email;
    private String name;
    private Boolean active;
    private LocalDateTime confirmedAt;
    private LocalDateTime subscribedAt;
}
