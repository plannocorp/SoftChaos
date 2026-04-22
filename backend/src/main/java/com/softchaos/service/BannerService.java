package com.softchaos.service;

import com.softchaos.dto.mapper.BannerMapper;
import com.softchaos.dto.request.SaveBannerRequest;
import com.softchaos.dto.response.BannerResponse;
import com.softchaos.exception.BadRequestException;
import com.softchaos.exception.ResourceNotFoundException;
import com.softchaos.model.Banner;
import com.softchaos.repository.BannerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BannerService {

    private static final int MAX_BANNERS = 5;
    private static final Map<String, String> CONTENT_TYPE_EXTENSIONS = Map.of(
            "image/jpeg", "jpg",
            "image/png", "png",
            "image/gif", "gif",
            "image/webp", "webp"
    );

    private final BannerRepository bannerRepository;
    private final BannerMapper bannerMapper;
    private final SupabaseStorageService supabaseStorageService;

    @Value("${app.upload.max-file-size:10485760}")
    private Long maxFileSize;

    @Transactional(readOnly = true)
    public List<BannerResponse> getActiveBanners() {
        return bannerRepository.findByActiveTrueOrderByDisplayOrderAscUpdatedAtDesc().stream()
                .limit(MAX_BANNERS)
                .map(bannerMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BannerResponse> getAdminBanners() {
        return bannerRepository.findAllByOrderByDisplayOrderAscUpdatedAtDesc().stream()
                .map(bannerMapper::toResponse)
                .collect(Collectors.toList());
    }

    public BannerResponse createBanner(SaveBannerRequest request, MultipartFile image) {
        validateImageRequired(image);

        long currentTotal = bannerRepository.count();
        if (currentTotal >= MAX_BANNERS) {
            throw new BadRequestException("Voce pode cadastrar no maximo 5 banners.");
        }

        Banner banner = bannerMapper.toEntity(request);
        if (banner.getDisplayOrder() == null) {
            banner.setDisplayOrder((int) currentTotal + 1);
        }
        if (banner.getActive() == null) {
            banner.setActive(true);
        }

        applyUploadedImage(banner, image, null);

        Banner savedBanner = bannerRepository.save(banner);
        normalizeDisplayOrders(savedBanner.getId(), request.getDisplayOrder());

        log.info("Banner criado com sucesso. ID: {}", savedBanner.getId());
        return bannerMapper.toResponse(savedBanner);
    }

    public BannerResponse updateBanner(Long id, SaveBannerRequest request, MultipartFile image) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Banner", "id", id));

        String previousImageFilename = banner.getImageFilename();
        bannerMapper.updateEntity(banner, request);
        applyUploadedImage(banner, image, previousImageFilename);

        Banner savedBanner = bannerRepository.save(banner);
        normalizeDisplayOrders(savedBanner.getId(), request.getDisplayOrder());

        log.info("Banner atualizado com sucesso. ID: {}", savedBanner.getId());
        return bannerMapper.toResponse(savedBanner);
    }

    public void deleteBanner(Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Banner", "id", id));

        if (supabaseStorageService.isEnabled()) {
            supabaseStorageService.deleteObject(banner.getImageFilename());
        }

        bannerRepository.delete(banner);
        normalizeDisplayOrders(null, null);

        log.info("Banner removido com sucesso. ID: {}", id);
    }

    private void applyUploadedImage(Banner banner, MultipartFile image, String previousImageFilename) {
        if (image == null || image.isEmpty()) {
            if (banner.getImageUrl() == null || banner.getImageUrl().isBlank()) {
                throw new BadRequestException("A imagem do banner e obrigatoria.");
            }
            return;
        }

        validateImage(image);

        if (!supabaseStorageService.isEnabled()) {
            throw new BadRequestException("Upload remoto indisponivel. Configure o storage antes de cadastrar banners.");
        }

        String extension = resolveExtension(image);
        String objectKey = "banners/" + UUID.randomUUID() + "." + extension;
        String imageUrl = supabaseStorageService.uploadImage(image, objectKey);

        if (previousImageFilename != null && !previousImageFilename.isBlank() && supabaseStorageService.isEnabled()) {
            supabaseStorageService.deleteObject(previousImageFilename);
        }

        banner.setImageFilename(objectKey);
        banner.setImageUrl(imageUrl);
    }

    private void validateImageRequired(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new BadRequestException("Selecione uma imagem para o banner.");
        }
    }

    private void validateImage(MultipartFile image) {
        if (image.getSize() > maxFileSize) {
            throw new BadRequestException("Arquivo excede o tamanho maximo permitido de " +
                    (maxFileSize / 1024 / 1024) + "MB");
        }

        String contentType = image.getContentType();
        if (contentType == null || !CONTENT_TYPE_EXTENSIONS.containsKey(contentType.toLowerCase())) {
            throw new BadRequestException("Formato invalido. Envie JPG, PNG, GIF ou WEBP.");
        }
    }

    private String resolveExtension(MultipartFile image) {
        String originalFilename = image.getOriginalFilename();
        String extension = FilenameUtils.getExtension(originalFilename);

        if (extension != null && !extension.isBlank()) {
            return extension.toLowerCase();
        }

        String contentType = image.getContentType();
        String resolved = contentType != null ? CONTENT_TYPE_EXTENSIONS.get(contentType.toLowerCase()) : null;
        if (resolved == null) {
            throw new BadRequestException("Nao foi possivel identificar a extensao da imagem enviada.");
        }

        return resolved;
    }

    private void normalizeDisplayOrders(Long selectedBannerId, Integer requestedDisplayOrder) {
        List<Banner> banners = bannerRepository.findAllByOrderByDisplayOrderAscUpdatedAtDesc();
        if (banners.isEmpty()) {
            return;
        }

        Banner selectedBanner = null;
        if (selectedBannerId != null) {
            selectedBanner = banners.stream()
                    .filter(banner -> banner.getId().equals(selectedBannerId))
                    .findFirst()
                    .orElse(null);
        }

        if (selectedBanner != null) {
            banners.removeIf(banner -> banner.getId().equals(selectedBannerId));
            int desiredOrder = requestedDisplayOrder != null
                    ? requestedDisplayOrder
                    : (selectedBanner.getDisplayOrder() != null ? selectedBanner.getDisplayOrder() : banners.size() + 1);
            desiredOrder = Math.max(1, Math.min(desiredOrder, banners.size() + 1));
            banners.add(desiredOrder - 1, selectedBanner);
        }

        for (int index = 0; index < banners.size(); index++) {
            banners.get(index).setDisplayOrder(index + 1);
        }

        bannerRepository.saveAll(banners);
    }
}
