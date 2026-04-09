package com.softchaos.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Value("${media.storage.provider:local}")
    private String storageProvider;

    /**
     * Configura o Spring para servir arquivos do diretório de uploads
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        if ("supabase".equalsIgnoreCase(storageProvider)) {
            return;
        }

        String uploadPath = Paths.get(uploadDir).toAbsolutePath().toUri().toString();

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadPath);
    }
}
