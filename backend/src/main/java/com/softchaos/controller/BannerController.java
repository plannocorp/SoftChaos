package com.softchaos.controller;

import com.softchaos.dto.request.SaveBannerRequest;
import com.softchaos.dto.response.ApiResponse;
import com.softchaos.dto.response.BannerResponse;
import com.softchaos.service.BannerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/banners")
@RequiredArgsConstructor
@Tag(name = "Banners", description = "Gerenciamento dos banners do carousel da home")
public class BannerController {

    private final BannerService bannerService;

    @GetMapping("/active")
    @Operation(summary = "Listar banners ativos", description = "Retorna os banners ativos para a home")
    public ResponseEntity<ApiResponse<List<BannerResponse>>> getActiveBanners() {
        return ResponseEntity.ok(ApiResponse.success(bannerService.getActiveBanners()));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Listar banners no admin", description = "Retorna todos os banners para gestao no painel")
    public ResponseEntity<ApiResponse<List<BannerResponse>>> getAdminBanners() {
        return ResponseEntity.ok(ApiResponse.success(bannerService.getAdminBanners()));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Criar banner", description = "Cadastra um novo banner para a home")
    public ResponseEntity<ApiResponse<BannerResponse>> createBanner(
            @Valid @ModelAttribute SaveBannerRequest request,
            @RequestParam("image") MultipartFile image) {

        BannerResponse response = bannerService.createBanner(request, image);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Banner criado com sucesso", response));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Atualizar banner", description = "Atualiza conteudo e imagem de um banner")
    public ResponseEntity<ApiResponse<BannerResponse>> updateBanner(
            @PathVariable Long id,
            @Valid @ModelAttribute SaveBannerRequest request,
            @RequestParam(value = "image", required = false) MultipartFile image) {

        BannerResponse response = bannerService.updateBanner(id, request, image);
        return ResponseEntity.ok(ApiResponse.success("Banner atualizado com sucesso", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Remover banner", description = "Remove um banner do carousel da home")
    public ResponseEntity<ApiResponse<Void>> deleteBanner(@PathVariable Long id) {
        bannerService.deleteBanner(id);
        return ResponseEntity.ok(ApiResponse.success("Banner removido com sucesso", null));
    }
}
