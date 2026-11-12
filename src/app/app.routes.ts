import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home').then((m) => m.Home), data: { map: 'hero' } },
  { path: 'wiki', loadComponent: () => import('./pages/wiki-index/wiki-index').then((m) => m.WikiIndexPage) },
  { path: 'updates', loadComponent: () => import('./pages/updates/updates').then((m) => m.Updates) },
  { path: 'search', loadComponent: () => import('./pages/search/search').then((m) => m.Search) },
  { path: 'map', loadComponent: () => import('./pages/map/map-page').then((m) => m.MapPage) },
  { path: 'wiki/:slug', redirectTo: ':slug' },
  { path: ':slug', loadComponent: () => import('./pages/wiki-page/wiki-page').then((m) => m.WikiPageView) },
  { path: '**', loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound) },
];
