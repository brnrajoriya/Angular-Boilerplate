import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { DataResponse } from '../../shared/models/api.models';
import { toFormData } from '../../shared/utils/form-data';

export interface UploadedFile {
  id: number;
  name: string;
  size: number;
  type: string;
  url: string;
}

@Injectable({ providedIn: 'root' })
export class FileService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.adminApiUrl}/files`;

  /**
   * Uploads a file (plus any extra fields) as `multipart/form-data`.
   * Emits progress events; the last event is the `HttpResponse`.
   * Do not set `Content-Type` yourself - the browser adds the multipart boundary.
   */
  upload(
    file: File,
    fields: Record<string, string | number | boolean> = {},
  ): Observable<HttpEvent<DataResponse<UploadedFile>>> {
    return this.http.post<DataResponse<UploadedFile>>(
      this.endpoint,
      toFormData({ ...fields, file }),
      {
        reportProgress: true,
        observe: 'events',
      },
    );
  }
}
