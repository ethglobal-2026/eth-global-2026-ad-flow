import { NextResponse } from "next/server";
import { getAdvertiserById } from "~~/services/database/repositories/advertisers";
import { loadNextAppEnvLocalFallback } from "~~/utils/server/loadNextAppEnvLocalFallback";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    loadNextAppEnvLocalFallback();
    const { id } = await context.params;
    const advertiser = await getAdvertiserById(id);

    if (!advertiser) {
      return NextResponse.json({ error: "Advertiser not found" }, { status: 404 });
    }

    return NextResponse.json(advertiser);
  } catch (err) {
    console.error("[advertisers/id]", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
