package com.softchaos.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSequenceSynchronizer {

    private static final List<SequenceTarget> SEQUENCE_TARGETS = List.of(
            new SequenceTarget("articles", "id"),
            new SequenceTarget("categories", "id"),
            new SequenceTarget("comments", "id"),
            new SequenceTarget("media", "id"),
            new SequenceTarget("newsletter", "id"),
            new SequenceTarget("pages", "id"),
            new SequenceTarget("tags", "id"),
            new SequenceTarget("users", "id")
    );

    private final JdbcTemplate jdbcTemplate;
    private final DataSource dataSource;

    @EventListener(ApplicationReadyEvent.class)
    public void synchronizePostgreSqlSequences() {
        if (!isPostgreSql()) {
            log.debug("Sincronizacao de sequences ignorada: banco atual nao e PostgreSQL");
            return;
        }

        SEQUENCE_TARGETS.forEach(target -> synchronizeSequenceIfPossible(target.tableName(), target.columnName()));
    }

    public void synchronizeArticlesSequence() {
        if (!isPostgreSql()) {
            return;
        }

        synchronizeSequenceIfPossible("articles", "id");
    }

    private void synchronizeSequenceIfPossible(String tableName, String columnName) {
        if (!tableExists(tableName)) {
            log.debug("Tabela {} nao encontrada; sequence nao sincronizada", tableName);
            return;
        }

        String sql = """
                SELECT setval(
                    pg_get_serial_sequence('%s', '%s'),
                    COALESCE((SELECT MAX(%s) FROM %s), 1),
                    (SELECT MAX(%s) IS NOT NULL FROM %s)
                )
                """.formatted(tableName, columnName, columnName, tableName, columnName, tableName);

        try {
            Long nextBaseValue = jdbcTemplate.queryForObject(sql, Long.class);
            log.info("Sequence sincronizada para {}.{} com base em {}", tableName, columnName, nextBaseValue);
        } catch (Exception ex) {
            log.warn("Nao foi possivel sincronizar a sequence de {}.{}: {}", tableName, columnName, ex.getMessage());
        }
    }

    private boolean tableExists(String tableName) {
        Boolean exists = jdbcTemplate.queryForObject(
                """
                SELECT EXISTS (
                    SELECT 1
                    FROM information_schema.tables
                    WHERE table_schema = current_schema()
                      AND table_name = ?
                )
                """,
                Boolean.class,
                tableName
        );

        return Boolean.TRUE.equals(exists);
    }

    private boolean isPostgreSql() {
        try (Connection connection = dataSource.getConnection()) {
            String databaseName = connection.getMetaData().getDatabaseProductName();
            return databaseName != null && databaseName.toLowerCase().contains("postgresql");
        } catch (SQLException ex) {
            log.warn("Nao foi possivel identificar o banco atual para sincronizar sequences", ex);
            return false;
        }
    }

    private record SequenceTarget(String tableName, String columnName) {
    }
}
