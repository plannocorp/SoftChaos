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
| Deploy | Render para backend, Vercel para frontend |

## Estrutura

```text
SoftChaos/
├── backend/              # API Spring Boot
├── soft-chaos-blog/      # Aplicacao Angular
├── .github/workflows/    # Automacoes do GitHub Actions
├── render.yaml           # Blueprint do backend no Render
└── README.md
```

## Frontend

O frontend fica em `soft-chaos-blog` e contem as telas publicas, paginas de categoria, busca, newsletter, pagina de noticia e dashboard administrativo.

Comandos principais:

```bash
cd soft-chaos-blog
npm install
npm run start
npm run build
```

Ambiente local:

```bash
cp .env.example .env
```

Configure a URL da API conforme o ambiente em uso.

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

### Backend no Render

Configure o servico como `Web Service` com `Root Directory` apontando para `backend`. O `render.yaml` do repositorio define o servico `softchaos-backend` usando Docker.

Variaveis recomendadas:

```text
SPRING_PROFILES_ACTIVE=prod
PORT=${{ PORT }}
DB_URL=jdbc:postgresql://...
DB_USERNAME=...
DB_PASSWORD=...
JWT_SECRET=...
FRONTEND_URL=https://seu-front.vercel.app
MEDIA_STORAGE_PROVIDER=supabase
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_STORAGE_BUCKET=softchaos-media
EMAIL_USERNAME=...
EMAIL_PASSWORD=...
EMAIL_FROM=noreply@softchaos.com
```

### Frontend na Vercel

Configure o projeto com `Root Directory` apontando para `soft-chaos-blog`.

Variavel recomendada:

```text
VITE_API_BASE_URL=https://seu-backend.onrender.com
```

## Qualidade

Validacoes usadas durante o desenvolvimento:

```bash
cd soft-chaos-blog
npm run build
```

```bash
cd backend
./mvnw test
```

## Licenca

Este projeto usa a licenca descrita em `LICENSE`.
