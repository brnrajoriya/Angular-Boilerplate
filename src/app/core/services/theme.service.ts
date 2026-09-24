import { DOCUMENT, Injectable, effect, inject, signal } from '@angular/core';

import { storage } from './storage';

export type Theme = 'light' | 'dark' | 'system';
const THEME_KEY = 'theme';

/** Light / dark / system theme. Material 3 tokens react to the CSS `color-scheme` property. */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  readonly theme = signal<Theme>(storage.get<Theme>(THEME_KEY) ?? 'system');

  constructor() {
    effect(() => {
      const theme = this.theme();
      this.document.documentElement.style.colorScheme = theme === 'system' ? 'light dark' : theme;
      storage.set(THEME_KEY, theme);
    });
  }

  cycle(): void {
    const order: Theme[] = ['system', 'light', 'dark'];
    this.theme.update((t) => order[(order.indexOf(t) + 1) % order.length]);
  }
}
