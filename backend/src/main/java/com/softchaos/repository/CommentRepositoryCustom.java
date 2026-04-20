package com.softchaos.repository;

import com.softchaos.enums.CommentStatus;
import com.softchaos.model.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface CommentRepositoryCustom {

    Page<Comment> findAdminComments(
            CommentStatus status,
            String articleQuery,
            LocalDateTime createdFrom,
            LocalDateTime createdUntil,
            Pageable pageable
    );
}
