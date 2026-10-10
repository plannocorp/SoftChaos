import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { setTimeout as delay } from 'node:timers/promises';
import { test, before, after } from 'node:test';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const origin = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:4200';
const article = {
  id: 9001,
  title: 'Tecnologia independente ganha espaço em 2026',
  slug: 'tecnologia-independente-2026',
  summary: 'Conteúdo demonstrativo: uma pauta fictícia para apresentar o layout editorial.',
  coverImageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200',
  author: { id: 1, name: 'Redação SoftChaos' },
  category: { id: 1, name: 'Tecnologia', slug: 'tecnologia' },
  status: 'PUBLISHED',
  featured: true,
  pinned: true,
  viewCount: 0,
  commentsCount: 0,
  publishedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
};
const apiArticle = {
  ...article,
  content: '<p>Conteúdo demonstrativo e fictício para validar a leitura da matéria.</p>',
  externalVideoLinks: [],
  mediaFiles: [],
};
let server;
let browser;

before(async () => {
  if (!process.env.E2E_BASE_URL) {
    const args = process.env.E2E_SERVE_BUILD
      ? ['e2e/serve-build.mjs']
      : ['node_modules/@angular/cli/bin/ng.js', 'serve', '--host', '127.0.0.1', '--port', '4200'];
    server = spawn(process.execPath, args, {
      stdio: 'ignore',
      env: process.env,
    });
    let ready = false;
    for (let attempt = 0; attempt < 90; attempt += 1) {
      if (server.exitCode !== null) throw new Error('O servidor local do front encerrou antes de iniciar.');
      try {
        const response = await fetch(origin);
        ready = response.ok;
      } catch {
        await delay(1000);
      }
      if (ready) break;
    }
    if (!ready) throw new Error('O front local não ficou disponível em 90 segundos.');
  }
  browser = await chromium.launch({ headless: true });
});

after(async () => {
  await browser?.close();
  if (server && server.exitCode === null) server.kill('SIGTERM');
});

async function openSite(page, { apiAvailable = true, onLatestRequest } = {}) {
  await page.route('**/api/articles/latest**', (route) =>
    {
      onLatestRequest?.(route.request());
      return apiAvailable
        ? route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [article, { ...article, id: 9002, title: 'Criatividade e cultura digital', slug: 'criatividade-cultura-digital' }, { ...article, id: 9003, title: 'Como encontrar boas referências', slug: 'boas-referencias' }] }) })
        : route.abort();
    }
  );
  await page.route('**/api/banners/active', (route) =>
    apiAvailable
      ? route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) })
      : route.abort()
  );
  await page.route('**/api/articles/slug/tecnologia-independente-2026', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: apiArticle }) })
  );
  await page.goto(origin, { waitUntil: 'domcontentloaded' });
}

test('homepage mostra a identidade e notícias em destaque', async () => {
  const page = await browser.newPage();
  await openSite(page);
  await page.getByRole('link', { name: /HeaderLogo SOFT CHAOS/i }).waitFor();
  await page.getByRole('heading', { name: article.title }).first().waitFor();
  await page.getByRole('link', { name: /NOVIDADES/i }).first().waitFor();
  await page.close();
});

test('leitor abre a matéria ao selecionar o destaque', async () => {
  const page = await browser.newPage();
  await openSite(page);
  await page.getByRole('link', { name: /LER MATERIA/i }).click();
  await page.getByText('Conteúdo demonstrativo e fictício para validar a leitura da matéria.').waitFor();
  assert.match(page.url(), /\/noticia\/tecnologia-independente-2026$/);
  await page.close();
});

test('home mantém espaço lateral para as notícias em desktop e mobile', async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await openSite(page);
  const desktopBounds = await page.locator('app-featured-news').boundingBox();
  assert.ok(desktopBounds);
  assert.ok(desktopBounds.x >= 80, 'as notícias devem ter margem lateral em desktop');
  assert.ok(desktopBounds.width <= 1280, 'as notícias devem respeitar a largura máxima');

  await page.setViewportSize({ width: 390, height: 844 });
  const mobileBounds = await page.locator('app-featured-news').boundingBox();
  assert.ok(mobileBounds);
  assert.ok(mobileBounds.x >= 28, 'as notícias devem ter margem lateral em mobile');
  assert.ok(mobileBounds.x + mobileBounds.width <= 362, 'as notícias devem caber dentro da tela em mobile');
  await page.close();
});

