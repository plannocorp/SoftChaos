package com.softchaos.security;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ApiRateLimitInterceptorTest {

    private final ApiRateLimitInterceptor interceptor = new ApiRateLimitInterceptor();

    @Test
    void limitsLoginAttemptsAndReturnsRetryHeaders() throws Exception {
        for (int attempt = 0; attempt < 10; attempt++) {
            assertTrue(intercept("198.51.100.10", "/api/auth/login", null).allowed());
        }

        Result blocked = intercept("198.51.100.10", "/api/auth/login", null);

        assertFalse(blocked.allowed());
        assertEquals(429, blocked.response().getStatus());
        assertEquals("10", blocked.response().getHeader("RateLimit-Limit"));
        assertEquals("0", blocked.response().getHeader("RateLimit-Remaining"));
        assertTrue(Long.parseLong(blocked.response().getHeader("Retry-After")) > 0);
        assertTrue(blocked.response().getContentAsString().contains("Limite de requisições"));
    }

    @Test
    void isolatesClientsAndUsesProxyAppendedAddress() throws Exception {
        for (int attempt = 0; attempt < 10; attempt++) {
            assertTrue(intercept("192.0.2.1", "/api/auth/login", "203.0.113.1, 198.51.100.11").allowed());
        }

        assertFalse(intercept("192.0.2.2", "/api/auth/login", "10.0.0.1, 198.51.100.11").allowed());
        assertTrue(intercept("192.0.2.2", "/api/auth/login", "10.0.0.1, 198.51.100.12").allowed());
    }

    @Test
    void limitsPublicWritesMoreStrictlyThanReads() throws Exception {
        for (int attempt = 0; attempt < 8; attempt++) {
            assertTrue(intercept("198.51.100.20", "/api/newsletter/subscribe", null, "POST").allowed());
        }

        assertFalse(intercept("198.51.100.20", "/api/newsletter/subscribe", null, "POST").allowed());
        assertTrue(intercept("198.51.100.20", "/api/articles/latest", null).allowed());
    }

    private Result intercept(String remoteAddress, String path, String forwardedFor) throws Exception {
        return intercept(remoteAddress, path, forwardedFor, "POST");
    }

    private Result intercept(String remoteAddress, String path, String forwardedFor, String method) throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest(method, path);
        request.setRequestURI(path);
        request.setRemoteAddr(remoteAddress);
        if (forwardedFor != null) {
            request.addHeader("X-Forwarded-For", forwardedFor);
        }
        MockHttpServletResponse response = new MockHttpServletResponse();
        boolean allowed = interceptor.preHandle(request, response, new Object());
        return new Result(allowed, response);
    }

    private record Result(boolean allowed, MockHttpServletResponse response) { }
}
