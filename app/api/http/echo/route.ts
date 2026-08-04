import { NextRequest, NextResponse, userAgent } from "next/server";

async function handler(request: NextRequest) {

  const start = Date.now();
  const url = new URL(request.url);
  const trace: any[] = [
    {
      step: 'reqeust received',
      type: 'REAL',
      method: request.method,
    },
  ];
  const query = Object.fromEntries(
    url.searchParams.entries()
  );

  trace.push({
    step: 'query_parsed',
    type: 'REAL',
    path: url.pathname,
    query,
  });

  const headers = {
    contentType: request.headers.get('content-type'),
    accept: request.headers.get('accept'),
    userAgent: request.headers.get('user-agent'),
    authorization: request.headers.has('authorization') ? '[REDACTED]' : null,
    xLabHeader: request.headers.has('x-lab-header')
  };

  trace.push({
    step: 'headers_read',
    type: 'REAL'
  });

  let body: unknown = null;
  if (request.method !== "GET" && request.method !== "HEAD") {
    try {
      const contentType = request.headers.get("content-type");

      if (contentType?.includes('application/json')) {
        body = await request.json();
      } else {
        body = await request.text()
      }

      trace.push({
        step: 'body_parsed',
        type: "REAL",
        parder: contentType?.includes('application/json')
          ? "request.json()"
          : "request.text()",
      })

    } catch {
      return NextResponse.json(
        {
          error: 'could nto parse request body',
          trace,
        }, {
        status: 400
      }
      );
    }
  }

  trace.push({
    step: "response_created",
    type: "REAL",
    status: 200,
  });
  return NextResponse.json({
    request: {
      method: request.method,
      path: url.pathname,
      query,
      headers,
      body,
    },

    meta: {
      durationMs: Date.now() - start,
    },
    trace,
  }
  );
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;