test('falha da API sai do estado de carregamento e mostra uma mensagem', async () => {
  const page = await browser.newPage();
  await openSite(page, { apiAvailable: false });
  await page.getByText('Nao foi possivel carregar as noticias em destaque agora.').waitFor();
  await page.getByText('Nao foi possivel carregar os banners da home.').waitFor();
  assert.equal(await page.getByText('Carregando noticias em destaque...').count(), 0);
  await page.close();
});

test('não envia token salvo do admin para endpoints públicos', async () => {
  const page = await browser.newPage();
  await page.addInitScript(() => localStorage.setItem('token', 'token-de-teste'));
  let authorizationHeader;
  await openSite(page, {
    onLatestRequest: (request) => {
      authorizationHeader = request.headers().authorization;
    },
  });
  await page.getByRole('heading', { name: article.title }).first().waitFor();
  assert.equal(authorizationHeader, undefined);
  await page.close();
});

for (const slug of ['novidades', 'tendencias', 'dicas', 'bastidores', 'opiniao']) {
  test(`${slug}: mostra lista vazia sem spinner`, async () => {
    const page = await browser.newPage();
    await page.route('**/api/categories/slug/*', route => route.fulfill({ json: { success: true, data: { id: 1, name: slug, slug } } }));
    await page.route('**/api/articles/category/1?*', route => route.fulfill({ json: { success: true, data: { content: [], pageNumber: 0, pageSize: 30, totalElements: 0, totalPages: 0, last: true } } }));
    await page.goto(`${origin}/${slug}`);
    await page.locator('.no-news').waitFor();
    assert.equal(await page.locator('.spinner').count(), 0);
    await page.close();
  });
}

test('erro da categoria encerra o spinner', async () => {
  const page = await browser.newPage();
  await page.route('**/api/categories/slug/*', route => route.fulfill({ status: 502, body: '' }));
  await page.goto(`${origin}/novidades`);
  await page.getByText('Nao foi possivel carregar as noticias de novidades agora.').waitFor();
  assert.equal(await page.locator('.spinner').count(), 0);
  await page.close();
});

for (const path of ['/explorar', '/novidades', '/busca?q=criadores']) {
  test(`${path}: permite abrir a segunda página de artigos`, async () => {
    const page = await browser.newPage();
    await page.route('**/api/categories/slug/*', route => route.fulfill({ json: { success: true, data: { id: 1 } } }));
    await page.route('**/api/articles**', route => {
      const next = new URL(route.request().url()).searchParams.get('page') === '1';
      return route.fulfill({ json: { success: true, data: { content: next ? [{ ...article, id: 9031, title: 'Artigo da segunda página' }] : [article], pageNumber: next ? 1 : 0, pageSize: 30, totalElements: 31, totalPages: 2, last: next } } });
    });
    await page.goto(`${origin}${path}`);
    await page.getByRole('heading', { name: article.title }).waitFor();
    await page.getByRole('button', { name: 'Próxima', exact: true }).click();
    await page.getByRole('heading', { name: 'Artigo da segunda página' }).waitFor();
    assert.equal(await page.getByRole('button', { name: 'Próxima', exact: true }).isDisabled(), true);
    await page.getByRole('button', { name: 'Anterior', exact: true }).click();
    await page.getByRole('heading', { name: article.title }).waitFor();
    await page.close();
  });
}

test('confirma newsletter pela rota pública', async () => {
  const page = await browser.newPage();
  await page.route('**/api/newsletter/confirm?token=*', route => route.fulfill({ json: { success: true, message: 'Inscrição confirmada com sucesso!', data: {} } }));
  await page.goto(`${origin}/newsletter/confirm?token=token-ficticio`);
  await page.getByText('Inscrição confirmada com sucesso!', { exact: true }).waitFor();
  await page.close();
});
