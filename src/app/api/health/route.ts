import { NextResponse } from "next/server";
import { getConfig } from "@/lib/db";

export async function GET() {
    try {
        // Test database connection
        const config = getConfig();

        return NextResponse.json({
            status: "ok",
            database: "sqlite",
            encrypted: true,
            hasBots: config.bots.length > 0,
            botCount: config.bots.length,
            hasGlobalApiKey: !!config.apiKey,
            timestamp: new Date().toISOString()
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            {
                status: "error",
                error: message
            },
            { status: 500 }
        );
    }
}
