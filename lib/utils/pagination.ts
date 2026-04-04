import { Query } from "node-appwrite";

const DEFAULT_LIMIT = 25;
/** High enough for admin dashboards that load full lists in one request. */
const MAX_LIMIT = 500;

export interface PaginationParams {
    limit: number;
    offset: number;
}

export function parsePagination(request: Request): PaginationParams {
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    let limit = parseInt(url.searchParams.get("limit") || String(DEFAULT_LIMIT), 10);
    limit = Math.min(Math.max(1, limit), MAX_LIMIT);
    const offset = (page - 1) * limit;
    return { limit, offset };
}

export function paginationQueries(params: PaginationParams) {
    return [Query.limit(params.limit), Query.offset(params.offset)];
}
