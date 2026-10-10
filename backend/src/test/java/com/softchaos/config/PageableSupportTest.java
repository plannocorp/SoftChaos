package com.softchaos.config;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class PageableSupportTest {

    @Test
    void clampsPageAndSizeToSafeBounds() {
        var first = PageableSupport.of(-5, 10_000);
        var last = PageableSupport.of(Integer.MAX_VALUE, 0);

        assertEquals(0, first.getPageNumber());
        assertEquals(PageableSupport.MAX_PAGE_SIZE, first.getPageSize());
        assertEquals(10_000, last.getPageNumber());
        assertEquals(1, last.getPageSize());
    }

    @Test
    void clampsListLimitsAndUsesDefaultsForInvalidValues() {
        assertEquals(5, PageableSupport.limit(0, 5, 50));
        assertEquals(50, PageableSupport.limit(5_000, 5, 50));
        assertEquals(3, PageableSupport.limit(3, 5, 50));
    }
}
