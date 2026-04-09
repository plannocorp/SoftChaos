# SoftChaos
Repositorio do Blog Soft Chaos

## Deploy do backend no Render

Configure o servico como `Web Service` com `Root Directory` apontando para `backend`.

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

Comandos:

- `Build Command`: `chmod +x ./mvnw && ./mvnw -DskipTests package`
- `Start Command`: `java -Dserver.port=$PORT -jar target/backend-0.0.1-SNAPSHOT.jar`

## Deploy do frontend na Vercel

Configure o projeto com `Root Directory` apontando para `soft-chaos-blog`.

Variaveis recomendadas:

- `VITE_API_BASE_URL=https://seu-backend.onrender.com`
