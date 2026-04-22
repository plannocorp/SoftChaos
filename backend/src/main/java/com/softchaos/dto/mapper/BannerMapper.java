package com.softchaos.dto.mapper;

import com.softchaos.dto.request.SaveBannerRequest;
import com.softchaos.dto.response.BannerResponse;
import com.softchaos.model.Banner;
import org.springframework.stereotype.Component;

@Component
public class BannerMapper {

    public BannerResponse toResponse(Banner banner) {
        if (banner == null) {
            return null;
        }

        return BannerResponse.builder()
                .id(banner.getId())
                .title(banner.getTitle())
                .subtitle(banner.getSubtitle())
                .buttonLabel(banner.getButtonLabel())
                .targetUrl(banner.getTargetUrl())
                .imageUrl(banner.getImageUrl())
                .imageAltText(banner.getImageAltText())
                .displayOrder(banner.getDisplayOrder())
                .active(banner.getActive())
                .createdAt(banner.getCreatedAt())
                .updatedAt(banner.getUpdatedAt())
                .build();
    }

    public Banner toEntity(SaveBannerRequest request) {
        Banner banner = new Banner();
        updateEntity(banner, request);
        return banner;
    }

    public void updateEntity(Banner banner, SaveBannerRequest request) {
        banner.setTitle(normalize(request.getTitle()));
        banner.setSubtitle(normalize(request.getSubtitle()));
        banner.setButtonLabel(normalize(request.getButtonLabel()));
        banner.setTargetUrl(normalize(request.getTargetUrl()));
        banner.setImageAltText(normalize(request.getImageAltText()));

        if (request.getDisplayOrder() != null) {
            banner.setDisplayOrder(request.getDisplayOrder());
        }

        if (request.getActive() != null) {
            banner.setActive(request.getActive());
        }
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();
        return normalized.isBlank() ? null : normalized;
    }
}
