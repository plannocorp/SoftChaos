export interface News {
    id?: number; // Id da notícia
    title: string; // Título da Notícia
    content: string; // Conteúdo da notícia
    publishAt: Date; // Data e hora de publicação da notícia
    updatedAt?: Date; // Data e hora de possível atualização da notícia
    author: string; // Autor da notícia
    imageURL?: string; // URL da imagem da notícia
    slug: string; // O slug serve para que a URL condiza com o título da notícia. Se o título da notícia é "Novas mudanças no modo de vida" a url com o slug será: "noticias/novas-mudancas-no-modo-de-vida". Quem cria o slug a partir do título não é o front-end, mas o back-end.
    type: string; // Tipo da notícia
    description: string; // Descrição resumida da notícia
    readTime: number; // Tempo médio de leitura da notícia
    link?: string;
    firstImageUrl?: string;
    secondImageUrl?: string;
    thirdImageUrl?: string;
    tag?: string;
}

export interface CreateArticleRequest {
  title: string;
  summary: string;
  content: string;
  categoryId: number | null;
  tagIds?: number[];
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED';
  featured?: boolean;
  pinned?: boolean;
}
