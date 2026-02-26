package com.softchaos.dto.mapper;

import com.softchaos.dto.request.CreateUserRequest;
import com.softchaos.dto.request.UpdateUserRequest;
import com.softchaos.dto.response.UserResponse;
import com.softchaos.dto.response.UserSummaryResponse;
import com.softchaos.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponse toResponse(User user, Long publishedArticlesCount) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .bio(user.getBio())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole())
                .active(user.getActive())
                .publishedArticlesCount(publishedArticlesCount)
                .createdAt(user.getCreatedAt())
                .build();
    }

    public UserSummaryResponse toSummaryResponse(User user) {
        return UserSummaryResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole())
                .build();
    }

    public User toEntity(CreateUserRequest request) {
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword()); // Será criptografada no Service
        user.setName(request.getName());
        user.setBio(request.getBio());
        user.setAvatarUrl(request.getAvatarUrl());
        user.setRole(request.getRole());
        return user;
    }

    public void updateEntity(User user, UpdateUserRequest request) {
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        if (request.getPassword() != null) {
            user.setPassword(request.getPassword()); // Será criptografada no Service
        }
        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
        if (request.getActive() != null) {
            user.setActive(request.getActive());
        }
    }
}
