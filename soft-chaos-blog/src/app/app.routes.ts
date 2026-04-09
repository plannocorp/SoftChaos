import { Routes } from '@angular/router';
import { NewsPage } from './pages/news-page/news-page';
import { Home } from './pages/home/home';
import { ExplorarChaosPage } from './pages/explorar-chaos-page/explorar-chaos-page';
import { Novidades } from './pages/novidades/novidades';
import { Tendencias } from './pages/tendencias/tendencias';
import { Dicas } from './pages/dicas/dicas';
import { Bastidores } from './pages/bastidores/bastidores';
import { Opiniao } from './pages/opiniao/opiniao';
import { SearchPages } from './pages/search-pages/search-pages';
import { AuthModern } from './pages/adm/auth/auth-modern';
import { AdmDashboardModern } from './pages/adm/adm-dashboard/adm-dashboard-modern';
import { CreateArticleStudio } from './pages/adm/adm-dashboard/components/create-article/create-article-studio';
import { OverviewModern } from './pages/adm/adm-dashboard/components/overview/overview-modern';
import { CommentsModern } from './pages/adm/adm-dashboard/components/comments/comments-modern';
import { ArticleStatusBoard } from './pages/adm/adm-dashboard/components/article-status-board/article-status-board';
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
        component: AuthModern,
        title: 'Soft Chaos | Admimin Auth'
    },

    {
        path: 'security/adimin-dashboard',
        component: AdmDashboardModern,
        canActivate: [adminGuard],
        children: [
            { path: '', redirectTo: 'overview', pathMatch: 'full' },
            { path: 'overview', component: OverviewModern },
            { path: 'create-article', component: CreateArticleStudio },
            {
                path: 'drafts',
                component: ArticleStatusBoard,
                data: {
                    status: 'DRAFT',
                    title: 'Rascunhos',
                    subtitle: 'Materias ainda em construcao, prontas para revisao e ajustes finais.'
                }
            },
            {
                path: 'scheduled',
                component: ArticleStatusBoard,
                data: {
                    status: 'SCHEDULED',
                    title: 'Agendados',
                    subtitle: 'Conteudos com data programada, com opcao de publicar manualmente quando precisar.'
                }
            },
            {
                path: 'published',
                component: ArticleStatusBoard,
                data: {
                    status: 'PUBLISHED',
                    title: 'Publicados',
                    subtitle: 'Artigos no ar com acoes de edicao, arquivamento e exclusao.'
                }
            },
            { path: 'articles/:id/edit', component: CreateArticleStudio },
            { path: 'comments', component: CommentsModern },
        ]
    },

    {
        path: '**',
        redirectTo: '',
        pathMatch: 'full'
    }
];
