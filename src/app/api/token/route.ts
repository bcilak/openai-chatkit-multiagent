import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const configPath = path.join(process.cwd(), "data", "config.json");

export async function POST(request: Request) {
  try {
    const { workflowId, siteId } = await request.json();

    // Read API key from config file
    let apiKey = process.env.OPENAI_API_KEY;
    let finalWorkflowId = workflowId;

    // If not in env, try to read from config.json
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, "utf-8");
      const config = JSON.parse(configData);

      // If siteId is provided, try to find the bot in config
      if (siteId) {
        const bot = config.bots?.find((b: any) => b.siteId === siteId);
        if (bot) {
          // Use bot-specific API key if available, otherwise use global
          apiKey = bot.apiKey || config.apiKey || apiKey;
          finalWorkflowId = bot.workflowId;
        }
      } else if (!apiKey) {
        // No siteId, use global API key
        apiKey = config.apiKey;
      }
    }

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
      usingBotSpecificKey: !!siteId
    });

    const response = await fetch("https://api.openai.com/v1/chatkit/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "OpenAI-Beta": "chatkit_beta=v1",
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
  } catch (error: any) {
    console.error("Token generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate token" },
      { status: 500 }
    );
  }
}
