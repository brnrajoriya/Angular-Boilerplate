import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, MatButton, MatIcon],
  template: `
    <section class="text-center py-5">
      <mat-icon class="big">travel_explore</mat-icon>
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist or has been moved.</p>
      <a mat-flat-button routerLink="/">Go home</a>
    </section>
  `,
  styles: `
    .big {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: var(--mat-sys-primary);
    }
  `,
})
export default class NotFound {}
