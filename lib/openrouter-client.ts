import { ChatMessage } from "@/types";

const BASE_URL = "https://openrouter.ai/api/v1";

// ── Environment detection ─────────────────────────────────────────────────────

export function isCapacitorApp(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window as unknown as Record<string, unknown>)["Capacitor"];
}

export function getPlatform(): "android" | "ios" | "web" {
  if (typeof window === "undefined") return "web";
  const cap = (
    window as unknown as Record<
      string,
      {
        getPlatform?: () => string;
      }
    >
  )["Capacitor"];
  const platform = cap?.getPlatform?.() ?? "web";
  if (platform === "android") return "android";
  if (platform === "ios") return "ios";
  return "web";
}

// ── Build standard headers ────────────────────────────────────────────────────

function buildHeaders(apiKey: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
    "HTTP-Referer": "https://openrouterchat.app",
    "X-Title": "OpenRouter Chat",
  };
}

// ── Stream options ────────────────────────────────────────────────────────────

export interface StreamOptions {
  model: string;
  messages: ChatMessage[];
  apiKey: string;
  signal?: AbortSignal;
  onChunk: (chunk: string) => void;
  onComplete: (full: string) => void;
  onError: (err: Error, availableProviders?: string[]) => void;
}

// ── Parse error from OpenRouter response body ─────────────────────────────────

function parseError(text: string): { message: string; providers: string[] } {
  try {
    const j = JSON.parse(text);
    return {
      message: j?.error?.message ?? j?.message ?? text,
      providers: j?.error?.metadata?.available_providers ?? [],
    };
  } catch {
    return { message: text, providers: [] };
  }
}

// ── SSE stream parser ─────────────────────────────────────────────────────────

async function consumeStream(
  body: ReadableStream<Uint8Array>,
  onChunk: (c: string) => void,
  onComplete: (full: string) => void,
  onError: (err: Error, providers?: string[]) => void,
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let full = "";
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const t = line.trim();
        if (!t || t === ":") continue;
        if (!t.startsWith("data:")) continue;

        const payload = t.replace(/^data:\s*/, "");
        if (payload === "[DONE]") {
          onComplete(full);
          return;
        }

        try {
          const parsed = JSON.parse(payload);

          // In-stream error
          if (parsed?.error) {
            const msg =
              typeof parsed.error === "string"
                ? parsed.error
                : (parsed.error?.message ?? JSON.stringify(parsed.error));
            onError(new Error(msg), []);
            return;
          }

          const delta = parsed?.choices?.[0]?.delta?.content;
          if (typeof delta === "string" && delta.length > 0) {
            full += delta;
            onChunk(delta);
          }
        } catch {
          // Skip malformed SSE chunks
        }
      }
    }
    onComplete(full);
  } catch (err) {
    onError(err as Error, []);
  }
}

// ── Simulate streaming from a full response (for Android fallback) ────────────

async function simulateStream(
  content: string,
  onChunk: (c: string) => void,
  onComplete: (full: string) => void,
): Promise<void> {
  // Split into small chunks to simulate typewriter effect
  const chunkSize = 4; // characters per chunk
  let i = 0;

  while (i < content.length) {
    const chunk = content.slice(i, i + chunkSize);
    onChunk(chunk);
    i += chunkSize;
    // Yield to browser between chunks
    await new Promise<void>((r) => setTimeout(r, 8));
  }

  onComplete(content);
}

// ── Android: non-streaming fetch (avoids SSE issues in WebView) ───────────────

async function fetchAndroid(opts: StreamOptions): Promise<void> {
  const { model, messages, apiKey, onChunk, onComplete, onError } = opts;

  console.log("[fetchAndroid] non-streaming fetch for model:", model);

  try {
    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: buildHeaders(apiKey),
      body: JSON.stringify({
        model,
        messages,
        stream: false, // Non-streaming on Android
        max_tokens: 4096,
        temperature: 0.7,
      }),
      // No signal on Android — some WebViews abort incorrectly
    });

    const text = await res.text();

    if (!res.ok) {
      const { message, providers } = parseError(text);
      console.error("[fetchAndroid] Error:", res.status, message);
      onError(new Error(message), providers);
      return;
    }

    try {
      const json = JSON.parse(text);
      const content = json?.choices?.[0]?.message?.content ?? "";

      if (!content) {
        onError(new Error("Empty response from model"), []);
        return;
      }

      // Simulate streaming so UI shows typewriter effect
      await simulateStream(content, onChunk, onComplete);
    } catch {
      onError(new Error("Failed to parse model response"), []);
    }
  } catch (err) {
    const msg = (err as Error).message ?? "Network error";
    console.error("[fetchAndroid] Fetch failed:", msg);
    onError(
      new Error(
        msg.includes("Failed to fetch") || msg.includes("NetworkError")
          ? "Network error — check your internet connection."
          : msg,
      ),
      [],
    );
  }
}

// ── iOS / Web: standard SSE streaming ────────────────────────────────────────

async function fetchStreaming(opts: StreamOptions): Promise<void> {
  const { model, messages, apiKey, signal, onChunk, onComplete, onError } =
    opts;

  console.log("[fetchStreaming] model:", model);

  try {
    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: buildHeaders(apiKey),
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        max_tokens: 4096,
        temperature: 0.7,
      }),
      signal,
    });

    if (!res.ok) {
      const text = await res.text();
      const { message, providers } = parseError(text);
      console.error("[fetchStreaming] Error:", res.status, message);
      onError(new Error(message), providers);
      return;
    }

    if (!res.body) {
      onError(new Error("No response body from server"));
      return;
    }

    await consumeStream(res.body, onChunk, onComplete, onError);
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      onComplete("");
      return;
    }
    const msg = (err as Error).message ?? "Unknown error";
    console.error("[fetchStreaming] Error:", msg);
    onError(new Error(msg), []);
  }
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function streamChatDirect(opts: StreamOptions): Promise<void> {
  const platform = getPlatform();
  console.log("[streamChatDirect] platform:", platform, "model:", opts.model);

  if (platform === "android") {
    // Android WebView has unreliable SSE — use non-streaming + simulate
    return fetchAndroid(opts);
  }

  // iOS and web — use real SSE streaming
  return fetchStreaming(opts);
}
