package com.softchaos.util;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

public class SlugGenerator {

    // Remove acentos e caracteres especiais
    //Substitui espaços por hífens
    //Converte para minúsculas
    //Exemplo: "Tendências de Marketing 2024" → "tendencias-de-marketing-2024"



    private static final Pattern NON_LATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");
    private static final Pattern EDGES_DASHES = Pattern.compile("(^-|-$)");

    public static String toSlug(String input) {
        if (input == null) {
            return "";
        }

        String noWhitespace = WHITESPACE.matcher(input).replaceAll("-");
        String normalized = Normalizer.normalize(noWhitespace, Normalizer.Form.NFD);
        String slug = NON_LATIN.matcher(normalized).replaceAll("");
        slug = EDGES_DASHES.matcher(slug).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH);
    }

    public static String toUniqueSlug(String input, int suffix) {
        String baseSlug = toSlug(input);
        return suffix > 0 ? baseSlug + "-" + suffix : baseSlug;
    }
}
