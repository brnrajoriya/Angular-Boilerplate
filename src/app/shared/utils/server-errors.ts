import { FieldTree, ValidationError } from '@angular/forms/signals';

import { fieldErrors } from '../../core/http/api-error';

/**
 * Maps a 422 response (`{ errors: { email: ['taken'] } }`) onto Signal Forms fields so the
 * messages show up under the matching inputs. Return the result from a `submission.action`.
 *
 * Only fields that exist in the form model are mapped. Returns `undefined` when nothing could
 * be mapped, so the caller can fall back to a form-level message.
 */
export function serverErrors<T>(
  form: FieldTree<T>,
  error: unknown,
): ValidationError.WithOptionalFieldTree[] | undefined {
  const model = form().value();
  if (!model || typeof model !== 'object') return undefined;

  const fields = form as unknown as Record<string, FieldTree<unknown>>;
  const result = Object.entries(fieldErrors(error))
    .filter(([key]) => Object.hasOwn(model, key))
    .flatMap(([key, messages]) =>
      messages.map((message) => ({ kind: 'server', message, fieldTree: fields[key] })),
    );
  return result.length ? result : undefined;
}
