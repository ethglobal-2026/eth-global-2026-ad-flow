import { NextResponse } from "next/server";
import { getPublisherById } from "~~/services/database/repositories/publishers";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const publisher = await getPublisherById(id);

    if (!publisher) {
      return NextResponse.json({ error: "Publisher not found" }, { status: 404 });
    }

    return NextResponse.json(publisher);
  } catch (err) {
    console.error("[publishers/id]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
