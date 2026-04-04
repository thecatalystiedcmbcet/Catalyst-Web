/**
 * Centralized fetcher for admin server components (loopback to /api/v1).
 *
 * Uses `cache: "no-store"` so list data is not shared via the Next.js Data Cache
 * (fixes intermittent empty tables on Vercel). Optional `tags` / `revalidate` on
 * {@link adminFetch} are accepted for call-site compatibility; route handlers
 * should continue using `revalidateTag` after mutations.
 */

import { headers } from "next/headers"
import { getBaseUrlFromRequestHeaders } from "@/lib/get-base-url"

/** Loopback to Route Handlers: middleware allows `x-internal-token` without a session cookie. */
function getInternalApiHeaders(): Headers {
  const h = new Headers()
  h.set("x-internal-token", process.env.INTERNAL_API_KEY || "catalyst-internal-ssr")
  return h
}

/**
 * SSR fetch hits the public deployment URL; Vercel Deployment Protection runs
 * before our app. Use the automation bypass secret so server-side loopback works.
 * @see https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation
 */
function applyVercelDeploymentBypass(
  target: Headers,
  incomingRequestHeaders: Headers
): void {
  const forwarded = incomingRequestHeaders.get("x-vercel-protection-bypass")
  if (forwarded) {
    target.set("x-vercel-protection-bypass", forwarded)
    return
  }
  const secret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET
  if (secret) {
    target.set("x-vercel-protection-bypass", secret)
  }
}

/** Headers for any server-side fetch to this app while Deployment Protection is on. */
export async function getLoopbackRequestHeaders(): Promise<Headers> {
  const h = getInternalApiHeaders()
  applyVercelDeploymentBypass(h, await headers())
  return h
}

// ─── Cache tags (for on-demand revalidation via revalidateTag) ────────────────
export const CACHE_TAGS = {
  members: "admin-members",
  roles: "admin-roles",
  organizations: "admin-organizations",
  events: "admin-events",
  achievements: "admin-achievements",
  logs: "admin-logs",
} as const

// ─── Generic fetcher ──────────────────────────────────────────────────────────
export async function adminFetch<T>(
  path: string,
  options: {
    tags?: string[]
    revalidate?: number | false // false = no-store
  } = {}
): Promise<T> {
  const { tags = [], revalidate = 60 } = options
  const headersList = await headers()
  const sessionHeaders = await getLoopbackRequestHeaders()

  // Match the incoming request host (custom domain / preview) and avoid http
  // defaults on Vercel, which can break loopback fetches.
  const BASE = getBaseUrlFromRequestHeaders(headersList)

  // Admin lists must not be stored in the Next.js Data Cache — shared or stale
  // entries on Vercel caused intermittent empty tables for some requests.
  void tags
  void revalidate

  const fetchUrl = `${BASE}${path.startsWith("/") ? path : `/${path}`}`
  let res: Response;
  try {
    res = await fetch(fetchUrl, {
      method: "GET",
      headers: sessionHeaders,
      cache: "no-store",
    })
  } catch (err) {
    throw new Error(`[adminFetch] ${path} fetch failed entirely: ${err}`)
  }

  if (!res.ok) {
    let errBody = "";
    try { errBody = await res.text(); } catch(e) {}
    console.error(`[adminFetch] ${path} failed: ${res.status} ${res.statusText} - Body: ${errBody}`);
    throw new Error(`[adminFetch] ${path} failed: ${res.status} ${res.statusText}`)
  }

  return res.json() as Promise<T>
}
