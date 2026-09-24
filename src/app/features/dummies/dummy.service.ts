import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';
import { CrudService } from '../../shared/data/crud.service';
import { Dummy, DummyPayload } from './dummy.model';

@Injectable({ providedIn: 'root' })
export class DummyService extends CrudService<Dummy, DummyPayload> {
  protected readonly endpoint = `${environment.adminApiUrl}/dummies`;
}
