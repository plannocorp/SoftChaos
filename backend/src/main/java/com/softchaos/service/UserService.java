package com.softchaos.service;

import com.softchaos.dto.mapper.UserMapper;
import com.softchaos.dto.request.CreateUserRequest;
import com.softchaos.dto.request.UpdateUserRequest;
import com.softchaos.dto.response.PagedResponse;
import com.softchaos.dto.response.UserResponse;
import com.softchaos.dto.response.UserSummaryResponse;
import com.softchaos.exception.DuplicateResourceException;
import com.softchaos.exception.ResourceNotFoundException;
import com.softchaos.model.User;
import com.softchaos.repository.ArticleRepository;
import com.softchaos.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final ArticleRepository articleRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    /**
     * Cria um novo usuário
     */
    public UserResponse createUser(CreateUserRequest request) {
        log.info("Criando novo usuário com email: {}", request.getEmail());

        // Verifica se email já existe
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Usuário", "email", request.getEmail());
        }

        // Converte DTO para entidade
        User user = userMapper.toEntity(request);

        // Criptografa a senha
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // Salva no banco
        User savedUser = userRepository.save(user);

        log.info("Usuário criado com sucesso. ID: {}", savedUser.getId());

        // Retorna DTO de resposta
        Long publishedCount = articleRepository.countPublishedArticlesByAuthorId(savedUser.getId());
        return userMapper.toResponse(savedUser, publishedCount);
    }

    /**
     * Busca usuário por ID
     */
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        log.info("Buscando usuário por ID: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", "id", id));

        Long publishedCount = articleRepository.countPublishedArticlesByAuthorId(id);
        return userMapper.toResponse(user, publishedCount);
    }

    /**
     * Busca usuário por email
     */
    @Transactional(readOnly = true)
    public UserResponse getUserByEmail(String email) {
        log.info("Buscando usuário por email: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", "email", email));

        Long publishedCount = articleRepository.countPublishedArticlesByAuthorId(user.getId());
        return userMapper.toResponse(user, publishedCount);
    }

    /**
     * Lista todos os usuários com paginação
     */
    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> getAllUsers(Pageable pageable) {
        log.info("Listando usuários. Página: {}, Tamanho: {}", pageable.getPageNumber(), pageable.getPageSize());

        Page<User> usersPage = userRepository.findAll(pageable);

        return buildPagedResponse(usersPage);
    }

    /**
     * Lista usuários ativos
     */
    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> getActiveUsers(Pageable pageable) {
        log.info("Listando usuários ativos");

        Page<User> usersPage = userRepository.findByActiveTrue(pageable);

        return buildPagedResponse(usersPage);
    }

    /**
     * Lista usuários por role
     */
    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> getUsersByRole(User.Role role, Pageable pageable) {
        log.info("Listando usuários com role: {}", role);

        Page<User> usersPage = userRepository.findByRole(role, pageable);

        return buildPagedResponse(usersPage);
    }

    /**
     * Busca usuários por nome
     */
    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> searchUsersByName(String name, Pageable pageable) {
        log.info("Buscando usuários por nome: {}", name);

        Page<User> usersPage = userRepository.searchByName(name, pageable);

        return buildPagedResponse(usersPage);
    }

    /**
     * Lista autores com artigos publicados
     */
    @Transactional(readOnly = true)
    public PagedResponse<UserSummaryResponse> getAuthorsWithPublishedArticles(Pageable pageable) {
        log.info("Listando autores com artigos publicados");

        Page<User> authorsPage = userRepository.findAuthorsWithPublishedArticles(pageable);

        Page<UserSummaryResponse> responsePage = authorsPage.map(userMapper::toSummaryResponse);

        return PagedResponse.<UserSummaryResponse>builder()
                .content(responsePage.getContent())
                .pageNumber(responsePage.getNumber())
                .pageSize(responsePage.getSize())
                .totalElements(responsePage.getTotalElements())
                .totalPages(responsePage.getTotalPages())
                .last(responsePage.isLast())
                .build();
    }

    /**
     * Atualiza usuário
     */
    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        log.info("Atualizando usuário ID: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", "id", id));

        // Verifica se email já existe (se estiver sendo alterado)
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new DuplicateResourceException("Usuário", "email", request.getEmail());
            }
        }

        // Atualiza campos
        userMapper.updateEntity(user, request);

        // Criptografa nova senha se fornecida
        if (request.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        User updatedUser = userRepository.save(user);

        log.info("Usuário atualizado com sucesso. ID: {}", updatedUser.getId());

        Long publishedCount = articleRepository.countPublishedArticlesByAuthorId(updatedUser.getId());
        return userMapper.toResponse(updatedUser, publishedCount);
    }

    /**
     * Desativa usuário (soft delete)
     */
    public UserResponse deactivateUser(Long id) {
        log.info("Desativando usuário ID: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", "id", id));

        user.setActive(false);
        User savedUser = userRepository.save(user);

        log.info("Usuário desativado com sucesso. ID: {}", id);

        Long publishedCount = articleRepository.countPublishedArticlesByAuthorId(savedUser.getId());
        return userMapper.toResponse(savedUser, publishedCount);
    }

    /**
     * Ativa usuário
     */
    public UserResponse activateUser(Long id) {
        log.info("Ativando usuário ID: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", "id", id));

        user.setActive(true);
        User savedUser = userRepository.save(user);

        log.info("Usuário ativado com sucesso. ID: {}", id);

        Long publishedCount = articleRepository.countPublishedArticlesByAuthorId(savedUser.getId());
        return userMapper.toResponse(savedUser, publishedCount);
    }


    /**
     * Deleta usuário permanentemente
     */
    public void deleteUser(Long id) {
        log.info("Deletando usuário ID: {}", id);

        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("Usuário", "id", id);
        }

        userRepository.deleteById(id);

        log.info("Usuário deletado com sucesso. ID: {}", id);
    }

    /**
     * Método auxiliar para construir resposta paginada
     */
    private PagedResponse<UserResponse> buildPagedResponse(Page<User> usersPage) {
        Page<UserResponse> responsePage = usersPage.map(user -> {
            Long publishedCount = articleRepository.countPublishedArticlesByAuthorId(user.getId());
            return userMapper.toResponse(user, publishedCount);
        });

        return PagedResponse.<UserResponse>builder()
                .content(responsePage.getContent())
                .pageNumber(responsePage.getNumber())
                .pageSize(responsePage.getSize())
                .totalElements(responsePage.getTotalElements())
                .totalPages(responsePage.getTotalPages())
                .last(responsePage.isLast())
                .build();
    }
}
