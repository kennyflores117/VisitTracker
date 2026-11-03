import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'visits', pathMatch: 'full' },
  {
    path: 'visits',
    loadComponent: () => import('./visit-list/visit-list').then((m) => m.VisitList),
  },
  // Must come before 'visits/:id', or 'new' would be matched as an id.
  {
    path: 'visits/new',
    loadComponent: () => import('./visit-form/visit-form').then((m) => m.VisitForm),
  },
  {
    path: 'visits/:id',
    loadComponent: () =>
      import('./visit-detail-page/visit-detail-page').then((m) => m.VisitDetailPage),
  },
];
