/**
 * Returns `url` only when it is a same-app relative path, otherwise `fallback`.
 * Prevents open-redirects through `?returnUrl=https://evil.example`, `//evil.example`
 * or `/\evil.example` (browsers treat a backslash like a slash).
 */
export function safeRedirectUrl(url: string | null | undefined, fallback = '/'): string {
  if (!url || !url.startsWith('/') || url.startsWith('//') || url.startsWith('/\\')) {
    return fallback;
  }
  return url;
}
