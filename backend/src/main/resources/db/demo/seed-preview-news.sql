-- Conteúdo fictício temporário para a apresentação do SoftChaos.
-- Cada matéria é identificada pelo prefixo demo-softchaos- para facilitar a remoção.
-- A conta de autoria tem uma senha deliberadamente inválida para impedir login.
BEGIN;

INSERT INTO users (email, password, name, bio, role, active, created_at, updated_at)
VALUES (
  'demo-editor@softchaos.blog',
  '!disabled:demo-author:no-login!',
  'Redação SoftChaos · Demonstração',
  'Perfil técnico usado somente como autoria do conteúdo fictício de demonstração.',
  'AUTHOR',
  true,
  now(),
  now()
)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  bio = EXCLUDED.bio,
  role = 'AUTHOR',
  active = true,
  updated_at = now();

INSERT INTO categories (name, slug, description, icon_url)
VALUES
  ('Tecnologia', 'tecnologia', 'Pautas fictícias de tecnologia para demonstração do site.', null),
  ('Cultura Digital', 'cultura-digital', 'Pautas fictícias de cultura digital para demonstração do site.', null),
  ('Tendências', 'tendencias', 'Pautas fictícias de tendências para demonstração do site.', null),
  ('Criatividade', 'criatividade', 'Pautas fictícias de criatividade para demonstração do site.', null)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

WITH demo_author AS (
  SELECT id FROM users WHERE email = 'demo-editor@softchaos.blog'
), demo_articles AS (
  SELECT * FROM (VALUES
    (
      'demo-softchaos-01-biblioteca-de-objetos',
      '[DEMO] Cidade fictícia testa biblioteca de objetos compartilhados',
      'NOTÍCIA FICTÍCIA PARA DEMONSTRAÇÃO. Em Aurora, uma cidade imaginária, moradores poderiam emprestar ferramentas e equipamentos em uma biblioteca comunitária.',
      '<p><strong>Conteúdo fictício de demonstração.</strong> Aurora é uma cidade imaginária criada para esta apresentação.</p><p>Na pauta simulada, a cidade inaugura uma biblioteca de objetos compartilhados. A proposta é emprestar ferramentas, equipamentos de camping e utensílios de uso ocasional.</p><p>O exemplo serve apenas para mostrar como uma reportagem longa aparece no SoftChaos. Nomes, iniciativa, local e números desta matéria são fictícios.</p>',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200',
      'cultura-digital', true, true, 82, 3
    ),
    (
      'demo-softchaos-02-mapa-de-silencio',
      '[DEMO] Aplicativo imaginário cria mapa de lugares tranquilos',
      'NOTÍCIA FICTÍCIA PARA DEMONSTRAÇÃO. Um produto inventado usa relatos de moradores para destacar espaços silenciosos em uma metrópole imaginária.',
      '<p><strong>Conteúdo fictício de demonstração.</strong> O aplicativo e a metrópole citados nesta pauta não existem.</p><p>A ideia simulada combina avaliações voluntárias sobre ruído, sombra e lugares para uma pausa. O mapa poderia ajudar quem procura um intervalo tranquilo durante o dia.</p><p>Esta narrativa é um exemplo de layout e conteúdo para apresentação; não descreve um serviço disponível.</p>',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200',
      'tecnologia', true, false, 57, 7
    ),
    (
      'demo-softchaos-03-festival-de-ideias',
      '[DEMO] Festival inventado transforma uma praça em laboratório criativo',
      'NOTÍCIA FICTÍCIA PARA DEMONSTRAÇÃO. Um evento imaginário reúne música, oficinas e instalações interativas em um cenário urbano fictício.',
      '<p><strong>Conteúdo fictício de demonstração.</strong> O festival, seus artistas e a praça descritos são imaginários.</p><p>Nesta pauta de exemplo, visitantes participam de oficinas curtas, instalações interativas e apresentações musicais. A programação foi criada somente para demonstrar uma matéria cultural no site.</p><p>Nenhuma data, atração ou local real está sendo anunciado.</p>',
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200',
      'cultura-digital', false, false, 34, 15
    ),
    (
      'demo-softchaos-04-caderno-de-criacao',
      '[DEMO] Estúdio fictício troca telas por um caderno de criação',
      'NOTÍCIA FICTÍCIA PARA DEMONSTRAÇÃO. Um estúdio inventado testa uma rotina de trabalho que alterna pesquisa digital e rascunhos em papel.',
      '<p><strong>Conteúdo fictício de demonstração.</strong> O estúdio descrito nesta matéria é inventado.</p><p>A rotina simulada reserva blocos curtos para referências, rascunho manual e revisão coletiva. O objetivo editorial é explorar uma ideia comum entre equipes criativas: como deixar espaço para experimentar?</p><p>O texto não relata uma pesquisa real e foi preparado como conteúdo de demonstração.</p>',
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200',
      'criatividade', false, false, 28, 27
    ),
    (
      'demo-softchaos-05-clube-de-trocas',
      '[DEMO] Clube imaginário incentiva trocas entre pequenos criadores',
      'NOTÍCIA FICTÍCIA PARA DEMONSTRAÇÃO. Em um cenário inventado, profissionais independentes compartilham habilidades em encontros mensais.',
      '<p><strong>Conteúdo fictício de demonstração.</strong> O clube e os participantes desta pauta são personagens imaginários.</p><p>O formato de exemplo inclui uma rodada de apresentações, conversas em grupos pequenos e uma vitrine de projetos pessoais. A matéria ilustra uma pauta de comunidade sem anunciar um evento existente.</p><p>Esta notícia pode ser removida após a apresentação ao cliente.</p>',
      'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1200',
      'tendencias', false, false, 19, 40
    ),
    (
      'demo-softchaos-06-pausa-criativa',
      '[DEMO] Uma pausa criativa também pode fazer parte do processo',
      'OPINIÃO FICTÍCIA PARA DEMONSTRAÇÃO. Um texto de exemplo sobre descanso, repertório e ritmo criativo.',
      '<p><strong>Conteúdo fictício de demonstração.</strong> Este ensaio foi escrito para apresentar o formato de opinião.</p><p>Nem toda boa ideia aparece diante de uma tela. Às vezes, uma pausa curta permite organizar referências, perceber uma pergunta melhor ou apenas voltar ao trabalho com mais clareza.</p><p>Este é um texto ilustrativo, não uma recomendação profissional ou relato baseado em pesquisa.</p>',
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200',
      'criatividade', false, false, 13, 60
    )
  ) AS rows(slug, title, summary, content, cover_image_url, category_slug, featured, pinned, view_count, hours_ago)
)
INSERT INTO articles (
  title, slug, summary, content, cover_image_url, author_id, category_id,
  status, featured, pinned, view_count, published_at, created_at, updated_at
)
SELECT
  demo_articles.title,
  demo_articles.slug,
  demo_articles.summary,
  demo_articles.content,
  demo_articles.cover_image_url,
  demo_author.id,
  categories.id,
  'PUBLISHED',
  demo_articles.featured,
  demo_articles.pinned,
  demo_articles.view_count,
  now() - make_interval(hours => demo_articles.hours_ago),
  now(),
  now()
FROM demo_articles
CROSS JOIN demo_author
JOIN categories ON categories.slug = demo_articles.category_slug
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
  updated_at = now();

COMMIT;
