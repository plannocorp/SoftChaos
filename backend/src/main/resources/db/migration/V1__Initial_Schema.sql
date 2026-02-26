-- Tabela de Usuários
CREATE TABLE users (
                       id BIGSERIAL PRIMARY KEY,
                       email VARCHAR(255) UNIQUE NOT NULL,
                       password VARCHAR(255) NOT NULL,
                       name VARCHAR(255) NOT NULL,
                       bio TEXT,
                       avatar_url VARCHAR(500),
                       role VARCHAR(50) NOT NULL,
                       active BOOLEAN DEFAULT true,
                       created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Categorias
CREATE TABLE categories (
                            id BIGSERIAL PRIMARY KEY,
                            name VARCHAR(255) UNIQUE NOT NULL,
                            slug VARCHAR(255) UNIQUE NOT NULL,
                            description TEXT,
                            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Tags
CREATE TABLE tags (
                      id BIGSERIAL PRIMARY KEY,
                      name VARCHAR(255) UNIQUE NOT NULL,
                      slug VARCHAR(255) UNIQUE NOT NULL,
                      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Artigos
CREATE TABLE articles (
                          id BIGSERIAL PRIMARY KEY,
                          title VARCHAR(500) NOT NULL,
                          slug VARCHAR(500) UNIQUE NOT NULL,
                          summary TEXT,
                          content TEXT NOT NULL,
                          cover_image_url VARCHAR(500),
                          author_id BIGINT NOT NULL,
                          category_id BIGINT,
                          status VARCHAR(50) NOT NULL,
                          featured BOOLEAN DEFAULT false,
                          pinned BOOLEAN DEFAULT false,
                          view_count BIGINT DEFAULT 0,
                          published_at TIMESTAMP,
                          scheduled_for TIMESTAMP,
                          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
                          FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Tabela de Relacionamento Artigos-Tags
CREATE TABLE article_tags (
                              article_id BIGINT NOT NULL,
                              tag_id BIGINT NOT NULL,
                              PRIMARY KEY (article_id, tag_id),
                              FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
                              FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Tabela de Comentários
CREATE TABLE comments (
                          id BIGSERIAL PRIMARY KEY,
                          name VARCHAR(255) NOT NULL,
                          email VARCHAR(255) NOT NULL,
                          content TEXT NOT NULL,
                          article_id BIGINT NOT NULL,
                          status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
                          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);

-- Tabela de Mídia
CREATE TABLE media (
                       id BIGSERIAL PRIMARY KEY,
                       url VARCHAR(500) NOT NULL,
                       filename VARCHAR(500) NOT NULL,
                       type VARCHAR(50) NOT NULL,
                       alt_text VARCHAR(500),
                       file_size BIGINT,
                       article_id BIGINT,
                       uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE SET NULL
);

-- Tabela de Newsletter
CREATE TABLE newsletter (
                            id BIGSERIAL PRIMARY KEY,
                            email VARCHAR(255) UNIQUE NOT NULL,
                            name VARCHAR(255),
                            active BOOLEAN DEFAULT true,
                            token VARCHAR(500),
                            confirmed_at TIMESTAMP,
                            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Páginas
CREATE TABLE pages (
                       id BIGSERIAL PRIMARY KEY,
                       title VARCHAR(500) NOT NULL,
                       slug VARCHAR(500) UNIQUE NOT NULL,
                       content TEXT NOT NULL,
                       published BOOLEAN DEFAULT false,
                       created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_author ON articles(author_id);
CREATE INDEX idx_articles_category ON articles(category_id);
CREATE INDEX idx_articles_published_at ON articles(published_at);
CREATE INDEX idx_comments_article ON comments(article_id);
CREATE INDEX idx_comments_status ON comments(status);
CREATE INDEX idx_media_article ON media(article_id);
