-- Seed idempotente para PostgreSQL / Supabase
-- Executar somente depois que o schema principal existir.

BEGIN;

-- Usuarios
INSERT INTO users (email, password, name, bio, avatar_url, role, active, created_at, updated_at)
VALUES
  (
    'admin@softchaos.com',
    '$2a$10$LVbdUwM7hqb28OyQh6jbI.kO59bsDXVLDBZuaXhXErEXcghLqPkB6',
    'Admin Soft Chaos',
    'Responsavel pela operacao editorial e moderacao completa do portal.',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
    'ADMIN',
    true,
    NOW(),
    NOW()
  ),
  (
    'editor@softchaos.com',
    '$2a$10$LVbdUwM7hqb28OyQh6jbI.kO59bsDXVLDBZuaXhXErEXcghLqPkB6',
    'Editor Soft Chaos',
    'Cuida da linha editorial, agendamentos e destaque das materias.',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    'EDITOR',
    true,
    NOW(),
    NOW()
  ),
  (
    'autor@softchaos.com',
    '$2a$10$LVbdUwM7hqb28OyQh6jbI.kO59bsDXVLDBZuaXhXErEXcghLqPkB6',
    'Autor Soft Chaos',
    'Escreve reportagens, analises e especiais para a plataforma.',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
    'AUTHOR',
    true,
    NOW(),
    NOW()
  )
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  bio = EXCLUDED.bio,
  avatar_url = EXCLUDED.avatar_url,
  role = EXCLUDED.role,
  active = EXCLUDED.active,
  updated_at = NOW();

-- Categorias
INSERT INTO categories (name, slug, description, icon_url)
VALUES
  ('Novidades', 'novidades', 'Lancamentos, anuncios e movimentos recentes da cena criativa.', null),
  ('Tendencias', 'tendencias', 'Leituras de comportamento, cultura digital e estica contemporanea.', null),
  ('Dicas', 'dicas', 'Guias praticos para criadores, leitores e equipes editoriais.', null),
  ('Bastidores', 'bastidores', 'Processos, metodo e contexto por tras das publicacoes.', null),
  ('Opiniao', 'opiniao', 'Colunas e pontos de vista com assinatura editorial.', null)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon_url = EXCLUDED.icon_url;

