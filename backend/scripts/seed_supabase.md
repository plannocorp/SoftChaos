# Conteudo inicial para Supabase

O arquivo `seed_supabase.sql` adiciona seis posts ficticios publicados para a apresentacao do site e quatro categorias. Os posts sao identificados com `[DEMO]` no titulo e usam slugs `demo-softchaos-*` para permitir localizar e remover somente esse conteudo depois.

## Como usar

1. Configure o backend para conectar ao projeto Supabase correto e inicie-o uma vez para que o Hibernate crie/atualize as tabelas. Em producao, isso depende de `spring.jpa.hibernate.ddl-auto=update`.
2. Execute `seed_supabase.sql` no SQL Editor do projeto ou com `psql` usando a mesma base PostgreSQL.
3. Abra a pagina inicial do site e confirme que os seis posts aparecem.

O seed e idempotente e so insere ou atualiza o autor tecnico de demonstracao, as quatro categorias e os seis artigos com prefixo reservado. Nao cria contas administrativas ou senhas conhecidas. O autor tecnico fica inativo e tem uma senha que nao pode ser usada para login.

Antes de apagar uma base existente, exporte um backup e confirme o identificador do projeto Supabase; este script nao apaga tabelas nem dados anteriores.
