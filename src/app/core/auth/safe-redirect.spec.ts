import { safeRedirectUrl } from './safe-redirect';

describe('safeRedirectUrl', () => {
  it('keeps same-app relative paths', () => {
    expect(safeRedirectUrl('/dummies?page=2')).toBe('/dummies?page=2');
  });

  it.each([
    undefined,
    null,
    '',
    'dummies',
    'https://evil.example',
    '//evil.example',
    '/\\evil.example',
    'javascript:alert(1)',
  ])('falls back for unsafe value %s', (value) => {
    expect(safeRedirectUrl(value)).toBe('/');
  });

  it('uses the provided fallback', () => {
    expect(safeRedirectUrl('//x', '/home')).toBe('/home');
  });
});
