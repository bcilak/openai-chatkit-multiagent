import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const configPath = path.join(process.cwd(), "data", "config.json");

// Ensure data directory exists
function ensureDataDir() {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, JSON.stringify({ apiKey: "", bots: [] }, null, 2));
    }
}

export async function GET() {
    try {
        ensureDataDir();
        const data = fs.readFileSync(configPath, "utf-8");
        const config = JSON.parse(data);

        // Don't expose full API key, just show if it exists
        return NextResponse.json({
            hasApiKey: !!config.apiKey,
            apiKeyPreview: config.apiKey ? `${config.apiKey.substring(0, 10)}...` : "",
            bots: config.bots || [],
        });
    } catch (error: any) {
        console.error("Error reading config:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        ensureDataDir();
        const body = await request.json();

        // Read current config
        const data = fs.readFileSync(configPath, "utf-8");
        const config = JSON.parse(data);

        // Update config
        if (body.apiKey !== undefined) {
            config.apiKey = body.apiKey;
        }
        if (body.bots !== undefined) {
            config.bots = body.bots;
        }

        // Write back
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error updating config:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
