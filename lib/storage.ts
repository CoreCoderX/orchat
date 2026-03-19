// ── Local Storage Helpers ─────────────────────────────────────────────────────
// Safe wrappers around localStorage that handle SSR and quota errors

export function getStorageItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const item = localStorage.getItem(key);
    if (item === null) return fallback;
    return JSON.parse(item) as T;
  } catch {
    return fallback;
  }
}

export function setStorageItem<T>(key: string, value: T): boolean {
  if (typeof window === "undefined") return false;

  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    // Quota exceeded
    console.warn("localStorage quota exceeded");
    return false;
  }
}

export function removeStorageItem(key: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore
  }
}

// Get total localStorage usage in KB
export function getStorageUsageKB(): number {
  if (typeof window === "undefined") return 0;
  try {
    let total = 0;
    for (const key of Object.keys(localStorage)) {
      total += localStorage.getItem(key)?.length || 0;
    }
    return Math.round(total / 1024);
  } catch {
    return 0;
  }
}
