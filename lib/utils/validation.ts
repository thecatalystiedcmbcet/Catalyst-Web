const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^https?:\/\/.+/;
const PHONE_REGEX = /^[\d\s\-+()]{7,20}$/;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z?)?$/;
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

interface ValidationError {
    field: string;
    message: string;
}

export function isValidEmail(email: string): boolean {
    return EMAIL_REGEX.test(email);
}

export function isValidUrl(url: string): boolean {
    return URL_REGEX.test(url);
}

export function isValidPhone(phone: string): boolean {
    return PHONE_REGEX.test(phone);
}

export function isValidISODate(date: string): boolean {
    return ISO_DATE_REGEX.test(date) && !isNaN(Date.parse(date));
}

export function isValidSlug(slug: string): boolean {
    return SLUG_REGEX.test(slug);
}

export function isNonEmptyString(value: unknown): value is string {
    return typeof value === "string" && value.trim().length > 0;
}

export function isStringArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every((v) => typeof v === "string");
}

export function validateFields(
    rules: {
        field: string;
        value: unknown;
        required?: boolean;
        type?: "email" | "url" | "phone" | "date" | "slug" | "string";
        maxLength?: number;
    }[]
): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const rule of rules) {
        const { field, value, required, type, maxLength } = rule;

        if (required && (value === null || value === undefined || value === "")) {
            errors.push({ field, message: `${field} is required` });
            continue;
        }

        if (value === null || value === undefined || value === "") continue;

        if (typeof value !== "string") continue;

        if (maxLength && value.length > maxLength) {
            errors.push({ field, message: `${field} must be at most ${maxLength} characters` });
        }

        switch (type) {
            case "email":
                if (!isValidEmail(value)) {
                    errors.push({ field, message: `${field} must be a valid email address` });
                }
                break;
            case "url":
                if (!isValidUrl(value)) {
                    errors.push({ field, message: `${field} must be a valid URL (starting with http:// or https://)` });
                }
                break;
            case "phone":
                if (!isValidPhone(value)) {
                    errors.push({ field, message: `${field} must be a valid phone number` });
                }
                break;
            case "date":
                if (!isValidISODate(value)) {
                    errors.push({ field, message: `${field} must be a valid ISO date (e.g. 2026-01-15T00:00:00.000Z)` });
                }
                break;
            case "slug":
                if (!isValidSlug(value)) {
                    errors.push({ field, message: `${field} must be a valid slug (lowercase letters, numbers, hyphens only)` });
                }
                break;
        }
    }

    return errors;
}

export function formatValidationErrors(errors: ValidationError[]): string {
    return errors.map((e) => e.message).join("; ");
}
