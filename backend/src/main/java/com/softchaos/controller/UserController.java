package com.softchaos.controller;

import com.softchaos.dto.request.CreateUserRequest;
import com.softchaos.dto.request.UpdateUserRequest;
import com.softchaos.dto.response.ApiResponse;
import com.softchaos.dto.response.PagedResponse;
import com.softchaos.dto.response.UserResponse;
import com.softchaos.model.User;
import com.softchaos.security.UserPrincipal;
import com.softchaos.service.UserService;
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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Usuários", description = "Gerenciamento de usuários")
@PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
@SecurityRequirement(name = "bearer-jwt")
public class UserController {

    private final UserService userService;

    /**
     * Cria novo usuário
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Criar usuário", description = "Cria um novo usuário (apenas ADMIN)")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(
            @Valid @RequestBody CreateUserRequest request) {

        UserResponse user = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Usuário criado com sucesso", user));
    }

    /**
     * Busca usuário por ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Buscar usuário por ID", description = "Retorna detalhes de um usuário")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        UserResponse user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    /**
     * Busca usuário por email
     */
    @GetMapping("/email/{email}")
    @Operation(summary = "Buscar usuário por email", description = "Retorna usuário pelo email")
    public ResponseEntity<ApiResponse<UserResponse>> getUserByEmail(@PathVariable String email) {
        UserResponse user = userService.getUserByEmail(email);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    /**
     * Lista todos os usuários
     */
    @GetMapping
    @Operation(summary = "Listar usuários", description = "Retorna lista paginada de usuários")
    public ResponseEntity<ApiResponse<PagedResponse<UserResponse>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<UserResponse> users = userService.getAllUsers(pageable);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    /**
     * Lista usuários ativos
     */
    @GetMapping("/active")
    @Operation(summary = "Usuários ativos", description = "Retorna apenas usuários ativos")
    public ResponseEntity<ApiResponse<PagedResponse<UserResponse>>> getActiveUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<UserResponse> users = userService.getActiveUsers(pageable);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    /**
     * Lista usuários por role
     */
    @GetMapping("/role/{role}")
    @Operation(summary = "Usuários por role", description = "Retorna usuários de uma role específica")
    public ResponseEntity<ApiResponse<PagedResponse<UserResponse>>> getUsersByRole(
            @PathVariable User.Role role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<UserResponse> users = userService.getUsersByRole(role, pageable);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    /**
     * Busca usuários por nome
     */
    @GetMapping("/search")
    @Operation(summary = "Buscar usuários", description = "Busca usuários por nome")
    public ResponseEntity<ApiResponse<PagedResponse<UserResponse>>> searchUsers(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<UserResponse> users = userService.searchUsersByName(q, pageable);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    /**
     * Atualiza usuário
     */
    @PutMapping("/{id}")
    @Operation(summary = "Atualizar usuário", description = "Atualiza dados de um usuário")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        // Apenas ADMIN pode atualizar outros usuários
        // Usuários comuns só podem atualizar a si mesmos
        if (!currentUser.getRole().equals(User.Role.ADMIN) && !currentUser.getId().equals(id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Você não tem permissão para atualizar este usuário"));
        }

        UserResponse user = userService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.success("Usuário atualizado com sucesso", user));
    }

    /**
     * Ativa usuário
     */
    @PostMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Ativar usuário", description = "Ativa um usuário desativado")
    public ResponseEntity<ApiResponse<UserResponse>> activateUser(@PathVariable Long id) {
        UserResponse user = userService.activateUser(id);
        return ResponseEntity.ok(ApiResponse.success("Usuário ativado com sucesso", user));
    }

    /**
     * Desativa usuário
     */
    @PostMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Desativar usuário", description = "Desativa um usuário")
    public ResponseEntity<ApiResponse<UserResponse>> deactivateUser(@PathVariable Long id) {
        UserResponse user = userService.deactivateUser(id);
        return ResponseEntity.ok(ApiResponse.success("Usuário desativado com sucesso", user));
    }

    /**
     * Remove usuário
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Remover usuário", description = "Remove um usuário permanentemente")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("Usuário removido com sucesso", null));
    }
}