import { Routes } from '@angular/router';

export default [
  { path: '', title: 'Dummies', loadComponent: () => import('./dummy-list/dummy-list') },
  { path: 'new', title: 'Create dummy', loadComponent: () => import('./dummy-form/dummy-form') },
  {
    path: ':id',
    title: 'Dummy details',
    loadComponent: () => import('./dummy-detail/dummy-detail'),
  },
  { path: ':id/edit', title: 'Edit dummy', loadComponent: () => import('./dummy-form/dummy-form') },
] satisfies Routes;
