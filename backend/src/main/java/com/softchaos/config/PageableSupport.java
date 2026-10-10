package com.softchaos.config;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

public final class PageableSupport {

    public static final int MAX_PAGE_SIZE = 100;
    private static final int MAX_PAGE_INDEX = 10_000;

    private PageableSupport() { }

    public static Pageable of(int page, int size) {
        return of(page, size, Sort.unsorted());
    }

    public static Pageable of(int page, int size, Sort sort) {
        int safePage = Math.min(Math.max(page, 0), MAX_PAGE_INDEX);
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        return PageRequest.of(safePage, safeSize, sort);
    }

    public static int limit(int requestedLimit, int defaultLimit, int maximum) {
        if (requestedLimit <= 0) {
            return defaultLimit;
        }
        return Math.min(requestedLimit, maximum);
    }
}
