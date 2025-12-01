import { kv } from "@vercel/kv";

export interface Bot {
    id: string;
    name: string;
    siteId: string;
    workflowId: string;
    apiKey?: string;
    color: string;
    title: string;
    position: "bottom-right" | "bottom-left";
}

export interface Config {
    apiKey: string;
    bots: Bot[];
}

const CONFIG_KEY = "chatkit:config";

// Default config
const defaultConfig: Config = {
    apiKey: "",
    bots: [],
};

// Check if we're in development mode without KV
function isLocalDev(): boolean {
    return !process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN;
}

// In-memory storage for local development
let localConfig: Config = { ...defaultConfig };

export async function getConfig(): Promise<Config> {
    try {
        if (isLocalDev()) {
            console.log("Using local in-memory storage (KV not configured)");
            return localConfig;
        }

        const config = await kv.get<Config>(CONFIG_KEY);
        return config || defaultConfig;
    } catch (error) {
        console.error("Error reading config from KV:", error);
        return defaultConfig;
    }
}

export async function saveConfig(config: Partial<Config>): Promise<boolean> {
    try {
        if (isLocalDev()) {
            console.log("Using local in-memory storage (KV not configured)");
            localConfig = { ...localConfig, ...config };
            if (config.bots !== undefined) {
                localConfig.bots = config.bots;
            }
            return true;
        }

        const currentConfig = await getConfig();
        const newConfig: Config = {
            ...currentConfig,
            ...config,
        };

        await kv.set(CONFIG_KEY, newConfig);
        return true;
    } catch (error) {
        console.error("Error saving config to KV:", error);
        return false;
    }
}

export async function getApiKeyForSite(siteId?: string): Promise<{ apiKey: string | null; workflowId: string | null }> {
    const config = await getConfig();

    // If siteId is provided, try to find the bot
    if (siteId) {
        const bot = config.bots.find((b) => b.siteId === siteId);
        if (bot) {
            return {
                apiKey: bot.apiKey || config.apiKey || process.env.OPENAI_API_KEY || null,
                workflowId: bot.workflowId,
            };
        }
    }

    // Fallback to global API key
    return {
        apiKey: config.apiKey || process.env.OPENAI_API_KEY || null,
        workflowId: null,
    };
}
