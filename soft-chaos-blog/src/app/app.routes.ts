import { Routes } from '@angular/router';
import { App } from './app';
import { NewsPage } from './pages/news-page/news-page';
import { Home } from './pages/home/home';
import { ExplorarChaosPage } from './pages/explorar-chaos-page/explorar-chaos-page';
import { Novidades } from './pages/novidades/novidades';
import { Tendencias } from './pages/tendencias/tendencias';
import { Dicas } from './pages/dicas/dicas';
import { Bastidores } from './pages/bastidores/bastidores';
import { Opiniao } from './pages/opiniao/opiniao';

export const routes: Routes = [
    {
        path: '',
        component: Home,
        title: 'Soft Chaos | Home'
    },

    {
        path: 'noticia/:slug', //Define o :slug como se fosse uma variável para pegá-la no news-page.ts diretamente da URL. Assim, tudo que vier após noticia/ é visto como slug. Se pega, bate com o slug das notícias e puxa a notícia que tem o slug igual.
        component: NewsPage,
        title: 'Soft Chaos | Notícia'
    },

    {
        path: 'explorar',
        component: ExplorarChaosPage,
        title: 'Explorar Chaos | Explorer'
    },

    {
        path: 'novidades',
        component: Novidades,
        title: 'Soft Chaos | Novidades'
    },

    {
        path: 'tendencias',
        component: Tendencias,
        title: 'Soft Chaos | Tendências'
    },

    {
        path: 'dicas',
        component: Dicas,
        title: 'Soft Chaos | Dicas'
    },

    {
        path: 'bastidores',
        component: Bastidores,
        title: 'Soft Chaos | Bastidores'
    },

    {
        path: 'opiniao',
        component: Opiniao,
        title: 'Soft Chaos | Opinião'
    },

    {
        path: '**',
        redirectTo: '',
        pathMatch: 'full'
    }
];
