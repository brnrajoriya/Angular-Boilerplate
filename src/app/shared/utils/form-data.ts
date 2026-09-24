type FormValue =
  string | number | boolean | Date | Blob | null | undefined | FormObject | FormValue[];
interface FormObject {
  [key: string]: FormValue;
}

/**
 * Converts a (nested) object into `FormData` using bracket notation understood by
 * PHP / Laravel / Rails / Express (`qs`):
 *
 *   { title: 'x', tags: ['a', 'b'], meta: { w: 10 }, file: File }
 *   → title=x, tags[0]=a, tags[1]=b, meta[w]=10, file=<binary>
 *
 * `null` / `undefined` are skipped; `false` and `0` are kept; booleans become "1" / "0".
 */
export function toFormData(value: FormObject, form = new FormData(), namespace = ''): FormData {
  for (const [key, item] of Object.entries(value)) {
    append(form, namespace ? `${namespace}[${key}]` : key, item);
  }
  return form;
}

function append(form: FormData, key: string, value: FormValue): void {
  if (value === null || value === undefined) return;

  if (value instanceof Blob) {
    // `File` extends `Blob`; keep the original file name when present.
    form.append(key, value, value instanceof File ? value.name : undefined);
  } else if (value instanceof Date) {
    form.append(key, value.toISOString());
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => append(form, `${key}[${index}]`, item));
  } else if (typeof value === 'object') {
    toFormData(value, form, key);
  } else if (typeof value === 'boolean') {
    form.append(key, value ? '1' : '0');
  } else {
    form.append(key, String(value));
  }
}
