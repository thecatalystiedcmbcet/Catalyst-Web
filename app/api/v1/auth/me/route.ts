import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/appwrite/session";

const SESSION_COOKIE = "admin_session";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const sessionSecret = cookieStore.get(SESSION_COOKIE)?.value;

        if (!sessionSecret) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        const user = await getSessionUser(sessionSecret);

        if (!user) {
            return NextResponse.json(
                { error: "Session expired or invalid" },
                { status: 401 }
            );
        }

        return NextResponse.json({
            id: user.$id,
            name: user.name,
            email: user.email,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("Auth me error:", error);
        return NextResponse.json({ error: "Auth check failed", details: message }, { status: 500 });
    }
}
