// ─── Form Safety Utilities ────────────────────────────────────────────────────
// Common client-side sanitisation & length-limit helpers used by every admin form.
//
//  • stripControlChars  – removes invisible / control characters (C0, C1, etc.)
//  • stripSqlPatterns   – neutralises common SQL injection patterns
//  • stripXss           – removes <script> blocks, HTML tags, event handlers,
//                         and decodes entity-encoded bypass attempts
//  • sanitizeText       – full pipeline: control chars → XSS → SQL → whitespace
//                         normalisation → trim → length limit
//  • sanitizeEmail      – lowercase, trim, regex-validate, strip dangerous chars
//  • sanitizePhone      – regex allowlist (digits + formatting), trim, limit
//  • sanitizeUrl        – trim, block dangerous schemes, strip tags
//  • sanitizeFormData   – applies the correct sanitiser to every field in one call
//  • FIELD_LIMITS       – single source of truth for max-length values
// ──────────────────────────────────────────────────────────────────────────────

// ─── Regex patterns ───────────────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^[\d\s\-+()]{7,20}$/
const URL_REGEX   = /^https?:\/\/.+/i

// ─── Real-time formatting helpers ───────────────────────────────────────────
export function enforceNameChars(value: string): string { return value.replace(/[^a-zA-Z\s]/g, "") }
export function enforceTitleChars(value: string): string { return value.replace(/[^a-zA-Z0-9\s\-.]/g, "") }
export function enforcePhoneChars(value: string): string { return value.replace(/[^\d\s\-+()]/g, "") }
export function enforceNoSpaces(value: string): string { return value.replace(/\s/g, "") }

// SQL injection patterns (case-insensitive, word-boundary where sensible)
const SQL_PATTERNS = [
    /(\b)(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|EXEC|EXECUTE|UNION|DECLARE)\b/gi,
    /--/g,                          // SQL single-line comment
    /\/\*[\s\S]*?\*\//g,            // SQL block comment  /* … */
    /;\s*(DROP|DELETE|UPDATE|INSERT|ALTER|CREATE|TRUNCATE)/gi,
    /'\s*(OR|AND)\s+'?\d/gi,        // classic ' OR '1  injection
    /CHAR\s*\(\s*\d+\s*\)/gi,      // CHAR(xx) obfuscation
]

/**
 * Checks if a string contains known SQL injection or XSS patterns.
 * Used for form validation to explicitly fail the submission.
 */
export function containsDangerousContent(value: string | undefined | null): boolean {
    if (!value) return false;
    
    // Check SQL injection patterns
    for (const pattern of SQL_PATTERNS) {
        pattern.lastIndex = 0;
        if (pattern.test(value)) return true;
    }
    
    // Basic XSS patterns
    const XSS_PATTERN = /<script.*?>.*?<\/script>|javascript:|data:|vbscript:|on\w+\s*=/gi;
    if (XSS_PATTERN.test(value)) return true;
    
    return false;
}

// ─── Max-length constants ─────────────────────────────────────────────────────
// Keep these in sync with Zod schemas.  Forms should also pass
// FIELD_LIMITS.xxx as the `maxLength` prop on <Input> / <Textarea>.
export const FIELD_LIMITS = {
    /** Short names – member names, role names */
    NAME: 100,
    /** Email addresses */
    EMAIL: 254,
    /** Phone numbers (formatted) */
    PHONE: 10,
    /** Short titles – event / achievement title */
    TITLE: 255,
    /** Subtitles / taglines */
    SUBTITLE: 255,
    /** Long-form descriptions */
    DESCRIPTION: 2000,
    /** URLs */
    URL: 2048,
    /** Generic short text fallback */
    SHORT: 255,
} as const

// ─── Centralised field configuration ──────────────────────────────────────────
// Single source of truth for every form field's type, required status, and max
// length.  Import FORM_FIELDS.<form>.<field> in your form components to keep
// all rules consistent.

export type SanitizeRule = {
    type: "text" | "email" | "phone" | "url"
    maxLength?: number
}

export type FieldConfig = {
    /** Sanitiser type to apply */
    type: "text" | "email" | "phone" | "url" | "file" | "date" | "select" | "boolean"
    /** Whether the field is shown in the form (set to false to hide it) */
    enabled: boolean
    /** Whether the field must be filled before submission */
    required: boolean
    /** Max length for text/email/url inputs (used for HTML maxLength + sanitiser) */
    maxLength?: number
}

