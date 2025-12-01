import { NextResponse } from "next/server";
import { getApiKeyForSite, getConfig } from "@/lib/db";

// Simple rate limiting for token endpoint
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 20; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const { workflowId, siteId } = await request.json();

    // Get API key and workflow from database
    const { apiKey, workflowId: botWorkflowId } = await getApiKeyForSite(siteId);
    const finalWorkflowId = workflowId || botWorkflowId;

    if (!apiKey) {
      console.error("No API key found");
      return NextResponse.json(
        { error: "API key not configured. Please add it in the dashboard." },
        { status: 500 }
      );
    }

    if (!finalWorkflowId) {
      return NextResponse.json(
        { error: "No workflow ID found for this site" },
        { status: 400 }
      );
    }

    console.log("Creating session with:", {
      siteId,
      workflowId: finalWorkflowId,
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length,
    });

    const response = await fetch("https://api.openai.com/v1/chatkit/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        workflow: { id: finalWorkflowId },
        user: `user-${Date.now()}`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API Error:", errorData);
      throw new Error(errorData.error?.message || "Failed to create session");
    }

    const session = await response.json();
    console.log("Session created successfully");
    return NextResponse.json({ client_secret: session.client_secret });
  } catch (error: unknown) {
    console.error("Token generation error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate token";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
