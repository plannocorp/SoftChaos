package com.softchaos.config;

import com.softchaos.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    @Value("${app.cors.allowed-origins:http://localhost:4200}")
    private String allowedOrigins;

    @Value("${app.security.expose-docs:false}")
    private boolean exposeDocs;

    @Value("${app.security.expose-h2-console:false}")
    private boolean exposeH2Console;

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(buildPublicMatchers()).permitAll()
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .headers(headers -> {
                    if (exposeH2Console) {
                        headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin);
                    }
                });

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(resolveAllowedOriginPatterns());
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder);
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    private List<String> resolveAllowedOriginPatterns() {
        List<String> origins = new ArrayList<>();

        for (String origin : allowedOrigins.split(",")) {
            String normalizedOrigin = origin.trim();
            if (!normalizedOrigin.isEmpty()) {
                origins.add(normalizedOrigin);
            }
        }

        return origins.isEmpty() ? List.of("http://localhost:4200") : List.copyOf(origins);
    }

    private String[] buildPublicMatchers() {
        List<String> matchers = new ArrayList<>();

        Collections.addAll(matchers,
                "/api/auth/login",
                "/api/articles",
                "/api/articles/category/**",
                "/api/articles/author/**",
                "/api/articles/featured",
                "/api/articles/pinned",
                "/api/articles/most-viewed",
                "/api/articles/latest",
                "/api/articles/*/related",
                "/api/articles/search",
                "/api/articles/slug/**",
                "/api/categories",
                "/api/categories/slug/**",
                "/api/categories/with-articles",
                "/api/pages/**",
                "/api/comments/article/**",
                "/api/newsletter/**",
                "/uploads/**",
                "/static/**",
                "/actuator/health",
                "/actuator/info"
        );

        if (exposeH2Console) {
            matchers.add("/h2-console/**");
        }

        if (exposeDocs) {
            matchers.add("/v3/api-docs/**");
            matchers.add("/swagger-ui/**");
            matchers.add("/swagger-ui.html");
        }

        return matchers.toArray(new String[0]);
    }
}
