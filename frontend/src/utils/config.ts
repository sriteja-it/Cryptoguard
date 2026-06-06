/**
 * Application configuration loaded from environment variables
 */

const API_KEY_STORAGE_KEY = "pqc_dashboard_api_key";
const LEGACY_API_KEY_STORAGE_KEY = "pqc_api_key_override";
const API_BASE_URL_STORAGE_KEY = "pqc_dashboard_api_base_url";
const DEFAULT_API_BASE_URL = "http://localhost:4000";

// ── Normalization ─────────────────────────────────────────────────────────────
const normalizeApiBaseUrl = (url: string): string => {
  const trimmed = url.trim().replace(/\/+$/, "");
  if (!trimmed) return DEFAULT_API_BASE_URL;
  return trimmed;
};

// ── LocalStorage helpers ──────────────────────────────────────────────────────
const getStoredValue = (key: string): string | null => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(key);
};

const setStoredValue = (key: string, value: string): void => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, value);
};

const removeStoredValue = (key: string): void => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
};

// ── Config change event ───────────────────────────────────────────────────────
const notifyConfigChanged = (): void => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("pqc:config-changed"));
};

// ── API Key ───────────────────────────────────────────────────────────────────

/** Returns the active API key from storage or env */
export const getApiKey = (): string => {
  return (
    getStoredValue(API_KEY_STORAGE_KEY) ||
    getStoredValue(LEGACY_API_KEY_STORAGE_KEY) ||
    import.meta.env.VITE_API_KEY ||
    ""
  );
};

/** Saves a new API key to storage */
export const setApiKeyOverride = (apiKey: string): void => {
  setStoredValue(API_KEY_STORAGE_KEY, apiKey);
  // Do NOT write to legacy key — legacy is read-only fallback for old sessions
  notifyConfigChanged();
};

/** Clears the stored API key (both primary and legacy for full cleanup) */
export const clearApiKeyOverride = (): void => {
  removeStoredValue(API_KEY_STORAGE_KEY);
  removeStoredValue(LEGACY_API_KEY_STORAGE_KEY);
  notifyConfigChanged();
};

// ── API Base URL ──────────────────────────────────────────────────────────────

/** Returns the active API base URL from storage or env */
export const getApiBaseUrl = (): string => {
  return normalizeApiBaseUrl(
    getStoredValue(API_BASE_URL_STORAGE_KEY) ||
      import.meta.env.VITE_API_BASE_URL ||
      DEFAULT_API_BASE_URL
  );
};

/**
 * Saves a new API base URL override to storage.
 * Previously named setApiBaseOverride — use this correct name everywhere.
 */
export const setApiBaseUrlOverride = (url: string): void => {
  setStoredValue(API_BASE_URL_STORAGE_KEY, normalizeApiBaseUrl(url));
  notifyConfigChanged();
};

/**
 * @deprecated Use setApiBaseUrlOverride instead.
 * Alias kept so any component still calling the old name doesn't hard-crash.
 */
export const setApiBaseOverride = setApiBaseUrlOverride;

/** Clears the stored API base URL override, reverting to env/default */
export const clearApiBaseUrlOverride = (): void => {
  removeStoredValue(API_BASE_URL_STORAGE_KEY);
  notifyConfigChanged();
};

// ── Masked display ────────────────────────────────────────────────────────────

/** Returns a partially masked API key safe for display in UI */
export const getMaskedApiKey = (apiKey: string): string => {
  if (!apiKey) return "No key loaded";
  if (apiKey.length < 8) return "••••••••";
  const visiblePart = apiKey.substring(0, 8);
  const hiddenPart = "•".repeat(apiKey.length - 8);
  return `${visiblePart}${hiddenPart}`;
};

// ── Config object (reactive getters) ─────────────────────────────────────────

export const config = {
  get apiKey(): string {
    return getApiKey();
  },
  get apiBaseUrl(): string {
    return getApiBaseUrl();
  },
};

export default config;
<<<<<<< HEAD
=======

/**
 * Gets the masked version of API key for display
 */
export const getMaskedApiKey = (apiKey: string): string => {
  if (!apiKey) return 'No key loaded';
  if (apiKey.length < 8) return '••••••••';
  const visiblePart = apiKey.substring(0, 8);
  const hiddenPart = '•'.repeat(apiKey.length - 8);
  return `${visiblePart}${hiddenPart}`;
};
>>>>>>> 43d1e02 (Updated frontend and backend)
