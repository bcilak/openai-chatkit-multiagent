"use client";

import { useSearchParams } from "next/navigation";
// @ts-ignore
import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { Suspense } from "react";

function ChatContent() {
    const searchParams = useSearchParams();
    const workflowId = searchParams.get("workflow");
    const siteId = searchParams.get("site");

    const { control } = useChatKit({
        api: {
            async getClientSecret(existing) {
                // Fetch token from our secure backend
                const response = await fetch("/api/token", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ workflowId, siteId }),
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || "Failed to authenticate");
                }

                const data = await response.json();
                return data.client_secret;
            },
        },
    });

    if (!workflowId && !siteId) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Configuration Error</h1>
                    <p className="text-zinc-400">Missing workflow ID or Site ID.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full flex-col bg-zinc-950">
            {/* @ts-ignore */}
            <ChatKit
                control={control}
                className="h-full w-full"
            />
        </div>
    );
}

export default function ChatPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">Loading...</div>}>
            <ChatContent />
        </Suspense>
    );
}
