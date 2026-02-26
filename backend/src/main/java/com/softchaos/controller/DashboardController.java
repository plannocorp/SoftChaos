package com.softchaos.controller;

import com.softchaos.dto.response.ApiResponse;
import com.softchaos.dto.response.DashboardStatsResponse;
import com.softchaos.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Estatísticas e métricas do sistema")
@PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
@SecurityRequirement(name = "bearer-jwt")
public class DashboardController {

    private final DashboardService dashboardService;

    /**
     * Retorna estatísticas gerais do dashboard
     */
    @GetMapping("/stats")
    @Operation(summary = "Estatísticas do dashboard", description = "Retorna métricas gerais do sistema")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats() {
        DashboardStatsResponse stats = dashboardService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    /**
     * Retorna contadores rápidos
     */
    @GetMapping("/quick-stats")
    @Operation(summary = "Contadores rápidos", description = "Retorna contadores principais para cards do dashboard")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getQuickStats() {
        DashboardStatsResponse stats = dashboardService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
