"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bot, ArrowRight, Key, Workflow } from "lucide-react";

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const [workflowId, setWorkflowId] = useState("");
  const router = useRouter();

  useEffect(() => {
    const storedApiKey = localStorage.getItem("openai_api_key");
    const storedWorkflowId = localStorage.getItem("openai_workflow_id");
    if (storedApiKey) setApiKey(storedApiKey);
    if (storedWorkflowId) setWorkflowId(storedWorkflowId);
  }, []);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey && workflowId) {
      localStorage.setItem("openai_api_key", apiKey);
      localStorage.setItem("openai_workflow_id", workflowId);
      router.push("/chat");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-4 text-white selection:bg-blue-500/30">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[100px]" />
        <div className="absolute -bottom-1/4 -right-1/4 h-[500px] w-[500px] rounded-full bg-purple-600/20 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20">
            <Bot className="h-8 w-8 text-white" />
          </div>
          <h1 className="bg-gradient-to-br from-white to-zinc-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
            Agent Chat
          </h1>
          <p className="mt-2 text-zinc-400">
            Connect to your OpenAI Agent Workflow
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl">
          <form onSubmit={handleStart} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Key className="w-4 h-4" /> API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-zinc-600 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Workflow className="w-4 h-4" /> Workflow ID
              </label>
              <input
                type="text"
                value={workflowId}
                onChange={(e) => setWorkflowId(e.target.value)}
                placeholder="workflow-..."
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-zinc-600 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                required
              />
            </div>

            <button
              type="submit"
              className="group w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] hover:shadow-blue-500/30 active:scale-[0.98]"
            >
              <span className="flex items-center justify-center gap-2">
                Start Chatting
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-600">
          Your keys are stored locally and sent only to the backend for token generation.
        </p>
      </div>
    </main>
  );
}
