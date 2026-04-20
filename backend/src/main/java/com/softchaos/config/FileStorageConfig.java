package com.softchaos.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class FileStorageConfig {

    @Bean
    public Path fileStorageLocation() {
        try {
            Path path = Paths.get(System.getProperty("java.io.tmpdir"), "softchaos-storage");
            Files.createDirectories(path);
            return path;
        } catch (Exception ex) {
            throw new RuntimeException("Nao foi possivel preparar o diretorio temporario de upload!", ex);
        }
    }
}
