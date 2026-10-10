package com.softchaos.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;
import java.util.Arrays;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.atomic.AtomicLong;

/** Applies per-client token-bucket limits before API controllers run. */
@Component
public class ApiRateLimitInterceptor implements HandlerInterceptor {

    private static final long WINDOW_MILLIS = 60_000L;
    private static final int MAX_BUCKETS = 20_000;
    private static final long BUCKET_TTL_MILLIS = 30 * 60_000L;

    private final ConcurrentMap<String, TokenBucket> buckets = new ConcurrentHashMap<>();
    private final AtomicLong requestCount = new AtomicLong();

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws IOException {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        Policy policy = policyFor(request);
        long now = System.currentTimeMillis();
        String bucketKey = clientAddress(request) + ':' + policy.key();
        TokenBucket bucket = bucketFor(bucketKey, policy, now);
        Consumption consumption = bucket.consume(now, policy.limit());

        response.setHeader("RateLimit-Limit", Integer.toString(policy.limit()));
        response.setHeader("RateLimit-Remaining", Integer.toString(consumption.remaining()));
        response.setHeader("RateLimit-Reset", Long.toString(consumption.retryAfterSeconds()));

        if (requestCount.incrementAndGet() % 256 == 0) {
            evictExpired(now);
        }

        if (consumption.allowed()) {
            return true;
        }

        response.setStatus(429);
        response.setHeader("Retry-After", Long.toString(consumption.retryAfterSeconds()));
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("{\"success\":false,\"message\":\"Limite de requisições atingido. Tente novamente em instantes.\"}");
        return false;
    }

    private Policy policyFor(HttpServletRequest request) {
        String path = request.getRequestURI();
        if ("/api/auth/login".equals(path)) {
            return new Policy("login", 10);
        }
        if (("POST".equalsIgnoreCase(request.getMethod()) && path.startsWith("/api/comments/article/"))
                || ("POST".equalsIgnoreCase(request.getMethod()) && "/api/newsletter/subscribe".equals(path))) {
            return new Policy("public-write", 8);
        }
        return new Policy("api", 120);
    }

    private String clientAddress(HttpServletRequest request) {
        // Caddy appends the address it observed to X-Forwarded-For. Use the last hop,
        // rather than the first, so a client-supplied prefix cannot choose its bucket.
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            String[] hops = forwardedFor.split(",");
            String lastHop = hops[hops.length - 1].trim();
            if (lastHop.matches("[0-9a-fA-F:.%]{1,64}")) {
                return lastHop;
            }
        }

        String remoteAddress = request.getRemoteAddr();
        return remoteAddress == null || remoteAddress.isBlank() ? "unknown" : remoteAddress;
    }

    private TokenBucket bucketFor(String key, Policy policy, long now) {
        TokenBucket existing = buckets.get(key);
        if (existing != null) {
            return existing;
        }

        if (buckets.size() >= MAX_BUCKETS) {
            evictExpired(now);
        }
        if (buckets.size() >= MAX_BUCKETS) {
            key = "__capacity__:" + policy.key();
        }
        return buckets.computeIfAbsent(key, ignored -> new TokenBucket(now, policy.limit()));
    }

    private void evictExpired(long now) {
        buckets.entrySet().removeIf(entry -> now - entry.getValue().lastTouchedMillis() > BUCKET_TTL_MILLIS);
        if (buckets.size() > MAX_BUCKETS) {
            String[] keys = buckets.keySet().stream().limit(buckets.size() - MAX_BUCKETS).toArray(String[]::new);
            Arrays.stream(keys).forEach(buckets::remove);
        }
    }

    private record Policy(String key, int limit) { }

    private record Consumption(boolean allowed, int remaining, long retryAfterSeconds) { }

    private static final class TokenBucket {
        private double tokens;
        private long lastRefillMillis;
        private volatile long lastTouchedMillis;

        private TokenBucket(long now, int capacity) {
            this.tokens = capacity;
            this.lastRefillMillis = now;
            this.lastTouchedMillis = now;
        }

        private synchronized Consumption consume(long now, int capacity) {
            double refillPerMillisecond = (double) capacity / WINDOW_MILLIS;
            long elapsed = Math.max(0, now - lastRefillMillis);
            tokens = Math.min(capacity, tokens + elapsed * refillPerMillisecond);
            lastRefillMillis = now;
            lastTouchedMillis = now;

            if (tokens >= 1.0) {
                tokens -= 1.0;
                return new Consumption(true, (int) Math.floor(tokens), 0);
            }

            long retryAfter = (long) Math.ceil((1.0 - tokens) / refillPerMillisecond / 1000.0);
            return new Consumption(false, 0, Math.max(1, retryAfter));
        }

        private long lastTouchedMillis() {
            return lastTouchedMillis;
        }
    }
}