-- Paginas institucionais
INSERT INTO pages (title, slug, content, published)
VALUES
  (
    'Sobre a Soft Chaos',
    'sobre',
    'A Soft Chaos e um portal editorial que combina noticias, curadoria cultural e narrativas autorais em uma estrutura preparada para crescimento.',
    true
  ),
  (
    'Politica Editorial',
    'politica-editorial',
    'Valorizamos apuracao, clareza, responsabilidade com a audiencia e espaco para leituras criticas da cultura contemporanea.',
    true
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  published = EXCLUDED.published,
  updated_at = NOW();

-- Artigos
WITH author_ref AS (
  SELECT id AS author_id
  FROM users
  WHERE email = 'autor@softchaos.com'
),
editor_ref AS (
  SELECT id AS editor_id
  FROM users
  WHERE email = 'editor@softchaos.com'
),
category_refs AS (
  SELECT
    MAX(CASE WHEN slug = 'novidades' THEN id END) AS novidades_id,
    MAX(CASE WHEN slug = 'tendencias' THEN id END) AS tendencias_id,
    MAX(CASE WHEN slug = 'dicas' THEN id END) AS dicas_id,
    MAX(CASE WHEN slug = 'bastidores' THEN id END) AS bastidores_id,
    MAX(CASE WHEN slug = 'opiniao' THEN id END) AS opiniao_id
  FROM categories
)
INSERT INTO articles (
  title,
  slug,
  summary,
  content,
  cover_image_url,
  author_id,
  category_id,
  status,
  featured,
  pinned,
  view_count,
  published_at,
  scheduled_for,
  created_at,
  updated_at
)
SELECT
  article_seed.title,
  article_seed.slug,
  article_seed.summary,
  article_seed.content,
  article_seed.cover_image_url,
  article_seed.author_id,
  article_seed.category_id,
  article_seed.status,
  article_seed.featured,
  article_seed.pinned,
  article_seed.view_count,
  article_seed.published_at,
  article_seed.scheduled_for,
  NOW(),
  NOW()
FROM (
  SELECT
    'Panorama criativo de abril: o que esta movendo a conversa digital' AS title,
    'panorama-criativo-abril-conversa-digital' AS slug,
    'Um recorte editorial sobre os movimentos que mais concentraram atencao nas ultimas semanas.' AS summary,
    'A conversa digital mudou de ritmo. Plataformas, formatos curtos, curadoria visual e newsletters voltaram a ocupar o centro da estrategia editorial. Este material sintetiza os sinais mais relevantes para a operacao da Soft Chaos.' AS content,
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80' AS cover_image_url,
    (SELECT editor_id FROM editor_ref) AS author_id,
    (SELECT novidades_id FROM category_refs) AS category_id,
    'PUBLISHED' AS status,
    true AS featured,
    true AS pinned,
    482 AS view_count,
    NOW() - INTERVAL '7 days' AS published_at,
    NULL::timestamp AS scheduled_for
  UNION ALL
  SELECT
    'Estetica editorial em 2026: menos ruído, mais direcao',
    'estetica-editorial-2026-menos-ruido-mais-direcao',
    'Analise sobre o retorno de interfaces mais densas e identidades visuais mais marcadas.',
    'Em 2026, a linguagem visual das publicacoes digitais se distancia do minimalismo generico. Crescem propostas com mais textura, mais contraste e decisoes tipograficas mais assumidas.',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    (SELECT author_id FROM author_ref),
    (SELECT tendencias_id FROM category_refs),
    'PUBLISHED',
    true,
    false,
    361,
    NOW() - INTERVAL '3 days',
    NULL::timestamp
  UNION ALL
  SELECT
    'Checklist de publicacao para evitar retrabalho no painel admin',
    'checklist-publicacao-evitar-retrabalho-painel-admin',
    'Uma lista curta para revisar status, imagens, resumo e categoria antes de publicar.',
    'Antes de publicar, valide capa, resumo, categoria, slug, galeria, links externos e horario. Uma revisao de dois minutos reduz bastante o retrabalho editorial.',
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
    (SELECT editor_id FROM editor_ref),
    (SELECT dicas_id FROM category_refs),
    'PUBLISHED',
    false,
    false,
    214,
    NOW() - INTERVAL '1 day',
    NULL::timestamp
  UNION ALL
  SELECT
    'Como a redacao organiza pauta, aprovacao e agenda de materias',
    'como-redacao-organiza-pauta-aprovacao-e-agenda',
    'Bastidores do fluxo editorial que sustenta a publicacao continua do portal.',
    'A rotina combina quadro de status, filtros por etapa, revisao final e janelas de publicacao. O objetivo e reduzir gargalo entre criacao, aprovacao e entrada no ar.',
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
    (SELECT author_id FROM author_ref),
    (SELECT bastidores_id FROM category_refs),
    'SCHEDULED',
    false,
    false,
    0,
    NULL::timestamp,
    NOW() + INTERVAL '2 days'
  UNION ALL
  SELECT
    'Opinioes fortes exigem contexto melhor, nao volume maior',
    'opinioes-fortes-exigem-contexto-melhor',
    'Uma defesa da opiniao bem apurada como formato editorial, e nao apenas reacao instantanea.',
    'O valor de uma coluna esta menos no tom e mais na qualidade da ancoragem. Opiniao sem contexto vira ruido; opiniao com metodo cria leitura.',
    'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
    (SELECT editor_id FROM editor_ref),
    (SELECT opiniao_id FROM category_refs),
    'DRAFT',
    false,
    false,
    0,
    NULL::timestamp,
    NULL::timestamp
) AS article_seed
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content = EXCLUDED.content,
  cover_image_url = EXCLUDED.cover_image_url,
  author_id = EXCLUDED.author_id,
  category_id = EXCLUDED.category_id,
  status = EXCLUDED.status,
  featured = EXCLUDED.featured,
  pinned = EXCLUDED.pinned,
  view_count = EXCLUDED.view_count,
  published_at = EXCLUDED.published_at,
  scheduled_for = EXCLUDED.scheduled_for,
  updated_at = NOW();

-- Midias
WITH article_refs AS (
  SELECT
    MAX(CASE WHEN slug = 'panorama-criativo-abril-conversa-digital' THEN id END) AS panorama_id,
    MAX(CASE WHEN slug = 'estetica-editorial-2026-menos-ruido-mais-direcao' THEN id END) AS estetica_id,
    MAX(CASE WHEN slug = 'checklist-publicacao-evitar-retrabalho-painel-admin' THEN id END) AS checklist_id
  FROM articles
)
INSERT INTO media (url, filename, type, alt_text, file_size, article_id, uploaded_at)
SELECT
  media_seed.url,
  media_seed.filename,
  media_seed.type,
  media_seed.alt_text,
  media_seed.file_size,
  media_seed.article_id,
  NOW()
FROM (
  SELECT
    'https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&w=1200&q=80' AS url,
    'panorama-galeria-1.jpg' AS filename,
    'IMAGE' AS type,
    'Painel editorial com equipe em reuniao' AS alt_text,
    240000::bigint AS file_size,
    (SELECT panorama_id FROM article_refs) AS article_id
  UNION ALL
  SELECT
    'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80',
    'estetica-galeria-1.jpg',
    'IMAGE',
    'Composicao grafica com direcao de arte marcada',
    220000::bigint,
    (SELECT estetica_id FROM article_refs)
  UNION ALL
  SELECT
    'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80',
    'checklist-galeria-1.jpg',
    'IMAGE',
    'Pessoa revisando itens de publicacao no notebook',
    210000::bigint,
    (SELECT checklist_id FROM article_refs)
) AS media_seed
ON CONFLICT (filename) DO UPDATE SET
  url = EXCLUDED.url,
  alt_text = EXCLUDED.alt_text,
  file_size = EXCLUDED.file_size,
  article_id = EXCLUDED.article_id;

-- Comentarios
WITH article_refs AS (
  SELECT
    MAX(CASE WHEN slug = 'panorama-criativo-abril-conversa-digital' THEN id END) AS panorama_id,
    MAX(CASE WHEN slug = 'checklist-publicacao-evitar-retrabalho-painel-admin' THEN id END) AS checklist_id,
    MAX(CASE WHEN slug = 'estetica-editorial-2026-menos-ruido-mais-direcao' THEN id END) AS estetica_id
  FROM articles
)
INSERT INTO comments (author_name, author_email, content, article_id, status, created_at, status_updated_at)
SELECT
  comment_seed.author_name,
  comment_seed.author_email,
  comment_seed.content,
  comment_seed.article_id,
  comment_seed.status,
  comment_seed.created_at,
  comment_seed.status_updated_at
FROM (
  SELECT
    'Marina Costa' AS author_name,
    'marina.costa@example.com' AS author_email,
    'Excelente panorama. O recorte sobre newsletter e identidade visual resume bem o momento atual.' AS content,
    (SELECT panorama_id FROM article_refs) AS article_id,
    'APPROVED' AS status,
    NOW() - INTERVAL '6 days' AS created_at,
    NOW() - INTERVAL '6 days' AS status_updated_at
  UNION ALL
  SELECT
    'Rafael Prado',
    'rafael.prado@example.com',
    'Seria interessante detalhar quais formatos estao performando melhor em pauta fria.',
    (SELECT panorama_id FROM article_refs),
    'PENDING',
    NOW() - INTERVAL '2 days',
    NULL::timestamp
  UNION ALL
  SELECT
    'Juliana Melo',
    'juliana.melo@example.com',
    'Gostei do checklist. Bem pratico para quem publica sozinho.',
    (SELECT checklist_id FROM article_refs),
    'APPROVED',
    NOW() - INTERVAL '20 hours',
    NOW() - INTERVAL '20 hours'
  UNION ALL
  SELECT
    'Carlos Mendes',
    'carlos.mendes@example.com',
    'Discordo de parte da analise, mas o texto abre uma discussao boa.',
    (SELECT estetica_id FROM article_refs),
    'REJECTED',
    NOW() - INTERVAL '10 hours',
    NOW() - INTERVAL '8 hours'
) AS comment_seed
WHERE comment_seed.article_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM comments existing
    WHERE existing.article_id = comment_seed.article_id
      AND existing.author_email = comment_seed.author_email
      AND existing.content = comment_seed.content
  );

-- Newsletter
INSERT INTO newsletter_subscribers (email, name, active, confirmation_token, confirmed_at, subscribed_at)
VALUES
  ('leitor1@softchaos.com', 'Leitor Um', true, null, NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
  ('leitor2@softchaos.com', 'Leitora Dois', true, null, NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
  ('leitor3@softchaos.com', 'Leitor Tres', true, 'token-pendente-softchaos', null, NOW() - INTERVAL '2 days')
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  active = EXCLUDED.active,
  confirmation_token = EXCLUDED.confirmation_token,
  confirmed_at = EXCLUDED.confirmed_at;

COMMIT;
