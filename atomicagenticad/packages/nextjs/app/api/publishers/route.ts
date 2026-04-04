import { NextRequest, NextResponse } from "next/server";
import { createPublisher, getPublisherByWalletAddress, getPublishers } from "~~/services/database/repositories/publishers";

export type PublishersResponse = Awaited<ReturnType<typeof getPublishers>>;

export type CreatePublisherResponse = Awaited<ReturnType<typeof createPublisher>>;

export async function GET() {
  try {
    const publishers = await getPublishers();
    return NextResponse.json(publishers);
  } catch (err) {
    console.error("[publishers]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    return await create(request);
  } catch (err) {
    console.error("[publishers]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function create(request: NextRequest) {
  const body = await request.json();
  const { walletAddress, siteUrl, name, category, qualityScore } = body ?? {};

  if (
    typeof walletAddress !== "string" ||
    typeof siteUrl !== "string" ||
    typeof name !== "string" ||
    typeof category !== "string" ||
    typeof qualityScore !== "number"
  ) {
    return NextResponse.json({ error: "Invalid publisher payload" }, { status: 400 });
  }

  const existingPublisher = await getPublisherByWalletAddress(walletAddress);

  if (existingPublisher) {
    return NextResponse.json({ error: "Publisher already exists for this wallet" }, { status: 409 });
  }

  const publisher = await createPublisher({
    walletAddress,
    siteUrl,
    name,
    category,
    qualityScore,
  });

  return NextResponse.json(publisher, { status: 201 });
}
