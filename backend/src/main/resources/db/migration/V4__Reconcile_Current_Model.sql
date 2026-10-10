-- V1-V3 remain immutable. Apply only after a backup and validation on a copy.
-- Conflicting legacy/current newsletter tables require an explicit data mapping.
DO $$
BEGIN
    IF to_regclass('newsletter') IS NOT NULL AND to_regclass('newsletter_subscribers') IS NOT NULL THEN
        RAISE EXCEPTION 'Both newsletter and newsletter_subscribers exist; reconcile their data before applying V4';
    END IF;
    IF to_regclass('newsletter') IS NOT NULL THEN
        ALTER TABLE newsletter RENAME TO newsletter_subscribers;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'newsletter_subscribers' AND column_name = 'token') THEN
        ALTER TABLE newsletter_subscribers RENAME COLUMN token TO confirmation_token;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'newsletter_subscribers' AND column_name = 'created_at') THEN
        ALTER TABLE newsletter_subscribers RENAME COLUMN created_at TO subscribed_at;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'comments' AND column_name = 'name') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'comments' AND column_name = 'author_name') THEN
            UPDATE comments SET author_name = COALESCE(author_name, name);
            ALTER TABLE comments ALTER COLUMN name DROP NOT NULL;
        ELSE
            ALTER TABLE comments RENAME COLUMN name TO author_name;
        END IF;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'comments' AND column_name = 'email') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'comments' AND column_name = 'author_email') THEN
            UPDATE comments SET author_email = COALESCE(author_email, email);
            ALTER TABLE comments ALTER COLUMN email DROP NOT NULL;
        ELSE
            ALTER TABLE comments RENAME COLUMN email TO author_email;
        END IF;
    END IF;
END $$;

ALTER TABLE comments ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMP;
ALTER TABLE comments ALTER COLUMN author_name SET NOT NULL;
ALTER TABLE comments ALTER COLUMN author_email SET NOT NULL;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon_url VARCHAR(255);

CREATE TABLE IF NOT EXISTS article_external_video_links (
    article_id BIGINT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    link_order INTEGER NOT NULL,
    url VARCHAR(1000),
    PRIMARY KEY (article_id, link_order)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_newsletter_confirmation_token
    ON newsletter_subscribers(confirmation_token);

-- Do not silently truncate legacy titles, slugs, summaries or names.
-- Unclassified articles must be mapped by the operator before enforcing the model.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM articles WHERE category_id IS NULL) THEN
        RAISE EXCEPTION 'Articles without category exist; assign their editorial categories before applying V4';
    END IF;
END $$;

UPDATE articles SET featured = false WHERE featured IS NULL;
UPDATE articles SET pinned = false WHERE pinned IS NULL;
UPDATE articles SET view_count = 0 WHERE view_count IS NULL;
ALTER TABLE articles ALTER COLUMN category_id SET NOT NULL;
ALTER TABLE articles ALTER COLUMN featured SET NOT NULL;
ALTER TABLE articles ALTER COLUMN pinned SET NOT NULL;
ALTER TABLE articles ALTER COLUMN view_count SET NOT NULL;

UPDATE newsletter_subscribers SET active = true WHERE active IS NULL;
ALTER TABLE newsletter_subscribers ALTER COLUMN active SET NOT NULL;
UPDATE users SET active = true WHERE active IS NULL;
ALTER TABLE users ALTER COLUMN active SET NOT NULL;
UPDATE pages SET published = false WHERE published IS NULL;
ALTER TABLE pages ALTER COLUMN published SET NOT NULL;
