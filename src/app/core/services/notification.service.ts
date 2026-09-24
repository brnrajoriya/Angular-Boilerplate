import { Injectable, Injector, inject } from '@angular/core';
import type { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Toast messages. `MatSnackBar` (and the CDK overlay it needs) is loaded on first use,
 * which keeps ~100 kB out of the initial bundle.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly injector = inject(Injector);
  private snackBar?: Promise<MatSnackBar>;

  success(message: string): void {
    void this.open(message, 'OK', 3000, 'snack-success');
  }

  error(message: string): void {
    void this.open(message, 'Dismiss', 6000, 'snack-error');
  }

  private async open(message: string, action: string, duration: number, panelClass: string) {
    this.snackBar ??= import('@angular/material/snack-bar').then((m) =>
      this.injector.get(m.MatSnackBar),
    );
    (await this.snackBar).open(message, action, { duration, panelClass });
  }
}
