import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_CONFIG, apiUrl } from '../../core/api/api.config';
import { toFormData } from '../../shared/utils/form-data';

/** An uploaded file as returned by the API (Laravel: `UploadResource`). */
export interface UploadedFile {
  id: number;
  original_name: string;
  mime_type: string;
  /** Bytes. */
  size: number;
  url: string;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class FileService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(API_CONFIG);
  private readonly endpoint = apiUrl(this.api, this.api.uploads);

  /**
   * Uploads a file (plus any extra fields) as `multipart/form-data` in the `file` field.
   * Emits progress events; the last event is the `HttpResponse` with the `UploadedFile`.
   * Do not set `Content-Type` yourself - the browser adds the multipart boundary.
   */
  upload(
    file: File,
    fields: Record<string, string | number | boolean> = {},
  ): Observable<HttpEvent<UploadedFile>> {
    return this.http.post<UploadedFile>(this.endpoint, toFormData({ ...fields, file }), {
      reportProgress: true,
      observe: 'events',
    });
  }
}
