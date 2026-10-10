-- Ajuste pontual para uma base existente: preserva artigos, textos, IDs e categorias anteriores.
-- Salve antes a consulta de mapeamento indicada em seed_supabase.md para poder reverter.
BEGIN;

INSERT INTO categories(name, slug, description)
VALUES
  ('Novidades', 'novidades', 'Novidades e noticias do SoftChaos.'),
  ('Tendencias', 'tendencias', 'Tendencias e cultura digital.'),
  ('Dicas', 'dicas', 'Dicas e referencias para criadores.'),
  ('Bastidores', 'bastidores', 'Processos e bastidores da criacao.'),
  ('Opiniao', 'opiniao', 'Opiniao e reflexoes editoriais.')
ON CONFLICT(slug) DO NOTHING;

WITH mapping(article_slug, category_slug) AS (
  VALUES
    ('demo-softchaos-01-biblioteca', 'novidades'),
    ('demo-softchaos-02-mapa', 'dicas'),
    ('demo-softchaos-03-festival', 'novidades'),
    ('demo-softchaos-04-caderno', 'bastidores'),
    ('demo-softchaos-05-clube', 'tendencias'),
    ('demo-softchaos-06-pausa', 'opiniao')
)
UPDATE articles a SET category_id = c.id
FROM mapping m JOIN categories c ON c.slug = m.category_slug
WHERE a.slug = m.article_slug AND a.title LIKE '[DEMO]%'
  AND a.category_id IS DISTINCT FROM c.id;

COMMIT;
