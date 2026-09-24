import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { DataResponse, ListQuery, Paginated } from '../models/api.models';

/** Removes `undefined`, `null` and empty-string values so they are not sent as `?keyword=`. */
export function toHttpParams(query: object): HttpParams {
  let params = new HttpParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      params = params.set(key, String(value));
    }
  }
  return params;
}

/**
 * Generic REST resource client:
 *
 *   GET    {endpoint}?page&per_page&sort_by&order_by&keyword → Paginated<T>
 *   GET    {endpoint}/{id}                                   → { data: T }
 *   POST   {endpoint}                                        → { data: T }
 *   PATCH  {endpoint}/{id}                                   → { data: T }
 *   DELETE {endpoint}/{id}                                   → 204
 *
 * Extend it and set `endpoint` to get a fully typed service for a new resource.
 */
export abstract class CrudService<T extends { id: number }, TPayload = Omit<T, 'id'>> {
  protected readonly http = inject(HttpClient);
  protected abstract readonly endpoint: string;

  list(query: ListQuery = {}, context?: HttpContext): Observable<Paginated<T>> {
    return this.http.get<Paginated<T>>(this.endpoint, { params: toHttpParams(query), context });
  }

  get(id: number, context?: HttpContext): Observable<T> {
    return this.http
      .get<DataResponse<T>>(`${this.endpoint}/${id}`, { context })
      .pipe(map((res) => res.data));
  }

  create(payload: TPayload): Observable<T> {
    return this.http.post<DataResponse<T>>(this.endpoint, payload).pipe(map((res) => res.data));
  }

  update(id: number, payload: Partial<TPayload>): Observable<T> {
    return this.http
      .patch<DataResponse<T>>(`${this.endpoint}/${id}`, payload)
      .pipe(map((res) => res.data));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }
}
