package com.softchaos.repository;

import com.softchaos.model.Newsletter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NewsletterRepository extends JpaRepository<Newsletter, Long> {

    /**
     * Busca assinante por email
     */
    Optional<Newsletter> findByEmail(String email);

    /**
     * Verifica se email já está cadastrado
     */
    boolean existsByEmail(String email);

    /**
     * Busca assinante por token de confirmação
     */
    Optional<Newsletter> findByConfirmationToken(String token);

    /**
     * Busca assinantes ativos
     */
    Page<Newsletter> findByActiveTrue(Pageable pageable);

    /**
     * Busca todos os emails ativos (para envio de newsletter)
     */
    List<Newsletter> findByActiveTrueAndConfirmedAtIsNotNull();

    /**
     * Conta assinantes ativos
     */
    Long countByActiveTrue();

    /**
     * Busca assinantes não confirmados
     */
    List<Newsletter> findByConfirmedAtIsNull();
}
