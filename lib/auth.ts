import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/appwrite/session";
import type { AppwriteUser } from "@/lib/appwrite/session";

const SESSION_COOKIE = "admin_session";

/**
 * Returns the current authenticated admin user from the session cookie.
 * Server Components / Route Handlers only.
 */
export async function getCurrentUser(): Promise<AppwriteUser | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!userId) return null;

  try {
    return await getSessionUser(userId);
  } catch (err) {
    console.error("[auth] getCurrentUser error:", err);
    return null;
  }
}
