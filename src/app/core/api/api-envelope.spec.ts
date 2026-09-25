import { isEnvelope, normalizeErrorBody, unwrapEnvelope } from './api-envelope';

const envelope = (over: object) => ({
  status: 'success',
  data: {},
  errors: {},
  hasError: false,
  message: '',
  ...over,
});

describe('api-envelope', () => {
  it('recognises envelopes and ignores other bodies', () => {
    expect(isEnvelope(envelope({}))).toBe(true);
    expect(isEnvelope({ data: [] })).toBe(false);
    expect(isEnvelope('text')).toBe(false);
    expect(isEnvelope(null)).toBe(false);
  });

  it('unwraps data; an empty object becomes null', () => {
    expect(unwrapEnvelope(envelope({ data: { id: 1 } }))).toEqual({ id: 1 });
    expect(unwrapEnvelope(envelope({ data: [1, 2] }))).toEqual([1, 2]);
    expect(unwrapEnvelope(envelope({ data: 0 }))).toBe(0);
    expect(unwrapEnvelope(envelope({ data: {} }))).toBeNull();
    expect(unwrapEnvelope({ plain: true })).toEqual({ plain: true });
  });

  it('normalizes validation errors to { message, errors }', () => {
    const body = envelope({
      status: 'fail',
      hasError: true,
      errors: { email: ['Taken.'] },
      message: 'Taken.',
    });
    expect(normalizeErrorBody(body)).toEqual({ message: 'Taken.', errors: { email: ['Taken.'] } });
  });

  it('normalizes a list of messages to a message', () => {
    const body = envelope({
      status: 'fail',
      hasError: true,
      errors: ['Resource not found.'],
      message: '',
    });
    expect(normalizeErrorBody(body)).toEqual({ message: 'Resource not found.', errors: {} });
  });
});
