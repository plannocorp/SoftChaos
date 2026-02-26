package com.softchaos.dto.response;

import com.softchaos.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

//versao resumida para listagens


public class UserSummaryResponse {
    private Long id;
    private String name;
    private String avatarUrl;
    private User.Role role;
}
