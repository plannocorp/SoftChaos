-- Conteudo ficticio para uma instalacao nova do SoftChaos.
-- Execute somente depois que a aplicacao tiver criado/atualizado o schema.
-- Nao cria credenciais utilizaveis nem altera dados fora dos slugs demo-softchaos-*.
BEGIN;

INSERT INTO users(email, password, name, bio, role, active, created_at, updated_at)
VALUES (
  'demo-editor@softchaos.blog',
  '!disabled:demo-author:no-login!',
  'Redacao SoftChaos Demo',
  'Autoria de conteudo ficticio de demonstracao.',
  'AUTHOR',
  false,
  now(),
  now()
)
ON CONFLICT(email) DO UPDATE SET
  password = EXCLUDED.password,
  name = EXCLUDED.name,
  bio = EXCLUDED.bio,
  role = 'AUTHOR',
  active = false,
  updated_at = now();

INSERT INTO categories(name, slug, description)
VALUES
  ('Novidades', 'novidades', 'Novidades e noticias do SoftChaos.'),
  ('Tendencias', 'tendencias', 'Tendencias e cultura digital.'),
  ('Dicas', 'dicas', 'Dicas e referencias para criadores.'),
  ('Bastidores', 'bastidores', 'Processos e bastidores da criacao.'),
  ('Opiniao', 'opiniao', 'Opiniao e reflexoes editoriais.')
ON CONFLICT(slug) DO NOTHING;

WITH author AS (
  SELECT id FROM users WHERE email = 'demo-editor@softchaos.blog'
), seed(slug, title, category, featured, hours_ago, summary, content) AS (
  VALUES
    ('demo-softchaos-01-biblioteca', '[DEMO] Cidade testa biblioteca de objetos', 'novidades', true, 3,
     'Noticia ficticia: uma cidade imaginaria testa o emprestimo comunitario de ferramentas.',
     '<p>Conteudo ficticio para demonstracao. Aurora e uma cidade inventada e esta biblioteca comunitaria nao existe.</p>'),
    ('demo-softchaos-02-mapa', '[DEMO] Aplicativo cria mapa de lugares tranquilos', 'dicas', true, 7,
     'Noticia ficticia: um aplicativo imaginario destaca espacos silenciosos.',
     '<p>Conteudo ficticio para demonstracao. O aplicativo e a metropole desta pauta sao inventados.</p>'),
    ('demo-softchaos-03-festival', '[DEMO] Festival transforma praca em laboratorio criativo', 'novidades', false, 15,
     'Noticia ficticia: um evento imaginario reune musica e oficinas.',
     '<p>Conteudo ficticio para demonstracao. Nenhuma data ou atracao real esta sendo anunciada.</p>'),
    ('demo-softchaos-04-caderno', '[DEMO] Estudio troca telas por caderno de criacao', 'bastidores', false, 27,
     'Noticia ficticia: um estudio inventado alterna pesquisa digital e papel.',
     '<p>Conteudo ficticio para demonstracao. O estudio e a rotina descritos sao inventados.</p>'),
    ('demo-softchaos-05-clube', '[DEMO] Clube incentiva trocas entre pequenos criadores', 'tendencias', false, 40,
     'Noticia ficticia: profissionais imaginarios compartilham habilidades.',
     '<p>Conteudo ficticio para demonstracao. O clube e seus participantes nao existem.</p>'),
    ('demo-softchaos-06-pausa', '[DEMO] Uma pausa criativa tambem faz parte do processo', 'opiniao', false, 60,
     'Opiniao ficticia sobre descanso e ritmo criativo.',
     '<p>Conteudo ficticio para demonstracao, escrito para apresentar o formato de opiniao.</p>')
)
INSERT INTO articles(
  title, slug, summary, content, cover_image_url, author_id, category_id,
  status, featured, pinned, view_count, published_at, created_at, updated_at
)
SELECT
  seed.title,
  seed.slug,
  seed.summary,
  seed.content,
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
  author.id,
  categories.id,
  'PUBLISHED',
  seed.featured,
  false,
  0,
  now() - make_interval(hours => seed.hours_ago),
  now(),
  now()
FROM seed
CROSS JOIN author
JOIN categories ON categories.slug = seed.category
ON CONFLICT(slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content = EXCLUDED.content,
  cover_image_url = EXCLUDED.cover_image_url,
  author_id = EXCLUDED.author_id,
  category_id = EXCLUDED.category_id,
  status = EXCLUDED.status,
  featured = EXCLUDED.featured,
  pinned = EXCLUDED.pinned,
  published_at = EXCLUDED.published_at,
  updated_at = now();

COMMIT;
