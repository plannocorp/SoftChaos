package com.softchaos.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class DatabaseKeepAliveService {

    private final JdbcTemplate jdbcTemplate;

    @Value("${app.database.keepalive.enabled:true}")
    private boolean keepAliveEnabled;

    @Scheduled(fixedDelayString = "${app.database.keepalive.fixed-delay-ms:43200000}")
    public void keepDatabaseAwake() {
        if (!keepAliveEnabled) {
            return;
        }

        try {
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            log.info("Keepalive do banco executado com sucesso. Resultado: {}", result);
        } catch (Exception ex) {
            log.warn("Falha ao executar keepalive do banco", ex);
        }
    }
}
