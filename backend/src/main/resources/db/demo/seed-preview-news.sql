-- Conteúdo fictício temporário para a apresentação do SoftChaos.
-- Remova as matérias pelo prefixo demo-softchaos- após a apresentação.
-- A conta de autoria tem uma senha deliberadamente inválida para impedir login.
BEGIN;

INSERT INTO users(email, password, name, bio, role, active, created_at, updated_at)
VALUES ('demo-editor@softchaos.blog', '!disabled:demo-author:no-login!', 'Redação SoftChaos Demo', 'Autoria de conteúdo fictício de demonstração.', 'AUTHOR', true, now(), now())
ON CONFLICT(email) DO UPDATE SET name=EXCLUDED.name, bio=EXCLUDED.bio, role='AUTHOR', active=true, updated_at=now();

INSERT INTO categories(name, slug, description)
VALUES ('Tecnologia', 'tecnologia', 'Demonstração'), ('Cultura Digital', 'cultura-digital', 'Demonstração'), ('Tendências', 'tendencias', 'Demonstração'), ('Criatividade', 'criatividade', 'Demonstração')
ON CONFLICT(slug) DO NOTHING;

WITH author AS (
  SELECT id FROM users WHERE email='demo-editor@softchaos.blog'
), seed(slug,title,category,featured,hours_ago,summary,content) AS (VALUES
  ('demo-softchaos-01-biblioteca','[DEMO] Cidade testa biblioteca de objetos','cultura-digital',true,3,'Notícia fictícia: uma cidade imaginária testa o empréstimo comunitário de ferramentas.','<p>Conteúdo fictício para demonstração. Aurora é uma cidade inventada e esta biblioteca comunitária não existe.</p>'),
  ('demo-softchaos-02-mapa','[DEMO] Aplicativo cria mapa de lugares tranquilos','tecnologia',true,7,'Notícia fictícia: um aplicativo imaginário destaca espaços silenciosos.','<p>Conteúdo fictício para demonstração. O aplicativo e a metrópole desta pauta são inventados.</p>'),
  ('demo-softchaos-03-festival','[DEMO] Festival transforma praça em laboratório criativo','cultura-digital',false,15,'Notícia fictícia: um evento imaginário reúne música e oficinas.','<p>Conteúdo fictício para demonstração. Nenhuma data ou atração real está sendo anunciada.</p>'),
  ('demo-softchaos-04-caderno','[DEMO] Estúdio troca telas por caderno de criação','criatividade',false,27,'Notícia fictícia: um estúdio inventado alterna pesquisa digital e papel.','<p>Conteúdo fictício para demonstração. O estúdio e a rotina descritos são inventados.</p>'),
  ('demo-softchaos-05-clube','[DEMO] Clube incentiva trocas entre pequenos criadores','tendencias',false,40,'Notícia fictícia: profissionais imaginários compartilham habilidades.','<p>Conteúdo fictício para demonstração. O clube e seus participantes não existem.</p>'),
  ('demo-softchaos-06-pausa','[DEMO] Uma pausa criativa também faz parte do processo','criatividade',false,60,'Opinião fictícia sobre descanso e ritmo criativo.','<p>Conteúdo fictício para demonstração, escrito para apresentar o formato de opinião.</p>')
)
INSERT INTO articles(title,slug,summary,content,cover_image_url,author_id,category_id,status,featured,pinned,view_count,published_at,created_at,updated_at)
SELECT s.title,s.slug,s.summary,s.content,'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200',a.id,c.id,'PUBLISHED',s.featured,false,30,now()-make_interval(hours=>s.hours_ago),now(),now()
FROM seed s CROSS JOIN author a JOIN categories c ON c.slug=s.category
ON CONFLICT(slug) DO UPDATE SET title=EXCLUDED.title,summary=EXCLUDED.summary,content=EXCLUDED.content,cover_image_url=EXCLUDED.cover_image_url,author_id=EXCLUDED.author_id,category_id=EXCLUDED.category_id,status=EXCLUDED.status,featured=EXCLUDED.featured,published_at=EXCLUDED.published_at,updated_at=now();

COMMIT;
