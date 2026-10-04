/** Only same-site relative paths are allowed as post-login destinations (prevents open redirects). */
export function safeNextPath(value: string | null | undefined, fallback = "/account"): string {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\") || /[\u0000-\u001f]/.test(value)) {
    return fallback;
  }
  try {
    if (new URL(value, "http://localhost").origin !== "http://localhost") return fallback;
  } catch {
    return fallback;
  }
  return value;
}
