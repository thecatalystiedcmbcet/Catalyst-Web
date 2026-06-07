/**
 * Edge-compatible Appwrite session helpers.
 * Uses the Appwrite Users REST API with the server API key.
 * Safe to import from middleware (Edge Runtime) and Server Components.
 *
 * Cookie format: plain Appwrite userId string
 */

const ENDPOINT = process.env.NEXT_APPWRITE_ENDPOINT as string;
const PROJECT_ID = process.env.NEXT_APPWRITE_PROJECT_ID as string;
const API_KEY = process.env.NEXT_APPWRITE_API_KEY as string;

export interface AppwriteUser {
    $id: string;
    name: string;
    email: string;
}

/**
 * Validate an admin session cookie and return the Appwrite user.
 * cookieValue = plain Appwrite userId set by the login route.
 * Returns null on any failure.
 */
export async function getSessionUser(
    cookieValue: string
): Promise<AppwriteUser | null> {
    if (!cookieValue || cookieValue.length < 5) return null;

    try {
        const res = await fetch(`${ENDPOINT}/users/${cookieValue}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "X-Appwrite-Project": PROJECT_ID,
                "X-Appwrite-Key": API_KEY,
            },
            cache: "no-store",
        });

        if (!res.ok) {
            if (process.env.NODE_ENV === "development") {
                const body = await res.text().catch(() => "");
                console.warn(`[session] User lookup failed ${res.status}:`, body);
            }
            return null;
        }

        const user = await res.json();
        return { $id: user.$id, name: user.name, email: user.email };
    } catch (err) {
        console.warn("[session] getSessionUser error:", err);
        return null;
    }
}
