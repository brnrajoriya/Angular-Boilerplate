/** Laravel-style paginator payload returned by list endpoints. */
export interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

/** Wrapper for single-resource responses: `{ data: {...} }`. */
export interface DataResponse<T> {
  data: T;
}

export type SortOrder = 'asc' | 'desc';

export interface ListQuery {
  page?: number;
  per_page?: number;
  sort_by?: string;
  order_by?: SortOrder;
  keyword?: string;
}
