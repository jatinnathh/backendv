import { NextRequest, NextResponse } from "next/server";

async function echo(request: NextRequest) {
  const trace: any[] = [];
  const requestStart = Date.now();

  trace.push({
    step: "request_received",
    method: request.method,
    status: "completed",
  });

  // --------------------------
  // Parse URL
  // --------------------------

  trace.push({
    step: "url_parsing",
    status: "active",
  });

  const url = new URL(request.url);

  trace.push({
    step: "url_parsing",
    status: "completed",
    path: url.pathname,
    queryCount: url.searchParams.size,
  });

  // --------------------------
  // Parse Query Parameters
  // --------------------------

  trace.push({
    step: "query_parameters",
    status: "active",
  });

  const query = Object.fromEntries(
    url.searchParams.entries()
  );

  trace.push({
    step: "query_parameters",
    status: "completed",
    query,
  });

  // --------------------------
  // Parse Headers
  // --------------------------

  trace.push({
    step: "headers_parsing",
    status: "active",
  });

  const headers = {
    contentType: request.headers.get("content-type"),
    accept: request.headers.get("accept"),
    authorization: request.headers.has("authorization")
      ? "Bearer ********"
      : null,
    userAgent: request.headers.get("user-agent"),
    xLabHeader: request.headers.get("x-lab-header"),
  };

  trace.push({
    step: "headers_parsing",
    status: "completed",
    headers,
  });

  // --------------------------
  // Parse Body
  // --------------------------

  trace.push({
    step: "body_parsing",
    status: "active",
  });

  let body: any = null;

  try {
    if (
      request.method !== "GET" &&
      request.method !== "HEAD"
    ) {
      const contentType =
        request.headers.get("content-type") ?? "";

      if (contentType.includes("application/json")) {
        body = await request.json();
      } else {
        body = await request.text();
      }
    }

    trace.push({
      step: "body_parsing",
      status: "completed",
    });
  } catch {
    trace.push({
      step: "body_parsing",
      status: "failed",
    });

    return NextResponse.json(
      {
        error: "Invalid request body",
        trace,
      },
      {
        status: 400,
      }
    );
  }

  // --------------------------
  // Response
  // --------------------------

  trace.push({
    step: "response_serialization",
    status: "completed",
  });

  return NextResponse.json({
    request: {
      method: request.method,

      url: request.url,

      path: url.pathname,

      query,

      headers,

      body,
    },

    response: {
      contentType: "application/json",
      durationMs: Date.now() - requestStart,
    },

    trace,
  });
}

export const GET = echo;
export const POST = echo;
export const PUT = echo;
export const PATCH = echo;
export const DELETE = echo;