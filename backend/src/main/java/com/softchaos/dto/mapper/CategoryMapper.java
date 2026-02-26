package com.softchaos.dto.mapper;

import com.softchaos.dto.request.CreateCategoryRequest;
import com.softchaos.dto.request.UpdateCategoryRequest;
import com.softchaos.dto.response.CategoryResponse;
import com.softchaos.model.Category;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public CategoryResponse toResponse(Category category, Long articlesCount) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .iconUrl(category.getIconUrl())
                .articlesCount(articlesCount)
                .build();
    }

    public Category toEntity(CreateCategoryRequest request) {
        Category category = new Category();
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setIconUrl(request.getIconUrl());
        return category;
    }

    public void updateEntity(Category category, UpdateCategoryRequest request) {
        if (request.getName() != null) {
            category.setName(request.getName());
        }
        if (request.getDescription() != null) {
            category.setDescription(request.getDescription());
        }
        if (request.getIconUrl() != null) {
            category.setIconUrl(request.getIconUrl());
        }
    }
}
