# Soft Chaos

Soft Chaos e um portal editorial full stack para publicacao de noticias, artigos e conteudos multimidia. O projeto combina uma experiencia publica de leitura com um painel administrativo para gestao de publicacoes, moderacao de comentarios, agendamento de materias e acompanhamento de indicadores editoriais.

## Principais Recursos

- Portal publico com home editorial, categorias, busca, newsletter e pagina individual de noticia.
- Admin dashboard protegido por autenticacao JWT.
- Editor de artigos com suporte a rascunho, publicacao imediata e agendamento.
- Upload e exibicao de midias, incluindo galeria de imagens, videos e links externos.
- Moderacao de comentarios com fluxo de aprovacao.
- Painel de indicadores com totais de artigos, status de publicacao, comentarios, usuarios e top artigos.
- API documentada com OpenAPI/Swagger.
- Deploy separado para frontend e backend, com suporte a Render, Vercel e armazenamento via Supabase.

## Stack

| Camada | Tecnologias |
| --- | --- |
| Frontend | Angular 21, TypeScript, Angular Router, RxJS |
| Backend | Java 17, Spring Boot 3.5, Spring Security, Spring Data JPA |
| Banco | PostgreSQL em producao, H2 para desenvolvimento/testes |
| Autenticacao | JWT |
| Midia | Upload local ou Supabase Storage |
| Email | Spring Mail |
| Observabilidade | Spring Actuator |
| Deploy | Cloudflare Pages para frontend, Hostinger VPS para backend |

## Estrutura

```text
SoftChaos/
├── backend/              # API Spring Boot
├── front/                # Aplicacao Angular
├── .github/workflows/    # Automacoes do GitHub Actions
├── render.yaml           # Blueprint do backend no Render
└── README.md
```

## Frontend

O frontend fica em `front` e contem as telas publicas, paginas de categoria, busca, newsletter, pagina de noticia e dashboard administrativo.

Comandos principais:

```bash
cd front
npm install
npm run start
npm run build
```

Ambiente local:

```bash
cp front/.env.example front/.env
```

Configure `VITE_API_BASE_URL` conforme o ambiente em uso.

## Backend

O backend fica em `backend` e expõe os recursos de autenticacao, artigos, categorias, midias, comentarios, newsletter, dashboard e usuarios.

Comandos principais:

```bash
cd backend
./mvnw spring-boot:run
./mvnw test
./mvnw clean package
```

No Windows, use:

```powershell
.\mvnw.cmd spring-boot:run
```

Ambiente local:

```bash
cp .env.example .env
```

Variaveis usadas pelo backend:

```text
SPRING_PROFILES_ACTIVE
PORT
DB_URL
DB_USERNAME
DB_PASSWORD
JWT_SECRET
JWT_EXPIRATION
FRONTEND_URL
MEDIA_STORAGE_PROVIDER
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_STORAGE_BUCKET
EMAIL_USERNAME
EMAIL_PASSWORD
EMAIL_FROM
```

Nunca versionar arquivos `.env` com valores reais.

Exemplo com Supabase Shared Pooler:

```text
DB_URL=jdbc:postgresql://aws-1-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require
DB_USERNAME=postgres.twfkkfwajotkiupdpyym
DB_PASSWORD=seu-password-do-banco
```

## Rotas Principais

### Publicas

- `/` home
- `/noticia/:slug` pagina de noticia
- `/explorar` listagem geral
- `/novidades`, `/tendencias`, `/dicas`, `/bastidores`, `/opiniao` categorias editoriais
- `/busca` busca
- `/newsletter` inscricao na newsletter

### Admin

- `/security/adimin-auth` login administrativo
- `/security/adimin-dashboard/overview` painel geral
- `/security/adimin-dashboard/create-article` criacao de artigo
- `/security/adimin-dashboard/drafts` rascunhos
- `/security/adimin-dashboard/scheduled` agendados
- `/security/adimin-dashboard/published` publicados
- `/security/adimin-dashboard/comments` comentarios

## API

Com o backend rodando, a documentacao OpenAPI fica disponivel em:

```text
/swagger-ui.html
/api-docs
```

O health check fica em:

```text
/actuator/health
```

## Deploy

### Frontend no Cloudflare Pages

Configure o projeto com `front` como diretório raiz, `npm run build` como comando e `dist/soft-chaos-blog/browser` como diretório de saída. O arquivo `front/public/_redirects` mantém as rotas do Angular funcionando no Pages.

Use `VITE_API_BASE_URL=https://api.softchaos.blog` no ambiente de produção. Para um domínio personalizado, associe `www.softchaos.blog` ao Pages e crie no DNS um CNAME para o subdomínio `*.pages.dev` informado pelo Cloudflare.

### Backend na VPS Hostinger

O backend usa Docker Compose e compartilha a rede Docker do projeto existente na VPS. A configuração Caddy em `Caddyfile.hostinger` encaminha `api.softchaos.blog` para o container `softchaos-backend`; aplique essa rota ao Caddy que já atende a VPS. Não inicie um segundo proxy nas portas 80 e 443.

Aponte o registro A `api.softchaos.blog` para o IP da VPS. O Caddy existente deve emitir e manter o certificado TLS do subdomínio.

Na VPS, clone o repositório, copie `.env.hostinger.example` para `.env.hostinger`, preencha as credenciais do projeto Supabase destinado ao SoftChaos e inicie o serviço:

```bash
docker compose -f compose.hostinger.yaml up -d --build
```

O arquivo `.env.hostinger` não deve ser versionado. O exemplo versionado contém apenas valores fictícios.

### Banco de dados Supabase

Use um projeto PostgreSQL próprio do SoftChaos. Configure `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` no `.env.hostinger` da VPS. O bucket de mídia esperado é `softchaos-media`.

Os arquivos `render.yaml`, `front/vercel.json` e o workflow de keepalive foram mantidos para preservar o deploy anterior; o novo destino está descrito acima.

## Qualidade

Validacoes usadas durante o desenvolvimento:

```bash
cd front
npm run build
```

```bash
cd backend
./mvnw test
```

## Licenca

Este projeto usa a licenca descrita em `LICENSE`.
