package com.softchaos.service;

import com.softchaos.dto.mapper.PageMapper;
import com.softchaos.dto.request.CreatePageRequest;
import com.softchaos.dto.request.UpdatePageRequest;
import com.softchaos.dto.response.PageResponse;
import com.softchaos.exception.DuplicateResourceException;
import com.softchaos.exception.ResourceNotFoundException;
import com.softchaos.model.Page;
import com.softchaos.repository.PageRepository;
import com.softchaos.util.SlugGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PageService {

    private final PageRepository pageRepository;
    private final PageMapper pageMapper;

    /**
     * Cria uma nova página
     */
    public PageResponse createPage(CreatePageRequest request) {
        log.info("Criando nova página: {}", request.getTitle());

        String slug = generateUniqueSlug(request.getTitle());

        Page page = pageMapper.toEntity(request);
        page.setSlug(slug);

        Page savedPage = pageRepository.save(page);

        log.info("Página criada com sucesso. ID: {}, Slug: {}", savedPage.getId(), savedPage.getSlug());

        return pageMapper.toResponse(savedPage);
    }

    /**
     * Busca página por ID
     */
    @Transactional(readOnly = true)
    public PageResponse getPageById(Long id) {
        log.info("Buscando página por ID: {}", id);

        Page page = pageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Página", "id", id));

        return pageMapper.toResponse(page);
    }

    /**
     * Busca página por slug
     */
    @Transactional(readOnly = true)
    public PageResponse getPageBySlug(String slug) {
        log.info("Buscando página por slug: {}", slug);

        Page page = pageRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Página", "slug", slug));

        return pageMapper.toResponse(page);
    }

    /**
     * Lista todas as páginas
     */
    @Transactional(readOnly = true)
    public List<PageResponse> getAllPages() {
        log.info("Listando todas as páginas");

        return pageRepository.findAllByOrderByTitleAsc().stream()
                .map(pageMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lista páginas publicadas
     */
    @Transactional(readOnly = true)
    public List<PageResponse> getPublishedPages() {
        log.info("Listando páginas publicadas");

        return pageRepository.findByPublishedTrue().stream()
                .map(pageMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Atualiza página
     */
    public PageResponse updatePage(Long id, UpdatePageRequest request) {
        log.info("Atualizando página ID: {}", id);

        Page page = pageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Página", "id", id));

        if (request.getTitle() != null && !request.getTitle().equals(page.getTitle())) {
            page.setSlug(generateUniqueSlug(request.getTitle()));
        }

        pageMapper.updateEntity(page, request);

        Page updatedPage = pageRepository.save(page);

        log.info("Página atualizada com sucesso. ID: {}", updatedPage.getId());

        return pageMapper.toResponse(updatedPage);
    }

    /**
     * Deleta página
     */
    public void deletePage(Long id) {
        log.info("Deletando página ID: {}", id);

        if (!pageRepository.existsById(id)) {
            throw new ResourceNotFoundException("Página", "id", id);
        }

        pageRepository.deleteById(id);

        log.info("Página deletada com sucesso. ID: {}", id);
    }

    /**
     * Gera slug único para página
     */
    private String generateUniqueSlug(String title) {
        String baseSlug = SlugGenerator.toSlug(title);
        String slug = baseSlug;
        int suffix = 0;

        while (pageRepository.existsBySlug(slug)) {
            suffix++;
            slug = SlugGenerator.toUniqueSlug(baseSlug, suffix);
        }

        return slug;
    }
}
