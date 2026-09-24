import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { CrudService, toHttpParams } from './crud.service';

interface Item {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
class ItemService extends CrudService<Item> {
  protected readonly endpoint = '/api/items';
}

describe('CrudService', () => {
  let service: ItemService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ItemService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('drops empty query params', () => {
    const params = toHttpParams({ page: 2, keyword: '', sort_by: undefined, order_by: null });
    expect(params.toString()).toBe('page=2');
  });

  it('lists with query params', () => {
    service.list({ page: 3, per_page: 5, keyword: 'abc' }).subscribe();
    const req = http.expectOne((r) => r.url === '/api/items');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.toString()).toBe('page=3&per_page=5&keyword=abc');
    req.flush({
      data: [],
      current_page: 3,
      last_page: 3,
      per_page: 5,
      total: 0,
      from: null,
      to: null,
    });
  });

  it('unwraps { data } for single resources', () => {
    let result: Item | undefined;
    service.update(7, { name: 'new' }).subscribe((item) => (result = item));
    const req = http.expectOne('/api/items/7');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ name: 'new' });
    req.flush({ data: { id: 7, name: 'new' } });
    expect(result).toEqual({ id: 7, name: 'new' });
  });

  it('deletes by id', () => {
    service.delete(4).subscribe();
    const req = http.expectOne('/api/items/4');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });
});
