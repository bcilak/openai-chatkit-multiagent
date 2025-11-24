"use client";

import { useRouter } from "next/navigation";
// @ts-ignore
import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { ArrowLeft } from "lucide-react";

export default function ChatPage() {
    const router = useRouter();

    const { control } = useChatKit({
        api: {
            async getClientSecret(existing) {
                const apiKey = localStorage.getItem("openai_api_key");
                const workflowId = localStorage.getItem("openai_workflow_id");

                if (!apiKey || !workflowId) {
                    router.push("/");
                    throw new Error("Missing credentials");
                }

                const response = await fetch("/api/token", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ apiKey, workflowId }),
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

    return (
        <div className="flex h-screen flex-col bg-zinc-950">
            <header className="flex h-14 items-center justify-between border-b border-white/5 bg-white/5 px-4 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push("/")}
                        className="rounded-lg p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <span className="font-medium text-white">Agent Workflow</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    <span className="text-xs text-zinc-400">Connected</span>
                </div>
            </header>

            <main className="flex-1 overflow-hidden relative">
                <div className="h-full w-full [&_.chatkit-container]:h-full [&_.chatkit-container]:bg-transparent">
                    {/* @ts-ignore */}
                    <ChatKit control={control} className="h-full w-full" />
                </div>
            </main>
        </div>
    );
}
