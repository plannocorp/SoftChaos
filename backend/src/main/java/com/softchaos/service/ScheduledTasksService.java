package com.softchaos.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScheduledTasksService {

    private final ArticleService articleService;
    private final CommentService commentService;

    /**
     * Publica artigos agendados
     * Executa a cada 5 minutos
     */
    @Scheduled(fixedRate = 300000) // 5 minutos em milissegundos
    public void publishScheduledArticles() {
        log.info("Executando job de publicação de artigos agendados");

        try {
            articleService.processScheduledArticles();
        } catch (Exception e) {
            log.error("Erro ao processar artigos agendados", e);
        }
    }

    /**
     * Limpa tokens de confirmação expirados
     * Executa diariamente à meia-noite
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void cleanExpiredTokens() {
        log.info("Executando limpeza de tokens expirados");

        // TODO: Implementar limpeza de tokens com mais de 7 dias
    }

    /**
     * Remove comentarios rejeitados e apagados apos 10 dias.
     * Executa diariamente as 2h30.
     */
    @Scheduled(cron = "0 30 2 * * *")
    public void purgeOldModeratedComments() {
        log.info("Executando limpeza de comentarios rejeitados/apagados");

        try {
            commentService.deleteRejectedAndDeletedOlderThan(10);
        } catch (Exception e) {
            log.error("Erro ao limpar comentarios rejeitados/apagados", e);
        }
    }

    /**
     * Gera relatório de estatísticas
     * Executa toda segunda-feira às 9h
     */
    @Scheduled(cron = "0 0 9 * * MON")
    public void generateWeeklyReport() {
        log.info("Gerando relatório semanal");

        // TODO: Implementar geração de relatório
    }
}
