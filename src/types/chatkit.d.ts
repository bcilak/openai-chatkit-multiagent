declare module "@openai/chatkit-react" {
    import { FC, ReactNode } from "react";

    export interface ChatKitControl {
        // Add control methods as needed
    }

    export interface ChatKitApiConfig {
        getClientSecret: (existing?: string) => Promise<string>;
    }

    export interface UseChatKitOptions {
        api: ChatKitApiConfig;
    }

    export interface ChatKitProps {
        control: ChatKitControl;
        className?: string;
        children?: ReactNode;
    }

    export function useChatKit(options: UseChatKitOptions): {
        control: ChatKitControl;
    };

    export const ChatKit: FC<ChatKitProps>;
}
