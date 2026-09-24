/**
 * Tiny, exception-safe wrapper around `localStorage`.
 * Storage can throw (private mode, quota, disabled cookies) or be missing (SSR / tests).
 */
export const storage = {
  get<T>(key: string): T | null {
    try {
      const raw = globalThis.localStorage?.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  set(key: string, value: unknown): void {
    try {
      globalThis.localStorage?.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore: persistence is best effort.
    }
  },
  remove(key: string): void {
    try {
      globalThis.localStorage?.removeItem(key);
    } catch {
      // Ignore.
    }
  },
};
