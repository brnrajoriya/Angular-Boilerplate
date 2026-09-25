import { Injectable } from '@angular/core';

import { CrudService } from '../../shared/data/crud.service';
import { Dummy, DummyPayload } from './dummy.model';

/** `/dummies` on the API (Laravel: `Route::apiCrud('dummies', DummyController::class)`). */
@Injectable({ providedIn: 'root' })
export class DummyService extends CrudService<Dummy, DummyPayload> {
  protected readonly resource = 'dummies';
}
