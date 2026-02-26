package com.softchaos.service;

import com.softchaos.dto.mapper.CategoryMapper;
import com.softchaos.dto.request.CreateCategoryRequest;
import com.softchaos.dto.request.UpdateCategoryRequest;
import com.softchaos.dto.response.CategoryResponse;
import com.softchaos.exception.BadRequestException;
import com.softchaos.exception.DuplicateResourceException;
import com.softchaos.exception.ResourceNotFoundException;
import com.softchaos.model.Category;
import com.softchaos.repository.ArticleRepository;
import com.softchaos.repository.CategoryRepository;
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
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ArticleRepository articleRepository;
    private final CategoryMapper categoryMapper;

    /**
     * Cria uma nova categoria
     */
    public CategoryResponse createCategory(CreateCategoryRequest request) {
        log.info("Criando nova categoria: {}", request.getName());

        // Gera slug a partir do nome
        String slug = generateUniqueSlug(request.getName());

        // Verifica se já existe categoria com esse nome
        if (categoryRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Categoria", "nome", request.getName());
        }

        Category category = categoryMapper.toEntity(request);
        category.setSlug(slug);

        Category savedCategory = categoryRepository.save(category);

        log.info("Categoria criada com sucesso. ID: {}, Slug: {}", savedCategory.getId(), savedCategory.getSlug());

        return categoryMapper.toResponse(savedCategory, 0L);
    }

    /**
     * Busca categoria por ID
     */
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        log.info("Buscando categoria por ID: {}", id);

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria", "id", id));

        Long articlesCount = articleRepository.countByCategoryId(id);
        return categoryMapper.toResponse(category, articlesCount);
    }

    /**
     * Busca categoria por slug
     */
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryBySlug(String slug) {
        log.info("Buscando categoria por slug: {}", slug);

        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria", "slug", slug));

        Long articlesCount = articleRepository.countByCategoryId(category.getId());
        return categoryMapper.toResponse(category, articlesCount);
    }

    /**
     * Lista todas as categorias
     */
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        log.info("Listando todas as categorias");

        return categoryRepository.findAllByOrderByNameAsc().stream()
                .map(category -> {
                    Long articlesCount = articleRepository.countByCategoryId(category.getId());
                    return categoryMapper.toResponse(category, articlesCount);
                })
                .collect(Collectors.toList());
    }

    /**
     * Lista categorias com artigos publicados
     */
    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategoriesWithPublishedArticles() {
        log.info("Listando categorias com artigos publicados");

        return categoryRepository.findCategoriesWithPublishedArticles().stream()
                .map(category -> {
                    Long articlesCount = articleRepository.countPublishedArticlesByCategoryId(category.getId());
                    return categoryMapper.toResponse(category, articlesCount);
                })
                .collect(Collectors.toList());
    }

    /**
     * Atualiza categoria
     */
    public CategoryResponse updateCategory(Long id, UpdateCategoryRequest request) {
        log.info("Atualizando categoria ID: {}", id);

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria", "id", id));

        // Verifica se nome já existe (se estiver sendo alterado)
        if (request.getName() != null && !request.getName().equals(category.getName())) {
            if (categoryRepository.existsByName(request.getName())) {
                throw new DuplicateResourceException("Categoria", "nome", request.getName());
            }
            // Atualiza slug se nome mudou
            category.setSlug(generateUniqueSlug(request.getName()));
        }

        categoryMapper.updateEntity(category, request);

        Category updatedCategory = categoryRepository.save(category);

        log.info("Categoria atualizada com sucesso. ID: {}", updatedCategory.getId());

        Long articlesCount = articleRepository.countByCategoryId(updatedCategory.getId());
        return categoryMapper.toResponse(updatedCategory, articlesCount);
    }

    /**
     * Deleta categoria
     */
    public void deleteCategory(Long id) {
        log.info("Deletando categoria ID: {}", id);

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria", "id", id));

        // Verifica se há artigos associados
        Long articlesCount = articleRepository.countByCategoryId(id);
        if (articlesCount > 0) {
            throw new BadRequestException("Não é possível deletar categoria com artigos associados. " +
                    "Reatribua os " + articlesCount + " artigo(s) para outra categoria primeiro.");
        }

        categoryRepository.delete(category);

        log.info("Categoria deletada com sucesso. ID: {}", id);
    }

    /**
     * Gera slug único para categoria
     */
    private String generateUniqueSlug(String name) {
        String baseSlug = SlugGenerator.toSlug(name);
        String slug = baseSlug;
        int suffix = 0;

        while (categoryRepository.existsBySlug(slug)) {
            suffix++;
            slug = SlugGenerator.toUniqueSlug(baseSlug, suffix);
        }

        return slug;
    }
}
