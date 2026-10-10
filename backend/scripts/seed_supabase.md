# Conteudo inicial para Supabase

O arquivo `seed_supabase.sql` adiciona seis posts ficticios publicados para a apresentacao do site e cinco editorias do menu (novidades, tendencias, dicas, bastidores e opiniao). Os posts sao identificados com `[DEMO]` no titulo e usam slugs `demo-softchaos-*` para permitir localizar e remover somente esse conteudo depois.

## Como usar

1. Configure o backend para conectar ao projeto Supabase correto e inicie-o uma vez para que o Hibernate crie/atualize as tabelas. Em producao, isso depende de `spring.jpa.hibernate.ddl-auto=update`.
2. Execute `seed_supabase.sql` no SQL Editor do projeto ou com `psql` usando a mesma base PostgreSQL.
3. Abra a pagina inicial do site e confirme que os seis posts aparecem.

O seed e idempotente e so insere ou atualiza o autor tecnico de demonstracao, as cinco editorias do menu (novidades, tendencias, dicas, bastidores e opiniao) e os seis artigos com prefixo reservado. Nao cria contas administrativas ou senhas conhecidas. O autor tecnico fica inativo e tem uma senha que nao pode ser usada para login.

Antes de apagar uma base existente, exporte um backup e confirme o identificador do projeto Supabase; este script nao apaga tabelas nem dados anteriores.

Categorias existentes conservam seus IDs, nomes, descricoes e artigos. Apenas os seis slugs demo-softchaos-* recebem o mapeamento editorial do seed.

## Ajustar uma base que ja possui os artigos de demonstracao

Use `reconcile_public_categories.sql` em vez de repetir o seed completo: ele adiciona as editorias ausentes e altera apenas a categoria dos seis slugs exatos cujo titulo ainda comeca com `[DEMO]`. Nao altera textos, datas, visualizacoes, autoria ou IDs.

Antes, salve o resultado desta consulta em local privado para reverter o mapeamento se necessario:

```sql
SELECT id, slug, category_id FROM articles
WHERE slug IN ('demo-softchaos-01-biblioteca', 'demo-softchaos-02-mapa',
 'demo-softchaos-03-festival', 'demo-softchaos-04-caderno',
 'demo-softchaos-05-clube', 'demo-softchaos-06-pausa');
```

Depois resolva cada slug em `/api/categories/slug/{slug}` e confira `/api/articles/category/{id}` para as cinco editorias. Para reverter, restaure `category_id` pelos IDs salvos; as categorias adicionais podem permanecer sem artigos.
