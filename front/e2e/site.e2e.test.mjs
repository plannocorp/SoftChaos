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
    server = spawn(process.execPath, ['node_modules/@angular/cli/bin/ng.js', 'serve', '--host', '127.0.0.1', '--port', '4200'], {
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

async function openSite(page) {
  await page.route('**/api/articles/latest**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [article, { ...article, id: 9002, title: 'Criatividade e cultura digital', slug: 'criatividade-cultura-digital' }, { ...article, id: 9003, title: 'Como encontrar boas referências', slug: 'boas-referencias' }] }) })
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
