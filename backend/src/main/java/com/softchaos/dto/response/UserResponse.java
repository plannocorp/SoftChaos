package com.softchaos.dto.response;

import com.softchaos.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String email;
    private String name;
    private String bio;
    private String avatarUrl;
    private User.Role role;
    private Boolean active;
    private Long publishedArticlesCount;
    private LocalDateTime createdAt;
}
