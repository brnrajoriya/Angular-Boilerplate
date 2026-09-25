import { HttpClient, HttpContext } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { API_CONFIG, apiUrl } from '../../core/api/api.config';
import { ListQuery, toListParams } from '../../core/api/api-query';
import { Paginated } from '../models/api.models';

/**
 * Generic REST resource client. Extend it and set `resource` to get a typed service:
 *
 *   @Injectable({ providedIn: 'root' })
 *   export class PostService extends CrudService<Post, PostPayload> {
 *     protected readonly resource = 'posts';
 *   }
 *
 * Endpoints (Laravel API Boilerplate `Route::apiCrud()`), relative to `API_CONFIG.baseUrl`:
 *
 *   GET    /{resource}?page&per_page&order_by&order_type&keyword&filter[..]  → Paginated<T>
 *   GET    /{resource}/{id}                                                  → T
 *   POST   /{resource}                                                       → T
 *   PATCH  /{resource}/{id}                                                  → T
 *   DELETE /{resource}/{id}
 *   DELETE /{resource}           body { ids: [...] }                         → { deleted }
 *   POST   /{resource}/{id}/restore                                          → T (soft deletes)
 *
 * Responses arrive already unwrapped by the envelope interceptor, so methods return plain data.
 * Query parameter names come from `API_CONFIG.listParams` (see core/api/api-query.ts).
 */
export abstract class CrudService<T extends { id: number }, TPayload = Omit<T, 'id'>> {
  protected readonly http = inject(HttpClient);
  protected readonly api = inject(API_CONFIG);

  /** Path segment of the resource, e.g. `'posts'`. */
  protected abstract readonly resource: string;

  /** Full URL of the collection, e.g. `https://api.example.com/api/v1/posts`. */
  protected get endpoint(): string {
    return apiUrl(this.api, this.resource);
  }

  list(query: ListQuery = {}, context?: HttpContext): Observable<Paginated<T>> {
    return this.http.get<Paginated<T>>(this.endpoint, {
      params: toListParams(query, this.api.listParams),
      context,
    });
  }

  get(id: number, context?: HttpContext): Observable<T> {
    return this.http.get<T>(`${this.endpoint}/${id}`, { context });
  }

  create(payload: TPayload): Observable<T> {
    return this.http.post<T>(this.endpoint, payload);
  }

  update(id: number, payload: Partial<TPayload>): Observable<T> {
    return this.http.patch<T>(`${this.endpoint}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<unknown>(`${this.endpoint}/${id}`).pipe(map(() => undefined));
  }

  /** Deletes several records at once (all or nothing on the Laravel API). */
  deleteMany(ids: number[]): Observable<number> {
    return this.http
      .delete<{ deleted: number }>(this.endpoint, { body: { ids } })
      .pipe(map((res) => res.deleted));
  }

  /** Restores a soft-deleted record. */
  restore(id: number): Observable<T> {
    return this.http.post<T>(`${this.endpoint}/${id}/restore`, null);
  }
}
