package com.softchaos.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    /**
     * Upload local foi removido. Arquivos devem ser servidos apenas pelo Storage remoto.
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Sem handlers locais.
    }
}
