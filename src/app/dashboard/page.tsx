"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Copy, Check, Settings, Bot, LogOut, Lock } from "lucide-react";

interface BotConfig {
    id: string;
    name: string;
    siteId: string;
    workflowId: string;
    apiKey?: string;
    color: string;
    title: string;
    position: "bottom-right" | "bottom-left";
}

export default function DashboardPage() {
    const [apiKey, setApiKey] = useState("");
    const [hasApiKey, setHasApiKey] = useState(false);
    const [bots, setBots] = useState<BotConfig[]>([]);
    const [showApiKeyInput, setShowApiKeyInput] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Auth state
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [requiresAuth, setRequiresAuth] = useState(false);
    const [password, setPassword] = useState("");
    const [authPassword, setAuthPassword] = useState<string | null>(null);
    const [authError, setAuthError] = useState("");

    // New bot form
    const [newBot, setNewBot] = useState({
        name: "",
        siteId: "",
        workflowId: "",
        apiKey: "",
        color: "#3b82f6",
        title: "Chat with us",
        position: "bottom-right" as "bottom-right" | "bottom-left",
    });

    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
        try {
            // Check if auth is required
            const authRes = await fetch("/api/auth/verify");
            const authData = await authRes.json();
            setRequiresAuth(authData.requiresAuth);

            if (!authData.requiresAuth) {
                setIsAuthenticated(true);
                loadConfig();
                return;
            }

            // Check saved password
            const savedPassword = localStorage.getItem("dashboard_password");
            if (savedPassword) {
                const verifyRes = await fetch("/api/auth/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ password: savedPassword }),
                });

                if (verifyRes.ok) {
                    setAuthPassword(savedPassword);
                    setIsAuthenticated(true);
                    loadConfig(savedPassword);
                    return;
                } else {
                    localStorage.removeItem("dashboard_password");
                }
            }

            setIsLoading(false);
        } catch (error) {
            console.error("Auth check error:", error);
            setIsLoading(false);
        }
    }

    async function handleLogin() {
        try {
            setAuthError("");
            const res = await fetch("/api/auth/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            if (res.ok) {
                localStorage.setItem("dashboard_password", password);
                setAuthPassword(password);
                setIsAuthenticated(true);
                loadConfig(password);
            } else {
                setAuthError("Invalid password");
            }
        } catch (error) {
            setAuthError("Authentication failed");
        }
    }

    function handleLogout() {
        localStorage.removeItem("dashboard_password");
        setIsAuthenticated(false);
        setAuthPassword(null);
        setPassword("");
    }

    async function loadConfig(pwd?: string) {
        try {
            setIsLoading(true);
            const headers: Record<string, string> = {};
            if (pwd || authPassword) {
                headers["Authorization"] = `Bearer ${pwd || authPassword}`;
            }

            const res = await fetch("/api/config", { headers });
            const data = await res.json();
            setHasApiKey(data.hasApiKey);
            setBots(data.bots || []);
        } catch (error) {
            console.error("Error loading config:", error);
        } finally {
            setIsLoading(false);
        }
    }

    async function saveApiKey() {
        try {
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
            };
            if (authPassword) {
                headers["Authorization"] = `Bearer ${authPassword}`;
            }

            await fetch("/api/config", {
                method: "POST",
                headers,
                body: JSON.stringify({ apiKey }),
            });
            setHasApiKey(true);
            setShowApiKeyInput(false);
            setApiKey("");
            alert("API Key saved successfully!");
        } catch (error) {
            console.error("Error saving API key:", error);
            alert("Failed to save API key");
        }
    }

    async function addBot() {
        if (!newBot.name || !newBot.siteId || !newBot.workflowId) {
            alert("Please fill all required fields");
            return;
        }

        const bot: BotConfig = {
            id: Date.now().toString(),
            ...newBot,
        };

        const updatedBots = [...bots, bot];
        setBots(updatedBots);

        try {
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
            };
            if (authPassword) {
                headers["Authorization"] = `Bearer ${authPassword}`;
            }

            await fetch("/api/config", {
                method: "POST",
                headers,
                body: JSON.stringify({ bots: updatedBots }),
            });

            // Reset form
            setNewBot({
                name: "",
                siteId: "",
                workflowId: "",
                apiKey: "",
                color: "#3b82f6",
                title: "Chat with us",
                position: "bottom-right",
            });
        } catch (error) {
            console.error("Error adding bot:", error);
            alert("Failed to add bot");
        }
    }

    async function deleteBot(id: string) {
        if (!confirm("Are you sure you want to delete this bot?")) return;

        const updatedBots = bots.filter((b) => b.id !== id);
        setBots(updatedBots);

        try {
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
            };
            if (authPassword) {
                headers["Authorization"] = `Bearer ${authPassword}`;
            }

            await fetch("/api/config", {
                method: "POST",
                headers,
                body: JSON.stringify({ bots: updatedBots }),
            });
        } catch (error) {
            console.error("Error deleting bot:", error);
            alert("Failed to delete bot");
        }
    }

    function getEmbedCode(bot: BotConfig) {
        // Use NEXT_PUBLIC_SITE_URL or production URL, fallback to current origin
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
            (typeof window !== "undefined" ? window.location.origin : "");
        return `<script 
    src="${baseUrl}/embed.js"
    data-site="${bot.siteId}"
    data-color="${bot.color}"
    data-title="${bot.title}"
    data-position="${bot.position}"
></script>`;
    }

    function copyEmbedCode(bot: BotConfig) {
        navigator.clipboard.writeText(getEmbedCode(bot));
        setCopiedId(bot.id);
        setTimeout(() => setCopiedId(null), 2000);
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    // Login form
    if (requiresAuth && !isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center p-4">
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 w-full max-w-md">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <Lock className="h-8 w-8 text-blue-400" />
                        <h1 className="text-2xl font-bold text-white">Dashboard Login</h1>
                    </div>

                    <div className="space-y-4">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                            placeholder="Enter password"
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />

                        {authError && (
                            <p className="text-red-400 text-sm">{authError}</p>
                        )}

                        <button
                            onClick={handleLogin}
                            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-white transition-colors"
                        >
                            Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            ChatKit Dashboard
                        </h1>
                        <p className="text-zinc-400">Manage your AI chat bots</p>
                    </div>
                    {requiresAuth && (
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-zinc-300"
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </button>
                    )}
                </div>

                {/* API Key Section */}
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 mb-8 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Settings className="h-6 w-6 text-blue-400" />
                            <h2 className="text-xl font-semibold">API Configuration</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            {hasApiKey ? (
                                <span className="text-green-400 text-sm">✓ API Key Configured</span>
                            ) : (
                                <span className="text-red-400 text-sm">⚠ No API Key</span>
                            )}
                        </div>
                    </div>

                    {!hasApiKey || showApiKeyInput ? (
                        <div className="space-y-4">
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="sk-proj-..."
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={saveApiKey}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                                >
                                    Save API Key
                                </button>
                                {hasApiKey && (
                                    <button
                                        onClick={() => {
                                            setShowApiKeyInput(false);
                                            setApiKey("");
                                        }}
                                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowApiKeyInput(true)}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors"
                        >
                            Update API Key
                        </button>
                    )}
                </div>

                {/* Add New Bot */}
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 mb-8 border border-white/10">
                    <div className="flex items-center gap-3 mb-6">
                        <Plus className="h-6 w-6 text-purple-400" />
                        <h2 className="text-xl font-semibold">Add New Bot</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Bot Name *</label>
                            <input
                                type="text"
                                value={newBot.name}
                                onChange={(e) => setNewBot({ ...newBot, name: e.target.value })}
                                placeholder="E-commerce Support Bot"
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Site ID *</label>
                            <input
                                type="text"
                                value={newBot.siteId}
                                onChange={(e) => setNewBot({ ...newBot, siteId: e.target.value })}
                                placeholder="ecommerce"
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Workflow ID *</label>
                            <input
                                type="text"
                                value={newBot.workflowId}
                                onChange={(e) => setNewBot({ ...newBot, workflowId: e.target.value })}
                                placeholder="wf_..."
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">
                                API Key (Optional)
                                <span className="ml-2 text-xs text-zinc-500">Leave empty to use global API key</span>
                            </label>
                            <input
                                type="password"
                                value={newBot.apiKey}
                                onChange={(e) => setNewBot({ ...newBot, apiKey: e.target.value })}
                                placeholder="sk-proj-... (optional)"
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Chat Title</label>
                            <input
                                type="text"
                                value={newBot.title}
                                onChange={(e) => setNewBot({ ...newBot, title: e.target.value })}
                                placeholder="Chat with us"
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Color</label>
                            <input
                                type="color"
                                value={newBot.color}
                                onChange={(e) => setNewBot({ ...newBot, color: e.target.value })}
                                className="w-full h-12 bg-black/20 border border-white/10 rounded-lg cursor-pointer"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Position</label>
                            <select
                                value={newBot.position}
                                onChange={(e) => setNewBot({ ...newBot, position: e.target.value as any })}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                            >
                                <option value="bottom-right">Bottom Right</option>
                                <option value="bottom-left">Bottom Left</option>
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={addBot}
                        className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg font-semibold transition-all"
                    >
                        Add Bot
                    </button>
                </div>

                {/* Bots List */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                        <Bot className="h-6 w-6 text-green-400" />
                        <h2 className="text-xl font-semibold">Your Bots ({bots.length})</h2>
                    </div>

                    {bots.length === 0 ? (
                        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-12 border border-white/10 text-center">
                            <p className="text-zinc-400">No bots yet. Add your first bot above!</p>
                        </div>
                    ) : (
                        bots.map((bot) => (
                            <div
                                key={bot.id}
                                className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-colors"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-1">{bot.name}</h3>
                                        <div className="flex items-center gap-4 text-sm text-zinc-400">
                                            <span>Site ID: <code className="text-purple-400">{bot.siteId}</code></span>
                                            <span>•</span>
                                            <span>Workflow: <code className="text-blue-400">{bot.workflowId.substring(0, 15)}...</code></span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => deleteBot(bot.id)}
                                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="bg-black/30 rounded-lg p-4 mb-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-zinc-400">Embed Code</span>
                                        <button
                                            onClick={() => copyEmbedCode(bot)}
                                            className="flex items-center gap-2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
                                        >
                                            {copiedId === bot.id ? (
                                                <>
                                                    <Check className="h-4 w-4 text-green-400" />
                                                    Copied!
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="h-4 w-4" />
                                                    Copy
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <pre className="text-xs text-zinc-300 overflow-x-auto">
                                        <code>{getEmbedCode(bot)}</code>
                                    </pre>
                                </div>

                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: bot.color }}
                                        />
                                        <span className="text-zinc-400">{bot.color}</span>
                                    </div>
                                    <span className="text-zinc-600">•</span>
                                    <span className="text-zinc-400">{bot.position}</span>
                                    <span className="text-zinc-600">•</span>
                                    <span className="text-zinc-400">"{bot.title}"</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
