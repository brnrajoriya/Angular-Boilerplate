import { DecimalPipe } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressBar } from '@angular/material/progress-bar';
import { Subscription } from 'rxjs';

import { errorMessage, fieldErrors } from '../../core/http/api-error';
import { NotificationService } from '../../core/services/notification.service';
import { FileService, UploadedFile } from './file.service';

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = 'image/*,video/*';

interface Selected {
  file: File;
  previewUrl: string;
  kind: 'image' | 'video';
}

@Component({
  selector: 'app-uploads',
  imports: [
    DecimalPipe,
    MatCard,
    MatCardContent,
    MatButton,
    MatIcon,
    MatProgressBar,
    MatListModule,
  ],
  templateUrl: './uploads.html',
  styleUrl: './uploads.scss',
})
export default class Uploads {
  private readonly files = inject(FileService);
  private readonly notify = inject(NotificationService);

  protected readonly accept = ACCEPT;
  protected readonly selected = signal<Selected | null>(null);
  protected readonly progress = signal<number | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly uploaded = signal<UploadedFile[]>([]);
  protected readonly dragging = signal(false);

  private upload$?: Subscription;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.upload$?.unsubscribe();
      this.clearPreview();
    });
  }

  protected onPick(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.select(input.files?.[0]);
    input.value = ''; // allow picking the same file again
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    this.select(event.dataTransfer?.files[0]);
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(true);
  }

  protected upload(): void {
    const selected = this.selected();
    if (!selected || this.progress() !== null) return;

    this.error.set(null);
    this.progress.set(0);
    this.upload$ = this.files.upload(selected.file, { folder: 'demo' }).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.progress.set(Math.round((100 * event.loaded) / event.total));
        } else if (event.type === HttpEventType.Response && event.body) {
          this.uploaded.update((list) => [event.body!, ...list]);
          this.notify.success(`${selected.file.name} uploaded.`);
          this.progress.set(null);
          this.clearPreview();
        }
      },
      error: (e: unknown) => {
        this.progress.set(null);
        this.error.set(fieldErrors(e)['file']?.[0] ?? errorMessage(e, 'Upload failed.'));
      },
    });
  }

  protected cancel(): void {
    this.upload$?.unsubscribe();
    this.progress.set(null);
    this.clearPreview();
  }

  private select(file: File | undefined): void {
    this.error.set(null);
    if (!file) return;
    if (!/^(image|video)\//.test(file.type)) {
      this.error.set('Only image and video files are allowed.');
      return;
    }
    if (file.size > MAX_BYTES) {
      this.error.set('The file may not be greater than 10 MB.');
      return;
    }
    this.clearPreview();
    this.selected.set({
      file,
      previewUrl: URL.createObjectURL(file),
      kind: file.type.startsWith('video/') ? 'video' : 'image',
    });
  }

  private clearPreview(): void {
    const current = this.selected();
    if (current) URL.revokeObjectURL(current.previewUrl);
    this.selected.set(null);
  }
}
