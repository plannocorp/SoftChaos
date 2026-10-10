import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { test } from 'node:test';
const require = createRequire(import.meta.url);
const { PGlite } = require('@electric-sql/pglite');
const sql = async name => readFile(new URL(`../src/main/resources/db/migration/${name}`, import.meta.url), 'utf8');
const seed = await readFile(new URL('./seed_supabase.sql', import.meta.url), 'utf8');
const reconcile = await sql('V4__Reconcile_Current_Model.sql');
const categoriesFix = await readFile(new URL('./reconcile_public_categories.sql', import.meta.url), 'utf8');
async function baseline(db) {
  for (const file of ['V1__Initial_Schema.sql', 'V2__Create_Banners.sql', 'V3__Make_Banner_Title_Optional.sql']) await db.exec(await sql(file));
}

test('migrations and seed supply all five public categories and preserve IDs on repeated seed', async () => {
  const db = new PGlite();
  try {
    await baseline(db);
    await db.exec(reconcile);
    await db.exec(seed);
    const before = (await db.query('SELECT id, slug FROM articles ORDER BY id')).rows;
    await db.exec(seed);
    assert.deepEqual((await db.query('SELECT id, slug FROM articles ORDER BY id')).rows, before);
    const categories = (await db.query("SELECT c.slug, count(a.id)::int AS count FROM categories c LEFT JOIN articles a ON a.category_id=c.id AND a.status='PUBLISHED' GROUP BY c.slug ORDER BY c.slug")).rows;
    assert.deepEqual(categories.map(c => c.slug), ['bastidores', 'dicas', 'novidades', 'opiniao', 'tendencias']);
    assert.ok(categories.every(c => c.count > 0));
    assert.equal(before.length, 6);
    await db.exec(reconcile);
    await db.query('SELECT author_name, author_email, status_updated_at FROM comments');
    await db.query('SELECT confirmation_token, subscribed_at FROM newsletter_subscribers');
    await db.query('SELECT article_id, link_order, url FROM article_external_video_links');
  } finally { await db.close(); }
});

test('reconciliation preserves legacy newsletter tokens and comment authors', async () => {
  const db = new PGlite();
  try {
    await baseline(db);
    await db.exec("INSERT INTO users(email,password,name,role) VALUES ('author@example.com','disabled','Author','AUTHOR'); INSERT INTO categories(name,slug) VALUES ('Editorial','editorial'); INSERT INTO articles(title,slug,content,author_id,category_id,status) VALUES ('Legacy','legacy','Content',1,1,'PUBLISHED'); INSERT INTO comments(name,email,content,article_id) VALUES ('Reader','reader@example.com','Comment',1); INSERT INTO newsletter(email,token) VALUES ('reader@example.com','legacy-token');");
    await db.exec(reconcile);
    assert.deepEqual((await db.query('SELECT id, author_name, author_email FROM comments')).rows, [{ id: 1, author_name: 'Reader', author_email: 'reader@example.com' }]);
    assert.deepEqual((await db.query('SELECT id, confirmation_token FROM newsletter_subscribers')).rows, [{ id: 1, confirmation_token: 'legacy-token' }]);
  } finally { await db.close(); }
});

test('conflicting legacy/current tables fail without discarding data', async () => {
  const db = new PGlite();
  try {
    await baseline(db);
    await db.exec('CREATE TABLE newsletter_subscribers (id BIGINT PRIMARY KEY);');
    await assert.rejects(db.transaction(tx => tx.exec(reconcile)), /Both newsletter and newsletter_subscribers exist/);
    assert.ok((await db.query("SELECT to_regclass('newsletter') AS name")).rows[0].name);
  } finally { await db.close(); }
});

test('unclassified legacy articles stop the migration and roll back renames', async () => {
  const db = new PGlite();
  try {
    await baseline(db);
    await db.exec("INSERT INTO users(email,password,name,role) VALUES ('author@example.com','disabled','Author','AUTHOR'); INSERT INTO articles(title,slug,content,author_id,status) VALUES ('Legacy','legacy','Content',1,'PUBLISHED');");
    await assert.rejects(db.transaction(tx => tx.exec(reconcile)), /Articles without category exist/);
    assert.ok((await db.query("SELECT to_regclass('newsletter') AS name")).rows[0].name);
    assert.equal((await db.query('SELECT count(*)::int AS count FROM articles')).rows[0].count, 1);
  } finally { await db.close(); }
});

test('public category repair changes only the six marked demos and preserves other data', async () => {
  const db = new PGlite();
  try {
    await baseline(db);
    await db.exec(reconcile);
    await db.exec(seed);
    await db.exec("INSERT INTO categories(name,slug) VALUES ('Legacy','legacy'); UPDATE articles SET category_id=(SELECT id FROM categories WHERE slug='legacy'); UPDATE articles SET title='Editorial revisada' WHERE slug='demo-softchaos-06-pausa'; INSERT INTO articles(title,slug,content,author_id,category_id,status) VALUES ('Real','real','Keep',1,(SELECT id FROM categories WHERE slug='legacy'),'PUBLISHED');");
    const before = (await db.query('SELECT id, slug, title, content, published_at, view_count FROM articles ORDER BY id')).rows;
    await db.exec(categoriesFix);
    await db.exec(categoriesFix);
    assert.deepEqual((await db.query('SELECT id, slug, title, content, published_at, view_count FROM articles ORDER BY id')).rows, before);
    const after = (await db.query('SELECT a.slug, c.slug AS category FROM articles a JOIN categories c ON c.id=a.category_id ORDER BY a.slug')).rows;
    assert.deepEqual(after.map(a => a.category), ['novidades', 'dicas', 'novidades', 'bastidores', 'tendencias', 'legacy', 'legacy']);
  } finally { await db.close(); }
});
