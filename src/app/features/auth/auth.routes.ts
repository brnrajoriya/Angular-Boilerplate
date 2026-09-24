import { Routes } from '@angular/router';

export default [
  { path: 'login', title: 'Login', loadComponent: () => import('./login/login') },
  { path: 'register', title: 'Register', loadComponent: () => import('./register/register') },
  {
    path: 'forgot-password',
    title: 'Forgot password',
    loadComponent: () => import('./forgot-password/forgot-password'),
  },
  {
    path: 'reset-password/:token',
    title: 'Reset password',
    loadComponent: () => import('./reset-password/reset-password'),
  },
] satisfies Routes;