export const FORM_FIELDS = {
    // ── Member form ───────────────────────────────────────────
    member: {
        name:         { type: "text",    enabled: true, required: true,  maxLength: FIELD_LIMITS.NAME }         as FieldConfig,
        email:        { type: "email",   enabled: true, required: true,  maxLength: FIELD_LIMITS.EMAIL }        as FieldConfig,
        phone:        { type: "phone",   enabled: true, required: false, maxLength: FIELD_LIMITS.PHONE }        as FieldConfig,
        photo:        { type: "file",    enabled: true, required: false }                                       as FieldConfig,
        organization: { type: "select",  enabled: true, required: false }                                       as FieldConfig,
        roles:        { type: "select",  enabled: true, required: false }                                       as FieldConfig,
        join_date:    { type: "date",    enabled: true, required: false }                                       as FieldConfig,
        leave_date:   { type: "date",    enabled: true, required: false }                                       as FieldConfig,
    },

    // ── Event form ────────────────────────────────────────────
    event: {
        title:          { type: "text",    enabled: true, required: true,  maxLength: FIELD_LIMITS.TITLE }       as FieldConfig,
        subtitle:       { type: "text",    enabled: true, required: true, maxLength: FIELD_LIMITS.SUBTITLE }    as FieldConfig,
        description:    { type: "text",    enabled: true, required: false, maxLength: FIELD_LIMITS.DESCRIPTION } as FieldConfig,
        cover_image:    { type: "file",    enabled: true, required: false }                                      as FieldConfig,
        related_images: { type: "file",    enabled: true, required: false }                                      as FieldConfig,
        start_date:     { type: "date",    enabled: true, required: false }                                      as FieldConfig,
        end_date:       { type: "date",    enabled: true, required: false }                                      as FieldConfig,
        register_link:  { type: "url",     enabled: true, required: false, maxLength: FIELD_LIMITS.URL }         as FieldConfig,
        status:         { type: "select",  enabled: true, required: true }                                      as FieldConfig,
        is_featured:    { type: "boolean", enabled: true, required: true }                                       as FieldConfig,
    },

    // ── Achievement form ──────────────────────────────────────
    achievement: {
        title:          { type: "text",    enabled: true, required: true,  maxLength: FIELD_LIMITS.TITLE }       as FieldConfig,
        subtitle:       { type: "text",    enabled: true, required: false, maxLength: FIELD_LIMITS.SUBTITLE }    as FieldConfig,
        description:    { type: "text",    enabled: true, required: false, maxLength: FIELD_LIMITS.DESCRIPTION } as FieldConfig,
        cover_image:    { type: "file",    enabled: true, required: false }                                      as FieldConfig,
        related_images: { type: "file",    enabled: true, required: false }                                      as FieldConfig,
        is_featured:    { type: "boolean", enabled: true, required: true }                                       as FieldConfig,
        org:            { type: "select",  enabled: true, required: false }                                      as FieldConfig,
        date:           { type: "date",    enabled: true, required: false }                                      as FieldConfig,
    },

    // ── Role form (add & edit) ────────────────────────────────
    role: {
        name: { type: "text", enabled: true, required: true, maxLength: FIELD_LIMITS.NAME }                     as FieldConfig,
    },
} as const

// ─── Helper: build sanitize rules from a form config ──────────────────────────
/** Convert a FORM_FIELDS.<form> config into the rules object for sanitizeFormData.
 *  Disabled fields are skipped. */
export function buildSanitizeRules(
    formConfig: Record<string, FieldConfig>
): Record<string, SanitizeRule> {
    const rules: Record<string, SanitizeRule> = {}
    for (const [key, cfg] of Object.entries(formConfig)) {
        if (!cfg.enabled) continue
        if (cfg.type === "text" || cfg.type === "email" || cfg.type === "phone" || cfg.type === "url") {
            rules[key] = { type: cfg.type, maxLength: cfg.maxLength }
        }
    }
    return rules
}

// ─── Low-level helpers ────────────────────────────────────────────────────────

/**
 * Remove invisible / control characters (C0 U+0000-001F except \t \n \r,
 * delete U+007F, C1 U+0080-009F, plus zero-width and directional markers).
 * This normalises encoding to safe visible UTF-8.
 */
export function stripControlChars(value: string): string {
    // eslint-disable-next-line no-control-regex
    return value
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")   // C0 (keep \t \n \r)
        .replace(/[\u0080-\u009F]/g, "")                        // C1
        .replace(/[\u200B-\u200F\u2028-\u202F\uFEFF]/g, "")    // zero-width & directional
}

/**
 * Neutralise common SQL injection patterns by removing them.
 */
export function stripSqlPatterns(value: string): string {
    let s = value
    for (const pattern of SQL_PATTERNS) {
        s = s.replace(pattern, "")
    }
    return s
}

/**
 * Strip XSS vectors:
 *  1. <script>…</script> blocks
 *  2. Event-handler attributes (onerror, onload, onclick, etc.)
 *  3. All remaining HTML tags
 *  4. HTML-entity-encoded bypass attempts (decode common entities then re-strip)
 *  5. javascript: / vbscript: / data: URIs embedded in text
 */
