import { NextResponse } from "next/server";
import { getConfig, saveConfig } from "@/lib/db";

// Simple rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 30; // requests per minute
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

export async function GET(request: Request) {
    try {
        const config = await getConfig();

        // Don't expose full API key, just show if it exists
        return NextResponse.json({
            hasApiKey: !!config.apiKey,
            apiKeyPreview: config.apiKey ? `${config.apiKey.substring(0, 10)}...` : "",
            bots: config.bots.map((bot) => ({
                ...bot,
                apiKey: bot.apiKey ? "***configured***" : "",
            })),
        });
    } catch (error: unknown) {
        console.error("Error reading config:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
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

        // Check auth for dashboard access
        const authHeader = request.headers.get("authorization");
        const dashboardPassword = process.env.DASHBOARD_PASSWORD;

        if (dashboardPassword && authHeader !== `Bearer ${dashboardPassword}`) {
            return NextResponse.json(
                { error: "Unauthorized. Please login first." },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Validate input
        if (body.apiKey !== undefined && typeof body.apiKey !== "string") {
            return NextResponse.json(
                { error: "Invalid API key format" },
                { status: 400 }
            );
        }

        if (body.bots !== undefined && !Array.isArray(body.bots)) {
            return NextResponse.json(
                { error: "Invalid bots format" },
                { status: 400 }
            );
        }

        const updateData: { apiKey?: string; bots?: typeof body.bots } = {};

        if (body.apiKey !== undefined) {
            updateData.apiKey = body.apiKey;
        }
        if (body.bots !== undefined) {
            updateData.bots = body.bots;
        }

        const success = await saveConfig(updateData);

        if (!success) {
            return NextResponse.json(
                { error: "Failed to save configuration" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error("Error updating config:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
