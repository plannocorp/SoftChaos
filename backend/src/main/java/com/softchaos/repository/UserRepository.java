package com.softchaos.repository;

import com.softchaos.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Busca usuário por email (usado na autenticação)
     */
    Optional<User> findByEmail(String email);

    /**
     * Verifica se existe usuário com determinado email
     */
    boolean existsByEmail(String email);

    /**
     * Busca usuários por role (perfil)
     */
    Page<User> findByRole(User.Role role, Pageable pageable);

    /**
     * Busca usuários ativos
     */
    Page<User> findByActiveTrue(Pageable pageable);

    /**
     * Busca usuários por nome (case insensitive, parcial)
     */
    @Query("SELECT u FROM User u WHERE LOWER(u.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<User> searchByName(@Param("name") String name, Pageable pageable);

    /**
     * Conta quantos artigos publicados um autor tem
     */
    @Query("SELECT COUNT(a) FROM Article a WHERE a.author.id = :authorId AND a.status = 'PUBLISHED'")
    Long countPublishedArticlesByAuthor(@Param("authorId") Long authorId);

    /**
     * Busca autores com artigos publicados
     */
    @Query("SELECT DISTINCT u FROM User u JOIN u.articles a WHERE a.status = 'PUBLISHED'")
    Page<User> findAuthorsWithPublishedArticles(Pageable pageable);
}
