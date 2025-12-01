import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { password } = await request.json();
        const dashboardPassword = process.env.DASHBOARD_PASSWORD;

        // If no password is set in env, allow access (for development)
        if (!dashboardPassword) {
            return NextResponse.json({ success: true, message: "No password required" });
        }

        if (password === dashboardPassword) {
            return NextResponse.json({ success: true });
        }

        return NextResponse.json(
            { error: "Invalid password" },
            { status: 401 }
        );
    } catch (error) {
        console.error("Auth verification error:", error);
        return NextResponse.json(
            { error: "Authentication failed" },
            { status: 500 }
        );
    }
}

export async function GET() {
    const dashboardPassword = process.env.DASHBOARD_PASSWORD;
    return NextResponse.json({
        requiresAuth: !!dashboardPassword
    });
}
