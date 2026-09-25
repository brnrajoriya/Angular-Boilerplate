import { LARAVEL_API_CONFIG } from './api.config';
import { toListParams } from './api-query';

describe('toListParams', () => {
  const names = LARAVEL_API_CONFIG.listParams;

  it('maps app names to the QueryFlow parameter names', () => {
    const params = toListParams(
      { page: 2, perPage: 10, sortBy: 'title', sortOrder: 'asc', keyword: ' x ' },
      names,
    );
    expect(params.toString()).toBe('page=2&per_page=10&order_by=title&order_type=asc&keyword=x');
  });

  it('sends filters as filter[column] and arrays as filter[column][]', () => {
    const params = toListParams(
      { filter: { status: 'active', category: ['tech', 'news'], empty: null } },
      names,
    );
    expect(params.getAll('filter[status]')).toEqual(['active']);
    expect(params.getAll('filter[category][]')).toEqual(['tech', 'news']);
    expect(params.has('filter[empty]')).toBe(false);
  });

  it('leaves out empty values and passes extra parameters through', () => {
    const params = toListParams(
      { keyword: '', sortBy: undefined, extra: { with_count: 'comments' } },
      names,
    );
    expect(params.toString()).toBe('with_count=comments');
  });

  it('uses custom names from the config', () => {
    const params = toListParams(
      { sortBy: 'title', sortOrder: 'desc' },
      { ...names, sortBy: 'sort', sortOrder: 'dir' },
    );
    expect(params.toString()).toBe('sort=title&dir=desc');
  });
});
