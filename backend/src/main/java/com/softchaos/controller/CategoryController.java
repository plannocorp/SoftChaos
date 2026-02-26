package com.softchaos.controller;

import com.softchaos.dto.request.CreateCategoryRequest;
import com.softchaos.dto.request.UpdateCategoryRequest;
import com.softchaos.dto.response.ApiResponse;
import com.softchaos.dto.response.CategoryResponse;
import com.softchaos.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Tag(name = "Categorias", description = "Gerenciamento de categorias")
public class CategoryController {

    private final CategoryService categoryService;

    /**
     * Cria nova categoria
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Criar categoria", description = "Cria uma nova categoria")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @Valid @RequestBody CreateCategoryRequest request) {

        CategoryResponse category = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Categoria criada com sucesso", category));
    }

    /**
     * Busca categoria por ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Buscar categoria por ID", description = "Retorna detalhes de uma categoria")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(@PathVariable Long id) {
        CategoryResponse category = categoryService.getCategoryById(id);
        return ResponseEntity.ok(ApiResponse.success(category));
    }

    /**
     * Busca categoria por slug
     */
    @GetMapping("/slug/{slug}")
    @Operation(summary = "Buscar categoria por slug", description = "Retorna categoria pela URL amigável")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryBySlug(@PathVariable String slug) {
        CategoryResponse category = categoryService.getCategoryBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success(category));
    }

    /**
     * Lista todas as categorias
     */
    @GetMapping
    @Operation(summary = "Listar categorias", description = "Retorna todas as categorias")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        List<CategoryResponse> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    /**
     * Lista categorias com artigos publicados
     */
    @GetMapping("/with-articles")
    @Operation(summary = "Categorias com artigos", description = "Retorna apenas categorias que têm artigos publicados")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategoriesWithPublishedArticles() {
        List<CategoryResponse> categories = categoryService.getCategoriesWithPublishedArticles();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    /**
     * Atualiza categoria
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Atualizar categoria", description = "Atualiza uma categoria existente")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCategoryRequest request) {

        CategoryResponse category = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponse.success("Categoria atualizada com sucesso", category));
    }

    /**
     * Deleta categoria
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Deletar categoria", description = "Remove uma categoria (apenas se não tiver artigos)")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Categoria deletada com sucesso", null));
    }
}
