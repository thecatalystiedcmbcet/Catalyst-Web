import { NextResponse } from "next/server";
import { Client, Account } from "node-appwrite";

const ENDPOINT = process.env.NEXT_APPWRITE_ENDPOINT as string;
const PROJECT_ID = process.env.NEXT_APPWRITE_PROJECT_ID as string;

const SESSION_COOKIE = "admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours

export async function POST(request: Request) {
    try {
        let body: { email?: string; password?: string };
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        // Use a guest/user-scoped client (no API key) to create a session
        const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);
        const account = new Account(client);

        let session;
        try {
            session = await account.createEmailPasswordSession(email, password);
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Invalid credentials";
            return NextResponse.json({ error: message }, { status: 401 });
        }

        // Store plain userId in the cookie — validated server-side via API key.
        // httpOnly ensures it can't be read or forged client-side.
        const response = NextResponse.json({ message: "Logged in successfully" });
        response.cookies.set(SESSION_COOKIE, session.userId, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: SESSION_MAX_AGE,
        });

        return response;
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "Login failed", details: message },
            { status: 500 }
        );
    }
}
