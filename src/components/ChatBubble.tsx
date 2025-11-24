"use client";

import { useState } from "react";
import { MessageCircle, X, Minimize2 } from "lucide-react";
// @ts-ignore
import { ChatKit, useChatKit } from "@openai/chatkit-react";

interface ChatBubbleProps {
    workflowId?: string;
    siteId?: string;
    position?: "bottom-right" | "bottom-left";
    primaryColor?: string;
    title?: string;
}

export default function ChatBubble({
    workflowId,
    siteId,
    position = "bottom-right",
    primaryColor = "#3b82f6",
    title = "Chat with us",
}: ChatBubbleProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

    const { control } = useChatKit({
        api: {
            async getClientSecret(existing) {
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

    const positionClasses = {
        "bottom-right": "bottom-4 right-4",
        "bottom-left": "bottom-4 left-4",
    };

    return (
        <>
            {/* Chat Bubble Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className={`fixed ${positionClasses[position]} z-50 h-14 w-14 rounded-full shadow-lg hover:scale-110 transition-transform duration-200 flex items-center justify-center`}
                    style={{ backgroundColor: primaryColor }}
                    aria-label="Open chat"
                >
                    <MessageCircle className="h-6 w-6 text-white" />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div
                    className={`fixed ${positionClasses[position]} z-50 flex flex-col bg-white rounded-2xl shadow-2xl transition-all duration-300`}
                    style={{
                        width: isMinimized ? "320px" : "380px",
                        height: isMinimized ? "60px" : "600px",
                    }}
                >
                    {/* Header */}
                    <div
                        className="flex items-center justify-between px-4 py-3 rounded-t-2xl text-white"
                        style={{ backgroundColor: primaryColor }}
                    >
                        <h3 className="font-semibold">{title}</h3>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsMinimized(!isMinimized)}
                                className="hover:bg-white/20 p-1 rounded transition-colors"
                                aria-label={isMinimized ? "Maximize" : "Minimize"}
                            >
                                <Minimize2 className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="hover:bg-white/20 p-1 rounded transition-colors"
                                aria-label="Close chat"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Chat Content */}
                    {!isMinimized && (
                        <div className="flex-1 overflow-hidden">
                            {/* @ts-ignore */}
                            <ChatKit control={control} className="h-full w-full" />
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
