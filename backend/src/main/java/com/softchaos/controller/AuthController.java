package com.softchaos.controller;

import com.softchaos.dto.request.CreateUserRequest;
import com.softchaos.dto.request.LoginRequest;
import com.softchaos.dto.response.ApiResponse;
import com.softchaos.dto.response.AuthResponse;
import com.softchaos.dto.response.UserResponse;
import com.softchaos.security.UserPrincipal;
import com.softchaos.service.AuthService;
import com.softchaos.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticação", description = "Endpoints de autenticação e registro")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    @PostMapping("/login")
    @Operation(summary = "Login", description = "Autentica usuário e retorna token JWT")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse authResponse = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login realizado com sucesso", authResponse));
    }

    @PostMapping("/register")
    @Operation(summary = "Registro", description = "Registra novo usuário")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody CreateUserRequest request) {
        AuthResponse authResponse = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Usuário registrado com sucesso", authResponse));
    }

    @GetMapping("/me")
    @Operation(summary = "Usuário atual", description = "Retorna dados do usuário autenticado")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(@AuthenticationPrincipal UserPrincipal currentUser) {
        UserResponse userResponse = userService.getUserById(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(userResponse));
    }
}
