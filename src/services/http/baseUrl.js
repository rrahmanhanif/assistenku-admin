const DEFAULT_BASE_URL = "https://api.assistenku.com";

export const baseUrl = import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL;

export function resolveBaseUrl(override) {
  return override || baseUrl;
}
