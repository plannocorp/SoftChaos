# SoftChaos
Repositorio do Blog Soft Chaos

## Deploy do backend no Render

Configure o servico como `Web Service` com `Root Directory` apontando para `backend`.
No Blueprint, o deploy usa Docker para o Spring Boot.

Variaveis recomendadas:

- `SPRING_PROFILES_ACTIVE=prod`
- `PORT=${{ PORT }}`
- `DB_URL=jdbc:postgresql://...`
- `DB_USERNAME=postgres`
- `DB_PASSWORD=...`
- `JWT_SECRET=...`
- `FRONTEND_URL=https://seu-front.vercel.app`
- `MEDIA_STORAGE_PROVIDER=supabase`
- `SUPABASE_URL=https://rgqsxoykuatzqjjurqeo.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY=...`
- `SUPABASE_STORAGE_BUCKET=softchaos-media`

## Deploy do frontend na Vercel

Configure o projeto com `Root Directory` apontando para `soft-chaos-blog`.

Variaveis recomendadas:

- `VITE_API_BASE_URL=https://seu-backend.onrender.com`
