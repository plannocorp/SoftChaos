package com.softchaos.controller;

import com.softchaos.dto.request.CreateCommentRequest;
import com.softchaos.dto.response.ApiResponse;
import com.softchaos.dto.response.CommentResponse;
import com.softchaos.dto.response.PagedResponse;
import com.softchaos.enums.CommentStatus;
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
@Tag(name = "Comentarios", description = "Gerenciamento de comentarios")
public class CommentController {

    private final CommentService commentService;

    @PostMapping("/article/{articleId}")
    public ResponseEntity<ApiResponse<CommentResponse>> createComment(
            @PathVariable Long articleId,
            @Valid @RequestBody CreateCommentRequest request) {

        request.setArticleId(articleId);

        CommentResponse comment = commentService.createComment(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Comentario enviado! Aguardando aprovacao.", comment));
    }

    @GetMapping("/article/{articleId}")
    @Operation(summary = "Comentarios do artigo", description = "Lista comentarios aprovados de um artigo")
    public ResponseEntity<ApiResponse<PagedResponse<CommentResponse>>> getApprovedCommentsByArticle(
            @PathVariable Long articleId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<CommentResponse> comments = commentService.getApprovedCommentsByArticle(articleId, pageable);
        return ResponseEntity.ok(ApiResponse.success(comments));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Comentarios pendentes", description = "Lista comentarios aguardando aprovacao")
    public ResponseEntity<ApiResponse<PagedResponse<CommentResponse>>> getPendingComments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<CommentResponse> comments = commentService.getPendingComments(pageable);
        return ResponseEntity.ok(ApiResponse.success(comments));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Comentarios do painel", description = "Lista comentarios por status para moderacao")
    public ResponseEntity<ApiResponse<PagedResponse<CommentResponse>>> getAdminComments(
            @RequestParam(required = false) CommentStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {

        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<CommentResponse> comments = commentService.getAdminComments(status, pageable);
        return ResponseEntity.ok(ApiResponse.success(comments));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Aprovar comentario", description = "Aprova um comentario")
    public ResponseEntity<ApiResponse<CommentResponse>> approveComment(@PathVariable Long id) {
        CommentResponse comment = commentService.approveComment(id);
        return ResponseEntity.ok(ApiResponse.success("Comentario aprovado com sucesso", comment));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Reprovar comentario", description = "Reprova um comentario")
    public ResponseEntity<ApiResponse<CommentResponse>> rejectComment(@PathVariable Long id) {
        CommentResponse comment = commentService.rejectComment(id);
        return ResponseEntity.ok(ApiResponse.success("Comentario reprovado", comment));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Deletar comentario", description = "Marca um comentario como deletado")
    public ResponseEntity<ApiResponse<Void>> deleteComment(@PathVariable Long id) {
        commentService.deleteComment(id);
        return ResponseEntity.ok(ApiResponse.success("Comentario deletado com sucesso", null));
    }
}

