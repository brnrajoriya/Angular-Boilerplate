import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';

interface Feature {
  icon: string;
  title: string;
  text: string;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink, MatCard, MatCardContent, MatIcon, MatButton],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export default class Home {
  protected readonly auth = inject(AuthService);

  protected readonly features: Feature[] = [
    {
      icon: 'bolt',
      title: 'Angular 22, zoneless',
      text: 'Standalone components, signals, OnPush by default and no zone.js in the bundle.',
    },
    {
      icon: 'dynamic_form',
      title: 'Signal Forms',
      text: 'Typed, schema-based forms with client and server (422) validation errors.',
    },
    {
      icon: 'security',
      title: 'Auth & security',
      text: 'JWT session with auto-expiry, functional guards, token scoped to your API, strict CSP.',
    },
    {
      icon: 'table_view',
      title: 'CRUD template',
      text: 'Server-side paging, sorting and search kept in the URL, built on rxResource.',
    },
    {
      icon: 'cloud_upload',
      title: 'File upload',
      text: 'Images / videos as multipart FormData with live progress and previews.',
    },
    {
      icon: 'palette',
      title: 'Material 3 + Bootstrap',
      text: 'M3 theming with light / dark mode, plus Bootstrap 5 grid and utility classes.',
    },
    {
      icon: 'swap_horiz',
      title: 'Interceptors',
      text: 'Auth header, global error toasts, loading bar and an optional mock backend.',
    },
    {
      icon: 'rocket_launch',
      title: 'Ready to ship',
      text: 'dev / stage / prod environments, ESLint, Vitest, GitHub Actions, Docker + nginx.',
    },
  ];
}
