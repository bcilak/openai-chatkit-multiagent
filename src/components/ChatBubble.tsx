"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X, Minimize2 } from "lucide-react";
import { ChatKit, ChatKitProvider, useChatKit } from "@openai/chatkit-react";

interface ChatBubbleProps {
    workflowId?: string;
    siteId?: string;
    position?: "bottom-right" | "bottom-left";
    primaryColor?: string;
    title?: string;
}

// Inner component that uses the hook (must be inside ChatKitProvider)
function ChatBubbleInner({
    position = "bottom-right",
    primaryColor = "#3b82f6",
    title = "Chat with us",
    isOpen,
    setIsOpen,
    isMinimized,
    setIsMinimized,
}: {
    position?: "bottom-right" | "bottom-left";
    primaryColor?: string;
    title?: string;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    isMinimized: boolean;
    setIsMinimized: (min: boolean) => void;
}) {
    // Notify parent window about open/close state for iframe resizing
    useEffect(() => {
        if (window.parent !== window) {
            window.parent.postMessage(
                { type: isOpen ? "chatkit-open" : "chatkit-close" },
                "*"
            );
        }
    }, [isOpen]);

    const { control } = useChatKit();

    const positionClass = position === "bottom-left" ? "left-0" : "right-0";

    return (
        <div className={`fixed bottom-0 ${positionClass} p-4`}>
            {/* Chat Bubble Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="h-14 w-14 rounded-full shadow-xl hover:scale-110 transition-transform duration-200 flex items-center justify-center"
                    style={{ backgroundColor: primaryColor }}
                    aria-label="Open chat"
                >
                    <MessageCircle className="h-6 w-6 text-white" />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div
                    className="flex flex-col bg-white rounded-2xl shadow-2xl transition-all duration-300 overflow-hidden"
                    style={{
                        width: isMinimized ? "320px" : "370px",
                        height: isMinimized ? "60px" : "600px",
                    }}
                >
                    {/* Header */}
                    <div
                        className="flex items-center justify-between px-4 py-3 text-white flex-shrink-0"
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
                        <div className="flex-1 overflow-hidden" style={{ minHeight: "400px" }}>
                            <ChatKit control={control} style={{ height: "100%", width: "100%" }} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
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

    const apiConfig = {
        async getClientSecret() {
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
    };

    return (
        <ChatKitProvider api={apiConfig}>
            <ChatBubbleInner
                position={position}
                primaryColor={primaryColor}
                title={title}
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                isMinimized={isMinimized}
                setIsMinimized={setIsMinimized}
            />
        </ChatKitProvider>
    );
}
