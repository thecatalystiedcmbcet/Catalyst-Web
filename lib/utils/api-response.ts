import { NextResponse } from "next/server";

interface ApiErrorResponse {
    error: string;
    details?: string;
}


export function successResponse(data: Record<string, unknown> | unknown[], status = 200) {
    return NextResponse.json(data, { status });
}

export function errorResponse(error: string, details?: string, status = 500) {
    const body: ApiErrorResponse = { error };
    if (details) body.details = details;
    return NextResponse.json(body, { status });
}

export function badRequest(message: string) {
    return errorResponse(message, undefined, 400);
}

export function notFound(message: string) {
    return errorResponse(message, undefined, 404);
}

export function handleError(label: string, error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`${label}:`, error);
    return errorResponse(`Failed to ${label.toLowerCase()}`, message, 500);
}
