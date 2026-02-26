package com.softchaos.dto.mapper;

import com.softchaos.dto.request.CreateTagRequest;
import com.softchaos.dto.request.UpdateTagRequest;
import com.softchaos.dto.response.TagResponse;
import com.softchaos.model.Tag;
import org.springframework.stereotype.Component;

@Component
public class TagMapper {

    public TagResponse toResponse(Tag tag, Long articlesCount) {
        return TagResponse.builder()
                .id(tag.getId())
                .name(tag.getName())
                .slug(tag.getSlug())
                .articlesCount(articlesCount)
                .build();
    }

    public Tag toEntity(CreateTagRequest request) {
        Tag tag = new Tag();
        tag.setName(request.getName());
        return tag;
    }

    public void updateEntity(Tag tag, UpdateTagRequest request) {
        if (request.getName() != null) {
            tag.setName(request.getName());
        }
    }
}
