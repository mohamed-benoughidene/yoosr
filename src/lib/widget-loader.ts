/**
 * Widget loader utility — builds safe iframe source URLs for the Yoosr widget.
 *
 * The widget runs in an iframe at the /widget route, completely isolated from
 * the parent page. This eliminates CSP conflicts and prevents style/script
 * leakage between the host page and the widget.
 */

// ── Types ───────────────────────────────────────────────────────────────────

export interface WidgetIframeOptions {
  /** Base URL for the widget route. Defaults to origin-relative path. */
  baseUrl?: string;
  /** UI theme override (e.g. "dark", "light") */
  theme?: string;
  /** Language locale override (e.g. "en", "ar", "fr") */
  lang?: string;
  /** Text direction override */
  dir?: "ltr" | "rtl";
  /** Additional custom query parameters */
  [key: string]: string | undefined;
}

// ── Constants ───────────────────────────────────────────────────────────────

const MAX_PROJECT_ID_LENGTH = 255;
const PROJECT_ID_REGEX = /^[a-zA-Z0-9_-]+$/;

// ── Validation ──────────────────────────────────────────────────────────────

/**
 * Validates a project ID to prevent injection attacks and malformed input.
 * Returns true if the ID is safe to use in a URL parameter.
 */
export function validateProjectId(projectId: string): boolean {
  if (typeof projectId !== "string") return false;
  if (projectId.trim().length === 0) return false;
  if (projectId.length > MAX_PROJECT_ID_LENGTH) return false;
  if (!PROJECT_ID_REGEX.test(projectId)) return false;
  return true;
}

// ── URL Builder ─────────────────────────────────────────────────────────────

/**
 * Builds a safe iframe source URL for the Yoosr widget.
 *
 * @param projectId - The project identifier (required, validated)
 * @param options - Optional configuration (theme, lang, custom params)
 * @returns The fully-qualified widget URL with encoded query parameters
 * @throws Error if projectId is empty, too long, or contains unsafe characters
 *
 * @example
 * // Origin-relative URL
 * buildWidgetIframeSrc("abc123")
 * // → "/widget?projectId=abc123"
 *
 * @example
 * // Full URL with options
 * buildWidgetIframeSrc("abc123", {
 *   baseUrl: "https://yoosr.io",
 *   theme: "dark",
 *   lang: "ar"
 * })
 * // → "https://yoosr.io/widget?projectId=abc123&theme=dark&lang=ar"
 */
export function buildWidgetIframeSrc(
  projectId: string,
  options: WidgetIframeOptions = {}
): string {
  if (!validateProjectId(projectId)) {
    throw new Error(
      `Invalid projectId: must be 1-${MAX_PROJECT_ID_LENGTH} characters, ` +
        `alphanumeric with hyphens/underscores only`
    );
  }

  const { baseUrl = "/widget", theme, lang, dir, ...rest } = options;

  const params = new URLSearchParams();
  params.set("projectId", projectId);

  // Append optional parameters (skip undefined values)
  if (theme) params.set("theme", theme);
  if (lang) params.set("lang", lang);
  if (dir) params.set("dir", dir);

  // Append any additional custom params
  for (const [key, value] of Object.entries(rest)) {
    if (value !== undefined) {
      params.set(key, value);
    }
  }

  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}
