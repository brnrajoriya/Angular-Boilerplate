import { HttpParams } from '@angular/common/http';

import { ApiConfig } from './api.config';

/**
 * ============================================================================================
 *  LIST QUERY - how the app asks for a page of records, and how it goes over the wire.
 * ============================================================================================
 *
 * Components build a `ListQuery` with app-level names; `toListParams()` translates them into the
 * query string names configured in `api.config.ts` (`listParams`):
 *
 *   { page: 2, perPage: 10, sortBy: 'title', sortOrder: 'asc', keyword: 'x', filter: { category: ['tech', 'news'] } }
 *
 *   Laravel API Boilerplate (QueryFlow):
 *   ?page=2&per_page=10&order_by=title&order_type=asc&keyword=x&filter[category][]=tech&filter[category][]=news
 *
 * Need more QueryFlow features (operations, with, with_count, return_type, ...)? Pass them in
 * `extra` - they are sent as-is, e.g. `{ extra: { with_count: 'comments' } }`.
 */

export type SortOrder = 'asc' | 'desc';

export type FilterValue = string | number | boolean;

export interface ListQuery {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
  keyword?: string;
  /** Exact-match filters; an array means "any of these values". */
  filter?: Record<string, FilterValue | FilterValue[] | null | undefined>;
  /** Additional raw query parameters, sent unchanged. */
  extra?: Record<string, string | number | boolean | null | undefined>;
}

/** Empty values (`undefined`, `null`, `''`) are left out, so the backend applies its defaults. */
function isEmpty(value: unknown): boolean {
  return value === undefined || value === null || value === '';
}

export function toListParams(query: ListQuery, names: ApiConfig['listParams']): HttpParams {
  let params = new HttpParams();
  const set = (name: string, value: unknown) => {
    if (!isEmpty(value)) params = params.set(name, String(value));
  };

  set(names.page, query.page);
  set(names.perPage, query.perPage);
  set(names.sortBy, query.sortBy);
  set(names.sortOrder, query.sortOrder);
  set(names.keyword, query.keyword?.trim());

  for (const [column, value] of Object.entries(query.filter ?? {})) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (!isEmpty(item)) params = params.append(`${names.filter}[${column}][]`, String(item));
      }
    } else {
      set(`${names.filter}[${column}]`, value);
    }
  }

  for (const [name, value] of Object.entries(query.extra ?? {})) {
    set(name, value);
  }

  return params;
}
