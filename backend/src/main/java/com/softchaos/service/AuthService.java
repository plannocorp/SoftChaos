package com.softchaos.service;

import com.softchaos.dto.request.CreateUserRequest;
import com.softchaos.dto.request.LoginRequest;
import com.softchaos.dto.response.AuthResponse;
import com.softchaos.exception.BadRequestException;
import com.softchaos.exception.DuplicateResourceException;
import com.softchaos.model.User;
import com.softchaos.repository.UserRepository;
import com.softchaos.security.JwtTokenProvider;
import com.softchaos.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    /**
     * Autentica usuário e retorna token JWT
     */
    public AuthResponse login(LoginRequest request) {
        log.info("Tentativa de login para email: {}", request.getEmail());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = tokenProvider.generateToken(authentication);

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        log.info("Login bem-sucedido para usuário: {}", userPrincipal.getEmail());

        return AuthResponse.builder()
                .token(jwt)
                .type("Bearer")
                .userId(userPrincipal.getId())
                .email(userPrincipal.getEmail())
                .name(userPrincipal.getName())
                .role(userPrincipal.getRole())
                .build();
    }

    /**
     * Registra novo usuário
     */
    public AuthResponse register(CreateUserRequest request) {
        log.info("Tentativa de registro para email: {}", request.getEmail());

        // Verifica se email já existe
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email já cadastrado");
        }

        // Cria novo usuário
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());
        user.setBio(request.getBio());
        user.setAvatarUrl(request.getAvatarUrl());
        user.setRole(request.getRole() != null ? request.getRole() : User.Role.AUTHOR);
        user.setActive(true);

        User savedUser = userRepository.save(user);

        log.info("Usuário registrado com sucesso: {}", savedUser.getEmail());

        // Gera token
        String jwt = tokenProvider.generateTokenFromUserId(savedUser.getId());

        return AuthResponse.builder()
                .token(jwt)
                .type("Bearer")
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .name(savedUser.getName())
                .role(savedUser.getRole())
                .build();
    }

    /**
     * Retorna usuário autenticado atual
     */
    @Transactional(readOnly = true)
    public UserPrincipal getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BadRequestException("Usuário não autenticado");
        }

        return (UserPrincipal) authentication.getPrincipal();
    }

    /**
     * Retorna ID do usuário autenticado atual
     */
    public Long getCurrentUserId() {
        return getCurrentUser().getId();
    }
}
