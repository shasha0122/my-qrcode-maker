const FALLBACK_PATH = "/generate";

export function getSafeRedirectPath(
  value: string | null | undefined,
  fallback = FALLBACK_PATH,
) {
  if (!value) {
    return fallback;
  }

  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback;
  }

  if (value.includes("://") || value.includes("\\")) {
    return fallback;
  }

  if (value.startsWith("/login") || value.startsWith("/signup")) {
    return fallback;
  }

  return value;
}
