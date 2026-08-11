const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type HttpMethod =
    | "GET"
    | "POST"
    | "PUT"
    | "PATCH"
    | "DELETE"
    | "OPTIONS"
    | "HEAD";

export interface HttpRequestOptions {
    method: HttpMethod;
    path: string;
    query?: Record<string, string>;
    headers?: Record<string, string>;
    body?: string;
}

export interface HttpResponse {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    data: any;
    duration: number;
    trace: any[];
}

export async function sendHttpRequest(
    request: HttpRequestOptions
): Promise<HttpResponse> {
    const url = new URL(`${API_URL}${request.path}`);

    Object.entries(request.query ?? {}).forEach(([key, value]) => {
        if (key && value !== undefined && value !== "") {
            url.searchParams.set(key, value);
        }
    });

    const start = performance.now();

    const requestHeaders = new Headers(request.headers);
    if (!requestHeaders.has("Content-Type") && request.body) {
        requestHeaders.set("Content-Type", "application/json");
    }

    const response = await fetch(url.toString(), {
        method: request.method,
        headers: requestHeaders,
        body:
            request.method === "GET" || request.method === "HEAD"
                ? undefined
                : request.body || undefined,

        credentials: "include",

        // Important for the delay/redirect experiments
        redirect: "manual",
    });

    const duration = performance.now() - start;
    const text = await response.text();

    let data: any;
    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = text;
    }

    const trace = data && typeof data === "object" && "trace" in data
        ? data.trace
        : [];
        
    // Remove trace from the payload so we don't display it inside the raw response
    if (data && typeof data === "object" && "trace" in data) {
        delete data.trace;
    }

    return {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data,
        duration: Math.round(duration),
        trace,
    };
}
