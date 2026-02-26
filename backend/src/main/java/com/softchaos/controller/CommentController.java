package com.softchaos.controller;

import com.softchaos.dto.request.CreateCommentRequest;
import com.softchaos.dto.response.ApiResponse;
import com.softchaos.dto.response.CommentResponse;
import com.softchaos.dto.response.PagedResponse;
import com.softchaos.service.CommentService;
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
@RequestMapping("/api/comments")
@RequiredArgsConstructor
@Tag(name = "Comentários", description = "Gerenciamento de comentários")
public class CommentController {

    private final CommentService commentService;

    /**
     * Cria novo comentário
     */
    @PostMapping("/article/{articleId}")
    @Operation(summary = "Criar comentário", description = "Adiciona um comentário a um artigo (público)")
    public ResponseEntity<ApiResponse<CommentResponse>> createComment(
            @Valid @RequestBody CreateCommentRequest request) {

        CommentResponse comment = commentService.createComment(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Comentário enviado! Aguardando aprovação.", comment));
    }

    /**
     * Lista comentários aprovados de um artigo
     */
    @GetMapping("/article/{articleId}")
    @Operation(summary = "Comentários do artigo", description = "Lista comentários aprovados de um artigo")
    public ResponseEntity<ApiResponse<PagedResponse<CommentResponse>>> getApprovedCommentsByArticle(
            @PathVariable Long articleId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<CommentResponse> comments = commentService.getApprovedCommentsByArticle(articleId, pageable);
        return ResponseEntity.ok(ApiResponse.success(comments));
    }

    /**
     * Lista comentários pendentes de aprovação
     */
    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Comentários pendentes", description = "Lista comentários aguardando aprovação")
    public ResponseEntity<ApiResponse<PagedResponse<CommentResponse>>> getPendingComments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<CommentResponse> comments = commentService.getPendingComments(pageable);
        return ResponseEntity.ok(ApiResponse.success(comments));
    }

    /**
     * Aprova comentário
     */
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Aprovar comentário", description = "Aprova um comentário pendente")
    public ResponseEntity<ApiResponse<CommentResponse>> approveComment(@PathVariable Long id) {
        CommentResponse comment = commentService.approveComment(id);
        return ResponseEntity.ok(ApiResponse.success("Comentário aprovado com sucesso", comment));
    }

    /**
     * Reprova comentário
     */
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Reprovar comentário", description = "Reprova um comentário")
    public ResponseEntity<ApiResponse<CommentResponse>> rejectComment(@PathVariable Long id) {
        CommentResponse comment = commentService.rejectComment(id);
        return ResponseEntity.ok(ApiResponse.success("Comentário reprovado", comment));
    }

    /**
     * Deleta comentário
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Deletar comentário", description = "Remove um comentário permanentemente")
    public ResponseEntity<ApiResponse<Void>> deleteComment(@PathVariable Long id) {
        commentService.deleteComment(id);
        return ResponseEntity.ok(ApiResponse.success("Comentário deletado com sucesso", null));
    }
}
