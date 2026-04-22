-- Seed rapido para testar 5 banners na home.
-- Uso recomendado apenas em ambiente de teste / homologacao.

BEGIN;

DELETE FROM banners;

INSERT INTO banners (
  title,
  subtitle,
  button_label,
  target_url,
  image_url,
  image_filename,
  image_alt_text,
  display_order,
  active,
  created_at,
  updated_at
)
VALUES
  (
    'Nova edicao especial',
    'Materias, entrevistas e repertorio visual para abrir a semana com mais contexto.',
    'Ver especial',
    '/explorar-chaos',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80',
    'seed/banners/test-banner-1.jpg',
    'Mesa com notebook, caderno e elementos visuais editoriais.',
    1,
    true,
    NOW(),
    NOW()
  ),
  (
    'Curadoria da semana',
    'Uma selecao das leituras e referencias que mais combinaram com a linha editorial da Soft Chaos.',
    'Ler agora',
    '/novidades',
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80',
    'seed/banners/test-banner-2.jpg',
    'Ambiente de trabalho criativo com monitor e objetos de escritorio.',
    2,
    true,
    NOW(),
    NOW()
  ),
  (
    NULL,
    NULL,
    NULL,
    NULL,
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1600&q=80',
    'seed/banners/test-banner-3.jpg',
    'Mesa de redacao com revista, notebook e cafe.',
    3,
    true,
    NOW(),
    NOW()
  ),
  (
    'Newsletter Soft Chaos',
    'Receba os destaques mais recentes direto na sua caixa de entrada.',
    'Assinar',
    '/newsletter',
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1600&q=80',
    'seed/banners/test-banner-4.jpg',
    'Pagina aberta com tipografia editorial e fundo claro.',
    4,
    true,
    NOW(),
    NOW()
  ),
  (
    'Tendencias para acompanhar',
    'Tecnologia, design e cultura digital em uma grade editorial mais marcada.',
    'Explorar',
    '/tendencias',
    'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1600&q=80',
    'seed/banners/test-banner-5.jpg',
    'Equipe reunida discutindo pautas em uma sala de reuniao.',
    5,
    true,
    NOW(),
    NOW()
  );

COMMIT;
