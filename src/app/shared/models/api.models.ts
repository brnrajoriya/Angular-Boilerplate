/**
 * Paginator returned by list endpoints (Laravel's `paginate()` shape, used by QueryFlow).
 * Extra keys the backend may add (`links`, `path`, `first_page_url`, ...) are ignored.
 */
export interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export type { FilterValue, ListQuery, SortOrder } from '../../core/api/api-query';
