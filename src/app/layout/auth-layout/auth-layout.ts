import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import { APP_NAME } from '../../core/services/page-title.strategy';
import { provideMaterialDefaults } from '../../shared/ui/material-defaults';
import { ThemeToggle } from '../theme-toggle';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, RouterLink, ThemeToggle],
  providers: [provideMaterialDefaults()],
  template: `
    <header class="header">
      <a routerLink="/" class="brand">{{ appName }}</a>
      <app-theme-toggle />
    </header>
    <main class="main">
      <router-outlet />
    </main>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100dvh;
      background: var(--mat-sys-surface-container-low);
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 16px;
    }
    .brand {
      color: inherit;
      text-decoration: none;
      font: var(--mat-sys-title-large);
    }
    .main {
      flex: 1;
      display: grid;
      place-items: center;
      padding: 16px;
    }
  `,
})
export default class AuthLayout {
  protected readonly appName = APP_NAME;
}
