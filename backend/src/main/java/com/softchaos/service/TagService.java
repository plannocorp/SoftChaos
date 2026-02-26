package com.softchaos.service;

import com.softchaos.dto.mapper.TagMapper;
import com.softchaos.dto.request.CreateTagRequest;
import com.softchaos.dto.request.UpdateTagRequest;
import com.softchaos.dto.response.TagResponse;
import com.softchaos.exception.DuplicateResourceException;
import com.softchaos.exception.ResourceNotFoundException;
import com.softchaos.model.Tag;
import com.softchaos.repository.TagRepository;
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
public class TagService {

    private final TagRepository tagRepository;
    private final TagMapper tagMapper;

    /**
     * Cria uma nova tag
     */
    public TagResponse createTag(CreateTagRequest request) {
        log.info("Criando nova tag: {}", request.getName());

        String slug = generateUniqueSlug(request.getName());

        if (tagRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Tag", "nome", request.getName());
        }

        Tag tag = tagMapper.toEntity(request);
        tag.setSlug(slug);

        Tag savedTag = tagRepository.save(tag);

        log.info("Tag criada com sucesso. ID: {}, Slug: {}", savedTag.getId(), savedTag.getSlug());

        return tagMapper.toResponse(savedTag, 0L);
    }

    /**
     * Busca tag por ID
     */
    @Transactional(readOnly = true)
    public TagResponse getTagById(Long id) {
        log.info("Buscando tag por ID: {}", id);

        Tag tag = tagRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tag", "id", id));

        Long articlesCount = (long) tag.getArticles().size();
        return tagMapper.toResponse(tag, articlesCount);
    }

    /**
     * Busca tag por slug
     */
    @Transactional(readOnly = true)
    public TagResponse getTagBySlug(String slug) {
        log.info("Buscando tag por slug: {}", slug);

        Tag tag = tagRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Tag", "slug", slug));

        Long articlesCount = (long) tag.getArticles().size();
        return tagMapper.toResponse(tag, articlesCount);
    }

    /**
     * Lista todas as tags
     */
    @Transactional(readOnly = true)
    public List<TagResponse> getAllTags() {
        log.info("Listando todas as tags");

        return tagRepository.findAllByOrderByNameAsc().stream()
                .map(tag -> {
                    Long articlesCount = (long) tag.getArticles().size();
                    return tagMapper.toResponse(tag, articlesCount);
                })
                .collect(Collectors.toList());
    }

    /**
     * Lista tags mais usadas
     */
    @Transactional(readOnly = true)
    public List<TagResponse> getMostUsedTags(int limit) {
        log.info("Listando {} tags mais usadas", limit);

        return tagRepository.findMostUsedTags(limit).stream()
                .map(tag -> {
                    Long articlesCount = (long) tag.getArticles().size();
                    return tagMapper.toResponse(tag, articlesCount);
                })
                .collect(Collectors.toList());
    }

    /**
     * Busca tags por nome (autocomplete)
     */
    @Transactional(readOnly = true)
    public List<TagResponse> searchTagsByName(String name) {
        log.info("Buscando tags por nome: {}", name);

        return tagRepository.searchByName(name).stream()
                .map(tag -> {
                    Long articlesCount = (long) tag.getArticles().size();
                    return tagMapper.toResponse(tag, articlesCount);
                })
                .collect(Collectors.toList());
    }

    /**
     * Atualiza tag
     */
    public TagResponse updateTag(Long id, UpdateTagRequest request) {
        log.info("Atualizando tag ID: {}", id);

        Tag tag = tagRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tag", "id", id));

        if (request.getName() != null && !request.getName().equals(tag.getName())) {
            if (tagRepository.existsByName(request.getName())) {
                throw new DuplicateResourceException("Tag", "nome", request.getName());
            }
            tag.setSlug(generateUniqueSlug(request.getName()));
        }

        tagMapper.updateEntity(tag, request);

        Tag updatedTag = tagRepository.save(tag);

        log.info("Tag atualizada com sucesso. ID: {}", updatedTag.getId());

        Long articlesCount = (long) updatedTag.getArticles().size();
        return tagMapper.toResponse(updatedTag, articlesCount);
    }

    /**
     * Deleta tag
     */
    public void deleteTag(Long id) {
        log.info("Deletando tag ID: {}", id);

        if (!tagRepository.existsById(id)) {
            throw new ResourceNotFoundException("Tag", "id", id);
        }

        tagRepository.deleteById(id);

        log.info("Tag deletada com sucesso. ID: {}", id);
    }

    /**
     * Gera slug único para tag
     */
    private String generateUniqueSlug(String name) {
        String baseSlug = SlugGenerator.toSlug(name);
        String slug = baseSlug;
        int suffix = 0;

        while (tagRepository.existsBySlug(slug)) {
            suffix++;
            slug = SlugGenerator.toUniqueSlug(baseSlug, suffix);
        }

        return slug;
    }
}