export function stripXss(value: string): string {
    let s = value
    // Remove <script>…</script> blocks (case-insensitive, multiline)
    s = s.replace(/<script[\s\S]*?<\/script\s*>/gi, "")
    // Remove event handlers like onerror="…" onclick='…' etc.
    s = s.replace(/\bon\w+\s*=\s*(["'])[\s\S]*?\1/gi, "")
    s = s.replace(/\bon\w+\s*=\s*[^\s>]*/gi, "")
    // Strip all remaining HTML tags
    s = s.replace(/<[^>]*>/g, "")
    // Decode common HTML entities attackers use to bypass tag stripping
    s = s
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/&amp;/gi, "&")
        .replace(/&quot;/gi, '"')
        .replace(/&#x27;/gi, "'")
        .replace(/&#x2F;/gi, "/")
        .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
        .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    // After decoding, strip tags one more time
    s = s.replace(/<[^>]*>/g, "")
    // Remove inline dangerous URI schemes that might remain in text
    s = s.replace(/\b(javascript|vbscript|data)\s*:/gi, "")
    return s
}

// ─── Public sanitisers ────────────────────────────────────────────────────────

/**
 * Full sanitisation pipeline for a generic text field:
 *  1. Remove invisible / control characters
 *  2. Strip XSS vectors (script tags, event handlers, HTML entities)
 *  3. Neutralise SQL injection patterns
 *  4. Collapse multiple consecutive whitespace into a single space
 *  5. Trim leading & trailing whitespace
 *  6. Truncate to `maxLength` if provided
 */
export function sanitizeText(value: string, maxLength?: number): string {
    let s = value
    s = stripControlChars(s)
    s = stripXss(s)
    s = stripSqlPatterns(s)
    // Collapse internal whitespace runs into a single space
    s = s.replace(/\s+/g, " ")
    // Trim
    s = s.trim()
    // Truncate
    if (maxLength && s.length > maxLength) {
        s = s.slice(0, maxLength)
    }
    return s
}

/**
 * Sanitise an email address:
 *  - Remove control / invisible characters
 *  - Trim & lowercase
 *  - Strip HTML tags
 *  - Validate against email regex (returns empty string if invalid)
 *  - Enforce length limit
 */
export function sanitizeEmail(value: string): string {
    let s = stripControlChars(value).trim().toLowerCase()
    s = s.replace(/<[^>]*>/g, "")
    s = stripSqlPatterns(s)
    if (s.length > FIELD_LIMITS.EMAIL) {
        s = s.slice(0, FIELD_LIMITS.EMAIL)
    }
    // Regex validation — return empty string if the email shape is invalid
    if (s && !EMAIL_REGEX.test(s)) {
        return ""
    }
    return s
}

/**
 * Sanitise a phone number:
 *  - Remove control characters
 *  - Keep only digits, spaces, dashes, plus, parentheses (regex allowlist)
 *  - Trim & validate against phone regex
 *  - Enforce length limit
 */
export function sanitizePhone(value: string): string {
    let s = stripControlChars(value)
    // Allowlist: keep only phone-safe characters
    s = s.replace(/[^\d\s\-+()]/g, "").trim()
    if (s.length > FIELD_LIMITS.PHONE) {
        s = s.slice(0, FIELD_LIMITS.PHONE)
    }
    // Optional: warn-level validation (return as-is for partial numbers during entry)
    return s
}

/**
 * Sanitise a URL string:
 *  - Remove control / invisible characters
 *  - Trim & strip HTML tags
 *  - Block dangerous schemes (javascript:, data:, vbscript:)
 *  - Validate via URL regex (must start with http:// or https://)
 *  - Neutralise SQL injection patterns
 *  - Enforce length limit
 */
export function sanitizeUrl(value: string): string {
    let s = stripControlChars(value).trim()
    // Strip HTML tags
    s = s.replace(/<[^>]*>/g, "")
    // Block dangerous schemes (collapse whitespace first to catch obfuscation)
    const lower = s.toLowerCase().replace(/\s/g, "")
    if (
        lower.startsWith("javascript:") ||
        lower.startsWith("data:") ||
        lower.startsWith("vbscript:")
    ) {
        return ""
    }
    s = stripSqlPatterns(s)
    if (s.length > FIELD_LIMITS.URL) {
        s = s.slice(0, FIELD_LIMITS.URL)
    }
    // Regex validation — must be http(s)
    if (s && !URL_REGEX.test(s)) {
        return ""
    }
    return s
}

// ─── Regex validators (for use in Zod schemas or ad-hoc checks) ───────────────

export { EMAIL_REGEX, PHONE_REGEX, URL_REGEX }



/**
 * Apply the correct sanitiser to every field listed in `rules`.
 * Fields not listed in `rules` are passed through untouched.
 *
 * @example
 *   const clean = sanitizeFormData(data, {
 *       title:       { type: "text", maxLength: FIELD_LIMITS.TITLE },
 *       description: { type: "text", maxLength: FIELD_LIMITS.DESCRIPTION },
 *       register_link: { type: "url" },
 *   })
 */
export function sanitizeFormData<T extends Record<string, any>>(
    data: T,
    rules: Partial<Record<keyof T, SanitizeRule>>
): T {
    const result = { ...data }
    for (const [key, rule] of Object.entries(rules) as [keyof T, SanitizeRule][]) {
        const raw = result[key]
        if (typeof raw !== "string") continue

        switch (rule.type) {
            case "text":
                (result as any)[key] = sanitizeText(raw, rule.maxLength)
                break
            case "email":
                (result as any)[key] = sanitizeEmail(raw)
                break
            case "phone":
                (result as any)[key] = sanitizePhone(raw)
                break
            case "url":
                (result as any)[key] = sanitizeUrl(raw)
                break
        }
    }
    return result
}
