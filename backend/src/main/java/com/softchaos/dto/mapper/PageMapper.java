package com.softchaos.dto.mapper;

import com.softchaos.dto.request.CreatePageRequest;
import com.softchaos.dto.request.UpdatePageRequest;
import com.softchaos.dto.response.PageResponse;
import com.softchaos.model.Page;
import org.springframework.stereotype.Component;

@Component
public class PageMapper {

    public PageResponse toResponse(Page page) {
        return PageResponse.builder()
                .id(page.getId())
                .title(page.getTitle())
                .slug(page.getSlug())
                .content(page.getContent())
                .published(page.getPublished())
                .createdAt(page.getCreatedAt())
                .updatedAt(page.getUpdatedAt())
                .build();
    }

    public Page toEntity(CreatePageRequest request) {
        Page page = new Page();
        page.setTitle(request.getTitle());
        page.setContent(request.getContent());
        page.setPublished(request.getPublished());
        return page;
    }

    public void updateEntity(Page page, UpdatePageRequest request) {
        if (request.getTitle() != null) {
            page.setTitle(request.getTitle());
        }
        if (request.getContent() != null) {
            page.setContent(request.getContent());
        }
        if (request.getPublished() != null) {
            page.setPublished(request.getPublished());
        }
    }
}
