# SoftChaos
Repositorio do Blog Soft Chaos

## Deploy do backend no Railway

Configure o servico com `Root Directory` apontando para `backend`.

Variaveis recomendadas:

- `SPRING_PROFILES_ACTIVE=prod`
- `PORT=${{ PORT }}`
- `DB_URL=jdbc:postgresql://...`
- `DB_USERNAME=postgres`
- `DB_PASSWORD=...`
- `JWT_SECRET=...`
- `FRONTEND_URL=https://seu-front.com`
- `MEDIA_STORAGE_PROVIDER=supabase`
- `SUPABASE_URL=https://rgqsxoykuatzqjjurqeo.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY=...`
- `SUPABASE_STORAGE_BUCKET=softchaos-media`
- `DB_KEEPALIVE_ENABLED=true`
- `DB_KEEPALIVE_FIXED_DELAY_MS=43200000`

O backend agora executa um keepalive simples com `SELECT 1` em intervalo configuravel para evitar longos periodos sem atividade no banco.
