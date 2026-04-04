import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { loadNextAppEnvLocalFallback } from "~~/utils/server/loadNextAppEnvLocalFallback";

export type SiteAnalysis = {
  category: string;
  contentFocus: string;
  language: string;
  estimatedMonthlyTraffic: string;
  audience: string;
  qualityScore: number;
};

function getApiKey() {
  return process.env.ANTHROPIC_API_KEY?.trim() ?? "";
}

function getModel() {
  return process.env.ANTHROPIC_MODEL?.trim() || "claude-opus-4-6";
}

function buildMockAnalysis(url: string): SiteAnalysis {
  let hostname = "your site";
  try {
    const normalized = url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
    hostname = new URL(normalized).hostname.replace(/^www\./, "");
  } catch {
    /* keep default */
  }

  return {
    category: "General — Web publisher",
    contentFocus: `Mock analysis for ${hostname}. For real AI summaries, add ANTHROPIC_API_KEY to .env.local and remove ADFLOW_ANALYZE_SITE_MOCK.`,
    language: "English",
    estimatedMonthlyTraffic: "~10,000 visitors (mock estimate)",
    audience: "Visitors to this domain (mock — refine with live Claude)",
    qualityScore: 7,
  };
}

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
  loadNextAppEnvLocalFallback();

  const { url } = await request.json();

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  if (process.env.ADFLOW_ANALYZE_SITE_MOCK === "true") {
    return NextResponse.json(buildMockAnalysis(url));
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "ANTHROPIC_API_KEY is missing. Create packages/nextjs/.env.local from .env.example and paste your key from console.anthropic.com — or set ADFLOW_ANALYZE_SITE_MOCK=true for mock data.",
      },
      { status: 503 },
    );
  }

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
    /* URL-only analysis */
  }

  const client = new Anthropic({ apiKey });
  const model = getModel();

  let message;
  try {
    message = await client.messages.create({
      model,
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
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "Anthropic rejected the API key (invalid or expired). Check ANTHROPIC_API_KEY in .env.local." },
        { status: 401 },
      );
    }
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "Anthropic rate limit — try again in a moment." }, { status: 429 });
    }
    if (err instanceof Anthropic.NotFoundError) {
      return NextResponse.json(
        {
          error: `Model "${model}" is not available for this API key. Set ANTHROPIC_MODEL in .env.local to a model you can access (see docs.anthropic.com — e.g. a current Sonnet ID).`,
        },
        { status: 400 },
      );
    }
    if (err instanceof Anthropic.APIError) {
      const status = typeof err.status === "number" ? err.status : 500;
      return NextResponse.json({ error: err.message }, { status: status >= 400 && status < 600 ? status : 500 });
    }
    throw err;
  }

  const text = message.content[0].type === "text" ? message.content[0].text : null;

  if (!text) {
    return NextResponse.json({ error: "No response from model" }, { status: 500 });
  }

  const json = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  try {
    const analysis: SiteAnalysis = JSON.parse(json);
    return NextResponse.json(analysis);
  } catch {
    console.error("[analyze-site] Failed to parse model response:", text);
    return NextResponse.json({ error: "Failed to parse analysis response" }, { status: 500 });
  }
}
