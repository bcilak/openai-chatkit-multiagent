import { OpenAI } from "openai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { apiKey, workflowId } = await request.json();

    if (!apiKey || !workflowId) {
      return NextResponse.json(
        { error: "Missing API Key or Workflow ID" },
        { status: 400 }
      );
    }

    console.log("Received request with:", {
      apiKeyPresent: !!apiKey,
      workflowId
    });

    const response = await fetch("https://api.openai.com/v1/chatkit/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "OpenAI-Beta": "chatkit_beta=v1",
      },
      body: JSON.stringify({
        workflow: { id: workflowId },
        user: "user-123",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API Error:", errorData);
      throw new Error(errorData.error?.message || "Failed to create session");
    }

    const session = await response.json();
    console.log("OpenAI Session Created:", JSON.stringify(session, null, 2));
    return NextResponse.json({ client_secret: session.client_secret });
  } catch (error: any) {
    console.error("Token generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate token" },
      { status: 500 }
    );
  }
}
