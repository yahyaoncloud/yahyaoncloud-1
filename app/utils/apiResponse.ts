// apiResponse.ts
type ApiStatus = "success" | "error";

interface ApiResponse<T> {
    status: ApiStatus;
    message: string;
    data?: T;
    meta: string;
}

export function successResponse(data: any, message: string, meta?: any): ApiResponse<any> {
    return {
        status: "success",
        data,
        message,
        meta: meta || {},
    };
}

export function errorResponse(message: string, data: any, meta?: any): ApiResponse<any> {
    return {
        status: "error",
        message,
        data,
        meta: meta || {}
    };
}
