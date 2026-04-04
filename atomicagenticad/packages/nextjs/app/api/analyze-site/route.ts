import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export type SiteAnalysis = {
  category: string;
  contentFocus: string;
  language: string;
  estimatedMonthlyTraffic: string;
  audience: string;
  qualityScore: number;
};

export async function POST(request: NextRequest) {
  try {
    return await analyze(request);
  } catch (err) {
    console.error("[analyze-site]", err);
    const message = err instanceof Anthropic.APIError ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function analyze(request: NextRequest) {
  const { url } = await request.json();

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  // Try to fetch the site's content for a more accurate analysis
  let siteContent = "";
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AdFlow-Bot/1.0)" },
      signal: AbortSignal.timeout(5000),
    });
    const html = await res.text();
    siteContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 3000);
  } catch {
    // Proceed with URL-only analysis if fetch fails
  }

  const message = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 512,
    system: `You are an expert web content analyst for an ad marketplace.
Analyze websites to help match them with relevant advertisers.
Always respond with a valid JSON object only — no markdown, no extra text.`,
    messages: [
      {
        role: "user",
        content: `Analyze this publisher website and return a JSON object:

URL: ${url}
${siteContent ? `Page content excerpt:\n${siteContent}` : "(page content unavailable — infer from URL)"}

Return exactly this JSON shape:
{
  "category": "Main Category — Subcategory (e.g. Food & Beverage — Specialty Coffee)",
  "contentFocus": "2-3 sentence description of main topics covered",
  "language": "Primary language (e.g. English)",
  "estimatedMonthlyTraffic": "Traffic estimate (e.g. ~12,000 visitors)",
  "audience": "Audience description (e.g. Coffee enthusiasts, ages 25-45)",
  "qualityScore": 7.5
}`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : null;

  if (!text) {
    return NextResponse.json({ error: "No response from model" }, { status: 500 });
  }

  // Strip markdown code fences in case the model wrapped the JSON
  const json = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  try {
    const analysis: SiteAnalysis = JSON.parse(json);
    return NextResponse.json(analysis);
  } catch {
    console.error("[analyze-site] Failed to parse model response:", text);
    return NextResponse.json({ error: "Failed to parse analysis response" }, { status: 500 });
  }
}
