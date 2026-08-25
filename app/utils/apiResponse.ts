type ApiStatus = "success" | "error";

export interface ApiResponse<T = unknown> {
    status: ApiStatus;
    message: string;
    data?: T | null;
    meta?: Record<string, unknown>;
}

export function successResponse<T = unknown>(data: T, message: string, meta?: Record<string, unknown>): ApiResponse<T> {
    return {
        status: "success",
        data,
        message,
        meta: meta || {},
    };
}

export function errorResponse<T = unknown>(message: string, data?: T | null, meta?: Record<string, unknown>): ApiResponse<T> {
    return {
        status: "error",
        message,
        data: data ?? null,
        meta: meta || {}
    };
}
