/**
 * Returns the absolute base URL for server-side fetch calls.
 *
 * Priority:
 * 1. NEXT_PUBLIC_APP_URL  – set this in Vercel env vars for production
 * 2. VERCEL_URL           – automatically injected by Vercel at build/runtime
 * 3. localhost:3000       – local development fallback
 */
export function normalizeBaseUrl(url: string): string {
    return url.replace(/\/+$/, "")
}

export function getBaseUrl(): string {
    let base: string
    if (process.env.NEXT_PUBLIC_APP_URL) {
        base = process.env.NEXT_PUBLIC_APP_URL
    } else if (process.env.VERCEL_URL) {
        // VERCEL_URL is injected without protocol
        base = `https://${process.env.VERCEL_URL}`
    } else {
        base = "http://localhost:3000"
    }
    return normalizeBaseUrl(base)
}

/**
 * Base URL for the current request (SSR / server actions). Prefer this over
 * {@link getBaseUrl} when `headers()` are available so the hostname matches the
 * visitor (custom domain, preview deployment, etc.).
 */
export function getBaseUrlFromRequestHeaders(requestHeaders: Headers): string {
    const host = requestHeaders.get("host")
    const proto =
        requestHeaders.get("x-forwarded-proto") ||
        (process.env.VERCEL ? "https" : "http")
    // Prefer the current request host so loopback hits this deployment (preview,
    // custom domain). NEXT_PUBLIC_APP_URL alone can point at production and break
    // preview or multi-region layouts.
    if (host) {
        return normalizeBaseUrl(`${proto}://${host}`)
    }
    const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim()
    if (explicit) {
        return normalizeBaseUrl(explicit)
    }
    return getBaseUrl()
}
