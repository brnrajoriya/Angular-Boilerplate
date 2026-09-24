import { Provider } from '@angular/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MAT_ICON_DEFAULT_OPTIONS } from '@angular/material/icon';

/**
 * App-wide Angular Material defaults. Provided by the (lazy) layout components rather than in
 * `app.config.ts`, so Material code is not pulled into the initial bundle.
 */
export function provideMaterialDefaults(): Provider[] {
  return [
    { provide: MAT_ICON_DEFAULT_OPTIONS, useValue: { fontSet: 'material-symbols-outlined' } },
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline' } },
  ];
}
