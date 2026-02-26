package com.softchaos.service;

import com.softchaos.dto.mapper.NewsletterMapper;
import com.softchaos.dto.request.SubscribeNewsletterRequest;
import com.softchaos.dto.response.NewsletterResponse;
import com.softchaos.dto.response.PagedResponse;
import com.softchaos.exception.DuplicateResourceException;
import com.softchaos.exception.ResourceNotFoundException;
import com.softchaos.model.Newsletter;
import com.softchaos.repository.NewsletterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NewsletterService {

    private final NewsletterRepository newsletterRepository;
    private final NewsletterMapper newsletterMapper;
    // private final EmailService emailService; // Implementaremos depois

    /**
     * Inscreve novo assinante
     */
    public NewsletterResponse subscribe(SubscribeNewsletterRequest request) {
        log.info("Nova inscrição na newsletter: {}", request.getEmail());

        if (newsletterRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email já cadastrado na newsletter");
        }

        Newsletter newsletter = newsletterMapper.toEntity(request);
        newsletter.setConfirmationToken(UUID.randomUUID().toString());
        newsletter.setActive(true);

        Newsletter savedNewsletter = newsletterRepository.save(newsletter);

        log.info("Assinante cadastrado com sucesso. ID: {}", savedNewsletter.getId());

        // TODO: Enviar email de confirmação
        // emailService.sendConfirmationEmail(savedNewsletter);

        return newsletterMapper.toResponse(savedNewsletter);
    }

    /**
     * Confirma inscrição via token
     */
    public NewsletterResponse confirmSubscription(String token) {
        log.info("Confirmando inscrição com token: {}", token);

        Newsletter newsletter = newsletterRepository.findByConfirmationToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Token de confirmação inválido"));

        newsletter.setConfirmedAt(LocalDateTime.now());
        newsletter.setConfirmationToken(null); // Remove token após confirmação

        Newsletter confirmedNewsletter = newsletterRepository.save(newsletter);

        log.info("Inscrição confirmada com sucesso. Email: {}", confirmedNewsletter.getEmail());

        return newsletterMapper.toResponse(confirmedNewsletter);
    }

    /**
     * Cancela inscrição
     */
    public void unsubscribe(String email) {
        log.info("Cancelando inscrição: {}", email);

        Newsletter newsletter = newsletterRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Newsletter", "email", email));

        newsletter.setActive(false);
        newsletterRepository.save(newsletter);

        log.info("Inscrição cancelada com sucesso. Email: {}", email);
    }

    /**
     * Lista todos os assinantes
     */
    @Transactional(readOnly = true)
    public PagedResponse<NewsletterResponse> getAllSubscribers(Pageable pageable) {
        log.info("Listando assinantes da newsletter");

        Page<Newsletter> newslettersPage = newsletterRepository.findAll(pageable);

        return buildPagedResponse(newslettersPage);
    }

    /**
     * Lista assinantes ativos
     */
    @Transactional(readOnly = true)
    public PagedResponse<NewsletterResponse> getActiveSubscribers(Pageable pageable) {
        log.info("Listando assinantes ativos");

        Page<Newsletter> newslettersPage = newsletterRepository.findByActiveTrue(pageable);

        return buildPagedResponse(newslettersPage);
    }

    /**
     * Busca emails ativos para envio
     */
    @Transactional(readOnly = true)
    public List<String> getActiveSubscriberEmails() {
        log.info("Buscando emails ativos para envio");

        return newsletterRepository.findByActiveTrueAndConfirmedAtIsNotNull().stream()
                .map(Newsletter::getEmail)
                .toList();
    }

    /**
     * Conta assinantes ativos
     */
    @Transactional(readOnly = true)
    public Long countActiveSubscribers() {
        return newsletterRepository.countByActiveTrue();
    }

    /**
     * Deleta assinante
     */
    public void deleteSubscriber(Long id) {
        log.info("Deletando assinante ID: {}", id);

        if (!newsletterRepository.existsById(id)) {
            throw new ResourceNotFoundException("Assinante", "id", id);
        }

        newsletterRepository.deleteById(id);

        log.info("Assinante deletado com sucesso. ID: {}", id);
    }

    /**
     * Método auxiliar para construir resposta paginada
     */
    private PagedResponse<NewsletterResponse> buildPagedResponse(Page<Newsletter> newslettersPage) {
        Page<NewsletterResponse> responsePage = newslettersPage.map(newsletterMapper::toResponse);

        return PagedResponse.<NewsletterResponse>builder()
                .content(responsePage.getContent())
                .pageNumber(responsePage.getNumber())
                .pageSize(responsePage.getSize())
                .totalElements(responsePage.getTotalElements())
                .totalPages(responsePage.getTotalPages())
                .last(responsePage.isLast())
                .build();
    }
}
