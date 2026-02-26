package com.softchaos.dto.mapper;

import com.softchaos.dto.request.SubscribeNewsletterRequest;
import com.softchaos.dto.response.NewsletterResponse;
import com.softchaos.model.Newsletter;
import org.springframework.stereotype.Component;

@Component
public class NewsletterMapper {

    public NewsletterResponse toResponse(Newsletter newsletter) {
        return NewsletterResponse.builder()
                .id(newsletter.getId())
                .email(newsletter.getEmail())
                .name(newsletter.getName())
                .active(newsletter.getActive())
                .confirmedAt(newsletter.getConfirmedAt())
                .subscribedAt(newsletter.getSubscribedAt())
                .build();
    }

    public Newsletter toEntity(SubscribeNewsletterRequest request) {
        Newsletter newsletter = new Newsletter();
        newsletter.setEmail(request.getEmail());
        newsletter.setName(request.getName());
        return newsletter;
    }
}
