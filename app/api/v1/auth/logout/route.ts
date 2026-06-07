import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const ENDPOINT = process.env.NEXT_APPWRITE_ENDPOINT as string;
const PROJECT_ID = process.env.NEXT_APPWRITE_PROJECT_ID as string;
const API_KEY = process.env.NEXT_APPWRITE_API_KEY as string;
const SESSION_COOKIE = "admin_session";

export async function POST() {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get(SESSION_COOKIE)?.value;

        if (userId) {
            // Delete ALL sessions for this user via the server API key
            await fetch(`${ENDPOINT}/users/${userId}/sessions`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "X-Appwrite-Project": PROJECT_ID,
                    "X-Appwrite-Key": API_KEY,
                },
            }).catch(() => {
                // Ignore errors — still clear the cookie
            });
        }

        // Redirect to homepage after successful logout
        const response = NextResponse.redirect(
            new URL("/", process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"),
            { status: 303 }
        );
        response.cookies.set(SESSION_COOKIE, "", {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 0,
        });

        return response;
    } catch (error) {
        console.error("Logout error:", error);
        // Redirect to / even on error — still clear the cookie best-effort
        return NextResponse.redirect(
            new URL("/", process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"),
            { status: 303 }
        );
    }
}
