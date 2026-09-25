import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { CrudService } from './crud.service';

interface Item {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
class ItemService extends CrudService<Item> {
  protected readonly resource = 'items';
}

describe('CrudService', () => {
  const url = `${environment.apiUrl}/items`;
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

  it('lists with the QueryFlow parameter names', () => {
    service
      .list({ page: 3, perPage: 5, sortBy: 'name', sortOrder: 'asc', keyword: 'abc' })
      .subscribe();
    const req = http.expectOne((r) => r.url === url);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.toString()).toBe(
      'page=3&per_page=5&order_by=name&order_type=asc&keyword=abc',
    );
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

  it('returns single resources as they come (the envelope is unwrapped by the interceptor)', () => {
    let result: Item | undefined;
    service.update(7, { name: 'new' }).subscribe((item) => (result = item));
    const req = http.expectOne(`${url}/7`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ name: 'new' });
    req.flush({ id: 7, name: 'new' });
    expect(result).toEqual({ id: 7, name: 'new' });
  });

  it('deletes one, many, and restores', () => {
    service.delete(4).subscribe();
    const one = http.expectOne(`${url}/4`);
    expect(one.request.method).toBe('DELETE');
    one.flush(null);

    let deleted = 0;
    service.deleteMany([1, 2]).subscribe((n) => (deleted = n));
    const many = http.expectOne(url);
    expect(many.request.method).toBe('DELETE');
    expect(many.request.body).toEqual({ ids: [1, 2] });
    many.flush({ deleted: 2 });
    expect(deleted).toBe(2);

    service.restore(4).subscribe();
    const restore = http.expectOne(`${url}/4/restore`);
    expect(restore.request.method).toBe('POST');
    restore.flush({ id: 4, name: 'back' });
  });
});
