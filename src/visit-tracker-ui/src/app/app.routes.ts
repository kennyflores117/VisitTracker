import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'visits', pathMatch: 'full' },
  {
    path: 'visits',
    loadComponent: () => import('./visit-list/visit-list').then((m) => m.VisitList),
  },
  {
    path: 'visits/:id',
    loadComponent: () =>
      import('./visit-detail-page/visit-detail-page').then((m) => m.VisitDetailPage),
  },
];
