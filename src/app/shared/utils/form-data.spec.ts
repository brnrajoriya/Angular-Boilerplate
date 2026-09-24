import { toFormData } from './form-data';

describe('toFormData', () => {
  it('flattens nested objects and arrays with bracket notation', () => {
    const fd = toFormData({ title: 'x', tags: ['a', 'b'], meta: { w: 10, nested: { h: 2 } } });

    expect(fd.get('title')).toBe('x');
    expect(fd.get('tags[0]')).toBe('a');
    expect(fd.get('tags[1]')).toBe('b');
    expect(fd.get('meta[w]')).toBe('10');
    expect(fd.get('meta[nested][h]')).toBe('2');
  });

  it('keeps falsy-but-valid values and skips null / undefined', () => {
    const fd = toFormData({
      zero: 0,
      no: false,
      yes: true,
      empty: '',
      nil: null,
      undef: undefined,
    });

    expect(fd.get('zero')).toBe('0');
    expect(fd.get('no')).toBe('0');
    expect(fd.get('yes')).toBe('1');
    expect(fd.get('empty')).toBe('');
    expect(fd.has('nil')).toBe(false);
    expect(fd.has('undef')).toBe(false);
  });

  it('appends files with their name and serialises dates', () => {
    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });
    const date = new Date('2026-01-02T03:04:05.000Z');
    const fd = toFormData({ file, date });

    expect((fd.get('file') as File).name).toBe('hello.txt');
    expect(fd.get('date')).toBe('2026-01-02T03:04:05.000Z');
  });
});
