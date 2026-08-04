import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET
// GET /api/http/methods
// GET /api/http/methods?id=...
export async function GET(request: NextRequest) {
  const start = Date.now();

  const id =
    request.nextUrl.searchParams.get("id");

  const trace: any[] = [
    {
      step: "request_received",
      type: "REAL",
      method: "GET",
    },
  ];

  if (id) {
    const item =
      await prisma.httpLabItem.findUnique({
        where: { id },
      });

    trace.push({
      step: "database_query",
      type: "REAL",
      tool: "Prisma",
      operation: "HttpLabItem.findUnique",
      found: Boolean(item),
    });

    if (!item) {
      return NextResponse.json(
        {
          error: "Item not found",
          trace,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      method: "GET",
      action: "READ_ONE",
      data: item,
      durationMs: Date.now() - start,
      trace,
    });
  }

  const items =
    await prisma.httpLabItem.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

  trace.push({
    step: "database_query",
    type: "REAL",
    tool: "Prisma",
    operation: "HttpLabItem.findMany",
    rows: items.length,
  });

  return NextResponse.json({
    method: "GET",
    action: "READ",
    data: items,
    durationMs: Date.now() - start,
    trace,
  });
}

// POST
export async function POST(request: NextRequest) {
  const trace: any[] = [
    {
      step: "request_received",
      type: "REAL",
      method: "POST",
    },
  ];

  try {
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json(
        {
          error: "name is required",
          trace,
        },
        { status: 400 }
      );
    }

    trace.push({
      step: "body_parsed",
      type: "REAL",
    });

    const item =
      await prisma.httpLabItem.create({
        data: {
          name: body.name,
          description: body.description ?? null,
        },
      });

    trace.push({
      step: "database_insert",
      type: "REAL",
      tool: "Prisma",
      operation: "HttpLabItem.create",
    });

    return NextResponse.json(
      {
        method: "POST",
        action: "CREATE",
        data: item,
        trace,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      {
        error: "Invalid JSON body",
        trace,
      },
      { status: 400 }
    );
  }
}

// PUT = complete replacement of editable fields
export async function PUT(request: NextRequest) {
  const id =
    request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      {
        error: "id query parameter is required",
      },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();

    if (!body.name || body.description === undefined) {
      return NextResponse.json(
        {
          error:
            "PUT requires the complete editable representation: name and description",
        },
        { status: 400 }
      );
    }

    const existing =
      await prisma.httpLabItem.findUnique({
        where: { id },
      });

    if (!existing) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    const item =
      await prisma.httpLabItem.update({
        where: { id },

        data: {
          name: body.name,
          description: body.description,
        },
      });

    return NextResponse.json({
      method: "PUT",
      action: "REPLACE",
      data: item,

      trace: [
        {
          step: "database_update",
          type: "REAL",
          tool: "Prisma",
          operation: "HttpLabItem.update",
          strategy: "complete",
        },
      ],
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}

// PATCH = partial update
export async function PATCH(request: NextRequest) {
  const id =
    request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      {
        error: "id query parameter is required",
      },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();

    const existing =
      await prisma.httpLabItem.findUnique({
        where: { id },
      });

    if (!existing) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    const item =
      await prisma.httpLabItem.update({
        where: { id },

        data: {
          ...(body.name !== undefined && {
            name: body.name,
          }),

          ...(body.description !== undefined && {
            description: body.description,
          }),
        },
      });

    return NextResponse.json({
      method: "PATCH",
      action: "PARTIAL_UPDATE",
      data: item,

      trace: [
        {
          step: "database_update",
          type: "REAL",
          tool: "Prisma",
          operation: "HttpLabItem.update",
          strategy: "partial",
        },
      ],
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}

// DELETE
export async function DELETE(request: NextRequest) {
  const id =
    request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      {
        error: "id query parameter is required",
      },
      { status: 400 }
    );
  }

  const existing =
    await prisma.httpLabItem.findUnique({
      where: { id },
    });

  if (!existing) {
    return NextResponse.json(
      { error: "Item not found" },
      { status: 404 }
    );
  }

  await prisma.httpLabItem.delete({
    where: { id },
  });

  return NextResponse.json({
    method: "DELETE",
    action: "DELETE",
    deletedId: id,

    trace: [
      {
        step: "database_delete",
        type: "REAL",
        tool: "Prisma",
        operation: "HttpLabItem.delete",
      },
    ],
  });
}