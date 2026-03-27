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
import { SearchPages } from './pages/search-pages/search-pages';
import { Auth } from './pages/adm/auth/auth';
import { AdmDashboard } from './pages/adm/adm-dashboard/adm-dashboard';
import { CreateArticle } from './pages/adm/adm-dashboard/components/create-article/create-article';
import { Overview } from './pages/adm/adm-dashboard/components/overview/overview';
import { Comments } from './pages/adm/adm-dashboard/components/comments/comments';
import { adminGuard } from './guards/admin-guard';

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
        path: 'busca',
        component: SearchPages,
        title: 'Soft Chaos | Busca'
    },

    {
        path: 'security/adimin-auth',
        component: Auth,
        title: 'Soft Chaos | Admimin Auth'
    },

    {
        path: 'security/adimin-dashboard',
        component: AdmDashboard,
        title: 'Soft Chaos | Admimin Dashboard'
    },

    {
        path: 'security/adimin-dashboard',
        component: AdmDashboard,
        canActivate: [adminGuard],
        children: [
            { path: '', redirectTo: 'overview', pathMatch: 'full' },
            { path: 'overview', component: Overview },  // Dashboard atual
            { path: 'create-article', component: CreateArticle },
            { path: 'comments', component: Comments },
        ]
    },

    {
        path: '**',
        redirectTo: '',
        pathMatch: 'full'
    }
];
