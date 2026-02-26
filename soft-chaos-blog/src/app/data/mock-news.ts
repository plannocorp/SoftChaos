import { News } from "../models/news";

export const MOCK_NEWS: News[] = [
    // Notícia em Destaque (Featured-News)
    {
        id: 1,
        title: "Título da Notícia",
        slug: "titulo-da-noticia",
        type: 'NOVIDADES',
        description: 'Descrição da noticia, Lorem ipsum dolor sit amet, consectetur adipisicing elit. Velit similique iste quisquam esse illum incidunt ipsa minima nulla sint distinctio cupiditate beatae debitis illo maiores modi, vel hic omnis aperiam.',
        content: `
            Descrição da noticia, Lorem ipsum dolor sit amet, consectetur adipisicing elit. Velit similique iste quisquam esse illum incidunt ipsa minima nulla sint distinctio cupiditate beatae debitis illo maiores modi, vel hic omnis aperiam. Descrição da noticia, Lorem ipsum dolor sit amet, consectetur adipisicing elit. Velit similique iste quisquam esse illum incidunt ipsa minima nulla sint distinctio cupiditate beatae debitis illo maiores modi, vel hic omnis aperiam. Descrição da noticia, Lorem ipsum dolor sit amet, consectetur adipisicing elit.
            Velit similique iste quisquam esse illum incidunt ipsa minima nulla sint distinctio cupiditate beatae debitis illo maiores modi, vel hic omnis aperiam. Descrição da noticia, Lorem ipsum dolor sit amet, consectetur adipisicing elit. Velit similique iste quisquam esse illum incidunt ipsa minima nulla sint distinctio cupiditate beatae debitis illo maiores modi, vel hic omnis aperiam. Descrição da noticia, Lorem ipsum dolor sit amet, consectetur adipisicing elit. Velit similique iste quisquam esse illum incidunt ipsa minima nulla sint distinctio cupiditate beatae debitis illo maiores modi, vel hic omnis aperiam.`,
        author: 'Vitor Teixeira Martins',
        publishAt: new Date('2026-02-15T10:00:00'),
        imageURL: 'https://images3.alphacoders.com/115/1155716.png',
        readTime: 5,
        link: `noticias/titulo-da-noticia`,
        firstImageUrl: 'https://cdn.wallpapersafari.com/10/59/SP241Z.jpg',
        secondImageUrl: 'https://cdn.wallpapersafari.com/10/59/SP241Z.jpg',
        thirdImageUrl: 'https://i.pinimg.com/736x/04/e4/f4/04e4f4c9130b0ecacb88c213dd79a21b.jpg'
    },

    // Notícias Secundárias (Featured)

    {
        id: 2,
        title: 'Título da Primeira Notícia Secundária',
        slug: 'titulo-da-primeira-noticia-secundaria',
        type: 'TENDÊNCIAS',
        description: 'Descrição da primeira notícia secundária deve ser mais breve que a descrição da notícia principal.',
        content: 'Descrição da primeira notícia secundária deve ser mais breve que a descrição da notícia principal. Descrição da primeira notícia secundária deve ser mais breve que a descrição da notícia principal.',
        author: 'Vitor',
        publishAt: new Date('2026-02-14T14:30:00'),
        imageURL: 'https://images3.alphacoders.com/115/1155716.png',
        readTime: 3,
        link: 'http://localhost:4200/noticias/titulo-da-primeira-noticia-secundaria'
    },

    {
        id: 3,
        title: 'Título da Segunda Notícia Secundária',
        slug: 'titulo-da-segunda-noticia-secundaria',
        type: 'DICAS',
        description: 'Descrição da segunda notícia secundária deve ser mais breve que a descrição da notícia principal.',
        content: 'Descrição da segunda notícia secundária deve ser mais breve que a descrição da notícia principal. Descrição da segunda notícia secundária deve ser mais breve que a descrição da notícia principal.',
        author: 'Vitor',
        publishAt: new Date('2026-02-13T09:15:00'),
        imageURL: 'https://images3.alphacoders.com/115/1155716.png',
        readTime: 4,
        link: 'noticias/titulo-da-segunda-noticia-secundaria'
    },

    // Cards (Explorer)

    {
        id: 4,
        title: 'Título da notícia do card do Explorer 1',
        slug: 'titulo-da-noticia-do-explorer-1',
        type: 'BASTIDORES',
        description: 'Descrição da notícia do card em questão, então tem que vir um monte de texto aqui apesar de ser preeliminar, coisa e tal, varias parada top, muito da hora mesmo',
        content: '<p>Conteúdo completo...</p>',
        author: 'Vitor',
        publishAt: new Date('2026-02-12T11:00:00'),
        imageURL: 'https://cdn.wallpapersafari.com/10/59/SP241Z.jpg',
        readTime: 6,
        link: 'noticias/'
    },

    {
        id: 5,
        title: 'Título da notícia do card do Explorer 2',
        slug: 'titulo-da-noticia-do-explorer-2',
        type: 'OPINIÃO',
        description: 'Descrição da notícia do card em questão, então tem que vir um monte de texto aqui apesar de ser preeliminar, coisa e tal, varias parada top, muito da hora mesmo',
        content: '<p>Conteúdo completo...</p>',
        author: 'Vitor',
        publishAt: new Date('2026-02-11T15:30:00'),
        imageURL: 'https://cdn.wallpapersafari.com/10/59/SP241Z.jpg',
        readTime: 7,
        link: 'noticias/'
    },

    {
        id: 6,
        title: 'Título da notícia do card do Explorer 3',
        slug: 'titulo-da-noticia-do-explorer-3',
        type: 'NOVIDADES',
        description: 'Descrição da notícia do card em questão, então tem que vir um monte de texto aqui apesar de ser preeliminar, coisa e tal, varias parada top, muito da hora mesmo',
        content: '<p>Conteúdo completo...</p>',
        author: 'Vitor',
        publishAt: new Date('2026-02-10T08:45:00'),
        imageURL: 'https://cdn.wallpapersafari.com/10/59/SP241Z.jpg',
        readTime: 5,
        link: 'noticias/'
    }
];