import { Component, computed, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

import { ThemeService } from '../core/services/theme.service';

const ICONS = { system: 'brightness_auto', light: 'light_mode', dark: 'dark_mode' } as const;

@Component({
  selector: 'app-theme-toggle',
  imports: [MatIconButton, MatIcon, MatTooltip],
  template: `
    <button
      mat-icon-button
      type="button"
      (click)="theme.cycle()"
      [matTooltip]="label()"
      [attr.aria-label]="label()"
    >
      <mat-icon>{{ icon() }}</mat-icon>
    </button>
  `,
})
export class ThemeToggle {
  protected readonly theme = inject(ThemeService);
  protected readonly icon = computed(() => ICONS[this.theme.theme()]);
  protected readonly label = computed(() => `Theme: ${this.theme.theme()} (click to change)`);
}
