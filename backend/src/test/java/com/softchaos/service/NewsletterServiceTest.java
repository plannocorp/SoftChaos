package com.softchaos.service;

import com.softchaos.dto.mapper.NewsletterMapper;
import com.softchaos.dto.request.SubscribeNewsletterRequest;
import com.softchaos.exception.ResourceNotFoundException;
import com.softchaos.model.Newsletter;
import com.softchaos.repository.NewsletterRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NewsletterServiceTest {
    @Mock NewsletterRepository repository;
    @Mock EmailService email;

    private NewsletterService service() {
        return new NewsletterService(repository, new NewsletterMapper(), email);
    }

    @Test
    void sendsConfirmationWithoutConfirmingSubscriberPrematurely() {
        var request = new SubscribeNewsletterRequest();
        request.setEmail("test@example.com");
        request.setName("Leitor");
        when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        var response = service().subscribe(request);

        assertNull(response.getConfirmedAt());
        verify(email).sendNewsletterConfirmationEmail(eq("test@example.com"), eq("Leitor"), argThat(token -> token != null && !token.isBlank()));
    }

    @Test
    void doesNotReportSuccessWhenEmailDeliveryFails() {
        var request = new SubscribeNewsletterRequest();
        request.setEmail("test@example.com");
        when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        doThrow(new RuntimeException("SMTP unavailable")).when(email).sendNewsletterConfirmationEmail(anyString(), isNull(), anyString());

        assertThrows(RuntimeException.class, () -> service().subscribe(request));
    }

    @Test
    void consumesTokenOnConfirmation() {
        var subscriber = new Newsletter();
        subscriber.setConfirmationToken("one-time-token");
        when(repository.findByConfirmationToken("one-time-token")).thenReturn(Optional.of(subscriber));
        when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        var response = service().confirmSubscription("one-time-token");

        assertNotNull(response.getConfirmedAt());
        assertNull(subscriber.getConfirmationToken());
    }

    @Test
    void rejectsUnknownConfirmationToken() {
        when(repository.findByConfirmationToken("unknown")).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service().confirmSubscription("unknown"));
        verify(repository, never()).save(any());
    }
}
