'use client';

/**
 * Imperative hook for reading and writing sessionStorage.
 * All values are JSON-serialised, supporting strings, numbers, booleans, arrays, and objects.
 * SSR-safe — all operations are wrapped in try/catch for environments where sessionStorage
 * is unavailable (e.g. server-side rendering in Next.js).
 *
 * @example
 * const { get, set, remove, getAll } = useSessionStorage();
 *
 * // Write
 * set('new-task-draft', { title: 'Buy milk', priority: 1 });
 *
 * // Read single key
 * const draft = get<{ title: string; priority: number }>('new-task-draft');
 *
 * // Read all keys
 * const all = getAll<string>();
 *
 * // Remove single key
 * remove('new-task-draft');
 */
export function useSessionStorage() {
  function get<T>(key: string): T | null {
    try {
      const raw = sessionStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  function getAll<T>(): Record<string, T> {
    try {
      const result: Record<string, T> = {};
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (!key) continue;
        const raw = sessionStorage.getItem(key);
        if (raw) result[key] = JSON.parse(raw) as T;
      }
      return result;
    } catch {
      return {};
    }
  }

  function set<T>(key: string, value: T): void {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }

  function remove(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch {}
  }

  return { get, getAll, set, remove };
}
