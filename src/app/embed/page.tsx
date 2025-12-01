"use client";

import { useSearchParams } from "next/navigation";
import ChatBubble from "@/components/ChatBubble";
import { Suspense, useEffect } from "react";

function EmbedContent() {
    const searchParams = useSearchParams();
    const workflowId = searchParams.get("workflow") || undefined;
    const siteId = searchParams.get("site") || undefined;
    const position = (searchParams.get("position") as "bottom-right" | "bottom-left") || "bottom-right";
    const color = searchParams.get("color") || "#3b82f6";
    const title = searchParams.get("title") || "Chat with us";

    // Make background transparent for embed
    useEffect(() => {
        document.documentElement.classList.add("embed-html");
        document.body.classList.add("embed-body");
        document.documentElement.style.background = "transparent";
        document.body.style.background = "transparent";

        return () => {
            document.documentElement.classList.remove("embed-html");
            document.body.classList.remove("embed-body");
        };
    }, []);

    return (
        <ChatBubble
            workflowId={workflowId}
            siteId={siteId}
            position={position}
            primaryColor={color}
            title={title}
        />
    );
}

export default function EmbedPage() {
    return (
        <Suspense fallback={null}>
            <EmbedContent />
        </Suspense>
    );
}
