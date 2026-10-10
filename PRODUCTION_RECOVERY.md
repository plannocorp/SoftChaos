# Recuperacao e entrega — 10/10/2026

## Estado verificado em producao

A causa do HTTP 502 era a falha de autenticacao PostgreSQL: o container reiniciava sem concluir a inicializacao. A senha do banco foi redefinida pelo usuario e aplicada na VPS em arquivo privado, com copia anterior protegida. O container existente foi recriado sem rebuild; depois do bloqueio temporario do pooler, a API voltou a responder HTTP 200.

Health, noticias, categorias, banners e preflight CORS foram verificados. A pagina inicial voltou a mostrar os seis artigos de demonstracao. Com autorizacao explicita do usuario, `backend/scripts/reconcile_public_categories.sql` adicionou quatro editorias ausentes e remapeou os seis artigos `[DEMO]`. A comparacao antes/depois confirmou que IDs, textos, datas e demais campos foram preservados. O mapeamento anterior foi salvo fora do Git para reversao.

A consulta de banners ativos retornou uma lista vazia, nao erro. Nao foi criado conteudo editorial ou publicitario real.

## Correcoes entregues pelo PR homolog → deploy

- Sintaxe do workflow corrigida; validacao do banco, backend, build e navegacao em desenvolvimento e na versao otimizada.
- Listas publicas com paginacao, ordenacao deterministica, estados vazios corretos e mensagens de erro sem spinner permanente.
- URLs de banners resolvidas contra a API; servico legado reduzido ao consumidor efetivo, sem ocultar falhas como listas vazias.
- Sessoes locais expiradas ou corrompidas descartadas.
- Confirmacao da newsletter enviada pelo servico de email e rota publica de confirmacao adicionada. Falha de envio interrompe a inscricao, sem resposta falsa de sucesso.
- Healthcheck do container, porta interna fixa em 8080 e sincronizacao de sequencias de banners e newsletter_subscribers.
- Seed alinhado ao menu e ajuste pontual separado para bases existentes.
- Migracao V4 preparada para preservar dados legados de comentarios/newsletter e parar diante de tabelas conflitantes ou artigos sem categoria.

## Aplicacao depois do merge pelo usuario

O checkout encontrado na VPS estava em `itdeploy`, commit `03f72c1`, anterior ao codigo em revisao. Recuperar a conexao nao atualizou essa versao. O merge do PR deve acionar o build do frontend em Cloudflare Pages, mas este repositorio nao possui workflow de deploy automatico da VPS.

Para atualizar o backend apos o merge:

1. Confirme que `origin/deploy` contem o merge aprovado e preserve alteracoes locais/arquivos privados da VPS antes de sincronizar o checkout com essa branch. Nao use reset destrutivo.
2. Confira `.env.hostinger` sem imprimir segredos. Newsletter exige SMTP real (`EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USERNAME`, `EMAIL_PASSWORD`, `EMAIL_FROM`) e `FRONTEND_URL=https://www.softchaos.blog`. O servidor SMTP deve aceitar STARTTLS e o remetente autorizado.
3. Valide a configuracao e recrie somente o backend:

   ```bash
   docker compose -f compose.hostinger.yaml config --quiet
   docker compose -f compose.hostinger.yaml up -d --build --wait --wait-timeout 180 backend
   ```

4. Confira health, noticias, cada editoria, busca, imagens, newsletter e logs recentes sem expor credenciais. Guarde a imagem anterior para rollback. O status do build do frontend nao comprova entrega do backend.

## Pontos que exigem validacao adicional

Flyway continua desativado e Hibernate continua em `update`. V4 foi validada com PostgreSQL embarcado em cenarios conhecidos; nao foi executada no Supabase. Antes de habilitar Flyway, exporte um backup, reproduza o schema real numa copia, confira historico/baseline, conflitos, comprimentos e constraints e valide o aplicativo contra esse schema. Nao execute V1 sobre tabelas existentes nem marque versoes como aplicadas sem conferir.

As datas existentes sao `TIMESTAMP`/`LocalDateTime`, sem fuso no contrato. O agendamento ainda precisa de um contrato de fuso e de uma migracao baseada na origem dos dados; este PR nao reinterpreta datas antigas automaticamente.

Nao foi comprovada a existencia de midia antiga em `/uploads`. Se houver URLs legadas, inventarie os arquivos e migre-os para o bucket antes de alterar referencias. Os artigos publicos verificados usam imagens HTTPS externas.

O envio SMTP real e a confirmacao pelo email recebido devem ser verificados apos configurar e atualizar o backend. Os testes cobrem o fluxo com servicos simulados; nenhum email foi enviado a terceiros durante a validacao.

O build Angular conclui com avisos de tamanho do bundle e de quatro folhas de estilo; isso continua sendo um ponto de otimizacao.

## Validacao local

- Backend: 9 testes aprovados.
- Schema, preservacao de dados e seed: 5 testes aprovados.
- Navegacao: 15 testes aprovados em desenvolvimento e 15 na versao otimizada.
- Build Angular concluido e YAML do workflow validado.

A auditoria original foi preservada como recebida; este documento registra o resultado e os limites da recuperacao.
