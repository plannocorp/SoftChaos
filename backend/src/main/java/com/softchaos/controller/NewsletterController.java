package com.softchaos.controller;

import com.softchaos.dto.request.SubscribeNewsletterRequest;
import com.softchaos.dto.response.ApiResponse;
import com.softchaos.dto.response.NewsletterResponse;
import com.softchaos.dto.response.PagedResponse;
import com.softchaos.service.NewsletterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/newsletter")
@RequiredArgsConstructor
@Tag(name = "Newsletter", description = "Gerenciamento de newsletter")
public class NewsletterController {

    private final NewsletterService newsletterService;

    /**
     * Inscreve na newsletter
     */
    @PostMapping("/subscribe")
    @Operation(summary = "Inscrever na newsletter", description = "Cadastra email para receber newsletter")
    public ResponseEntity<ApiResponse<NewsletterResponse>> subscribe(
            @Valid @RequestBody SubscribeNewsletterRequest request) {

        NewsletterResponse newsletter = newsletterService.subscribe(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Inscrição realizada! Verifique seu email para confirmar.", newsletter));
    }

    /**
     * Confirma inscrição
     */
    @GetMapping("/confirm")
    @Operation(summary = "Confirmar inscrição", description = "Confirma inscrição via token enviado por email")
    public ResponseEntity<ApiResponse<NewsletterResponse>> confirmSubscription(@RequestParam String token) {
        NewsletterResponse newsletter = newsletterService.confirmSubscription(token);
        return ResponseEntity.ok(ApiResponse.success("Inscrição confirmada com sucesso!", newsletter));
    }

    /**
     * Cancela inscrição
     */
    @PostMapping("/unsubscribe")
    @Operation(summary = "Cancelar inscrição", description = "Remove email da newsletter")
    public ResponseEntity<ApiResponse<Void>> unsubscribe(@RequestParam String email) {
        newsletterService.unsubscribe(email);
        return ResponseEntity.ok(ApiResponse.success("Inscrição cancelada com sucesso", null));
    }

    /**
     * Lista todos os assinantes (admin)
     */
    @GetMapping("/subscribers")
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Listar assinantes", description = "Lista todos os assinantes da newsletter")
    public ResponseEntity<ApiResponse<PagedResponse<NewsletterResponse>>> getAllSubscribers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<NewsletterResponse> subscribers = newsletterService.getAllSubscribers(pageable);
        return ResponseEntity.ok(ApiResponse.success(subscribers));
    }

    /**
     * Lista assinantes ativos
     */
    @GetMapping("/subscribers/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Assinantes ativos", description = "Lista apenas assinantes ativos")
    public ResponseEntity<ApiResponse<PagedResponse<NewsletterResponse>>> getActiveSubscribers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<NewsletterResponse> subscribers = newsletterService.getActiveSubscribers(pageable);
        return ResponseEntity.ok(ApiResponse.success(subscribers));
    }

    /**
     * Deleta assinante
     */
    @DeleteMapping("/subscribers/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Deletar assinante", description = "Remove assinante permanentemente")
    public ResponseEntity<ApiResponse<Void>> deleteSubscriber(@PathVariable Long id) {
        newsletterService.deleteSubscriber(id);
        return ResponseEntity.ok(ApiResponse.success("Assinante removido com sucesso", null));
    }
}
