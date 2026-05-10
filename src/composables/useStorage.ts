/**
 * useStorage — thin adapter over localStorage with JSON serialization.
 * Handles QuotaExceededError on save and gracefully falls back on parse errors.
 */
export function useStorage() {
  /**
   * Load a value from localStorage.
   * Returns `fallback` if the key is missing, the value is null, or JSON.parse fails.
   */
  function load<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key)
      if (raw === null) return fallback
      return JSON.parse(raw) as T
    } catch {
      return fallback
    }
  }

  /**
   * Save a value to localStorage as JSON.
   * Silently catches QuotaExceededError and other storage errors.
   */
  function save<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (err) {
      if (err instanceof DOMException && err.name === 'QuotaExceededError') {
        console.error('[useStorage] localStorage quota exceeded — data not saved.')
      } else {
        console.error('[useStorage] Failed to save to localStorage:', err)
      }
    }
  }

  /**
   * Detect whether localStorage is available and writable.
   * Attempts a test write/read/delete cycle.
   */
  function isAvailable(): boolean {
    const TEST_KEY = '__ef_storage_test__'
    try {
      localStorage.setItem(TEST_KEY, '1')
      const result = localStorage.getItem(TEST_KEY)
      localStorage.removeItem(TEST_KEY)
      return result === '1'
    } catch {
      return false
    }
  }

  return { load, save, isAvailable }
}
