const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface HttpRequestOptions {
    method: string;
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

export async function sendHttpRequest({
    method,
    path,
    query = {},
    headers = {},
    body
}: HttpRequestOptions): Promise<HttpResponse> {
    const url = new URL(`${API_URL}${path}`);

    Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
            url.searchParams.set(key, value);
        }
    });

    const start = performance.now();

    // Default headers if not present
    const requestHeaders = new Headers(headers);
    if (!requestHeaders.has("Content-Type") && body) {
        requestHeaders.set("Content-Type", "application/json");
    }

    const response = await fetch(url.toString(), {
        method,
        headers: requestHeaders,
        body: (method === "GET" || method === "HEAD") ? undefined : body,
    });

    const duration = Math.round(performance.now() - start);
    const contentType = response.headers.get("content-type");

    let data;
    if (contentType?.includes("application/json")) {
        data = await response.json();
    } else {
        data = await response.text();
    }

    const trace = data?.trace || [];

    // Remove trace from the payload so we don't display it inside the raw response
    if (data?.trace) {
        delete data.trace;
    }

    return {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data,
        duration,
        trace,
    };
}
