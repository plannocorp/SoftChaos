package com.softchaos.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class FileStorageConfig {

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Value("${media.storage.provider:local}")
    private String storageProvider;

    @Bean
    public Path fileStorageLocation() {
        if ("supabase".equalsIgnoreCase(storageProvider)) {
            return Paths.get(System.getProperty("java.io.tmpdir"), "softchaos-storage");
        }

        Path path = Paths.get(uploadDir).toAbsolutePath().normalize();

        try {
            Files.createDirectories(path);
            System.out.println("📁 Diretório de uploads criado em: " + path);
        } catch (IOException ex) {
            throw new RuntimeException("Não foi possível criar o diretório de uploads!", ex);
        }

        return path;
    }
}
