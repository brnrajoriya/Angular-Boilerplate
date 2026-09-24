import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatListItem, MatListItemIcon, MatListItemTitle, MatNavList } from '@angular/material/list';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { MatToolbar } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth/auth.service';
import { LoadingService } from '../../core/http/loading.service';
import { APP_NAME } from '../../core/services/page-title.strategy';
import { provideMaterialDefaults } from '../../shared/ui/material-defaults';
import { ThemeToggle } from '../theme-toggle';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  exact?: boolean;
}

@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbar,
    MatSidenavContainer,
    MatSidenav,
    MatSidenavContent,
    MatNavList,
    MatListItem,
    MatListItemIcon,
    MatListItemTitle,
    MatIcon,
    MatIconButton,
    MatButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatProgressBar,
    ThemeToggle,
  ],
  providers: [provideMaterialDefaults()],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export default class Shell {
  protected readonly auth = inject(AuthService);
  protected readonly loading = inject(LoadingService);
  protected readonly appName = APP_NAME;
  protected readonly envName = environment.name;
  protected readonly year = new Date().getFullYear();

  protected readonly isHandset = toSignal(
    inject(BreakpointObserver)
      .observe([Breakpoints.XSmall, Breakpoints.Small])
      .pipe(map((result) => result.matches)),
    { initialValue: false },
  );

  protected readonly navItems = computed<NavItem[]>(() => [
    { path: '/', label: 'Home', icon: 'home', exact: true },
    ...(this.auth.isAuthenticated()
      ? [
          { path: '/dummies', label: 'Dummies (CRUD)', icon: 'table_view' },
          { path: '/uploads', label: 'File upload', icon: 'cloud_upload' },
        ]
      : []),
  ]);

  protected closeOnHandset(sidenav: MatSidenav): void {
    if (this.isHandset()) void sidenav.close();
  }
}
