import { Component, computed, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';

/**
 * Prints the first validation message of a Signal Forms field.
 * Put it inside `<mat-error>` - Material only shows it once the field is invalid + touched.
 */
@Component({
  selector: 'app-field-error',
  template: '{{ message() }}',
})
export class FieldError {
  readonly field = input.required<FieldTree<unknown>>();
  protected readonly message = computed(() => this.field()().errors()[0]?.message ?? '');
}
