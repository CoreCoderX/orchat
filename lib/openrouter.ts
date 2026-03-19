import { ChatMessage, OpenRouterModel } from "@/types";
import { enrichModel } from "./models";
import { streamChatDirect, isCapacitorApp } from "./openrouter-client";

export { isCapacitorApp };

const MODELS_CACHE_KEY = "or_models_cache";
const MODELS_CACHE_TTL = 1000 * 60 * 30;

// ── Model fetching ────────────────────────────────────────────────────────────

export async function fetchOpenRouterModels(
  apiKey?: string,
): Promise<OpenRouterModel[]> {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(MODELS_CACHE_KEY);
      if (raw) {
        const { data, timestamp } = JSON.parse(raw) as {
          data: OpenRouterModel[];
          timestamp: number;
        };
        if (Date.now() - timestamp < MODELS_CACHE_TTL) return data;
      }
    } catch {
      /* ignore */
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "HTTP-Referer":
      typeof window !== "undefined"
        ? window.location.origin
        : "https://openrouterchat.app",
    "X-Title": "OpenRouter Chat",
  };
  if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

  const res = await fetch("https://openrouter.ai/api/v1/models", { headers });
  if (!res.ok) throw new Error(`Failed to fetch models: ${res.status}`);

  const json = (await res.json()) as { data: Record<string, unknown>[] };
  const models = json.data.map(enrichModel);

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(
        MODELS_CACHE_KEY,
        JSON.stringify({ data: models, timestamp: Date.now() }),
      );
    } catch {
      /* quota */
    }
  }

  return models;
}

// ── Streaming ─────────────────────────────────────────────────────────────────

export interface StreamingOptions {
  model: string;
  messages: ChatMessage[];
  apiKey: string;
  signal?: AbortSignal;
  providerOrder?: string[];
  onChunk: (chunk: string) => void;
  onComplete: (fullText: string) => void;
  onError: (error: Error, availableProviders?: string[]) => void;
}

export async function streamChat(options: StreamingOptions): Promise<void> {
  const { model, messages, apiKey, signal, onChunk, onComplete, onError } =
    options;

  // Always call OpenRouter directly — no /api/chat proxy needed
  return streamChatDirect({
    model,
    messages,
    apiKey,
    signal,
    onChunk,
    onComplete,
    onError,
  });
}

// ── API key validation ────────────────────────────────────────────────────────

export async function validateApiKey(key: string): Promise<boolean> {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/auth/key", {
      headers: { Authorization: `Bearer ${key}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ── Mask key for display ──────────────────────────────────────────────────────

export function maskApiKey(key: string): string {
  if (key.length <= 8) return "••••••••";
  return `${key.slice(0, 7)}${"•".repeat(8)}${key.slice(-4)}`;
}
