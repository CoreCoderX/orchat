import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "…";
}

export function containsCode(content: string): boolean {
  return content.includes("```") || content.includes("`");
}

export function extractCodeBlocks(content: string): Array<{
  language: string;
  code: string;
}> {
  const regex = /```(\w*)\n?([\s\S]*?)```/g;
  const blocks: Array<{ language: string; code: string }> = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    blocks.push({ language: match[1] || "text", code: match[2].trim() });
  }
  return blocks;
}

// Check if a language can be previewed in the iframe
export function isPreviewable(language: string): boolean {
  return ["html", "htm", "css", "javascript", "js", "jsx"].includes(
    language.toLowerCase(),
  );
}

export function buildPreviewHtml(code: string, language: string): string {
  if (language === "html" || language === "htm") return code;
  if (language === "css")
    return `<style>${code}</style><div style="font-family:sans-serif;padding:1rem"><h1>Heading</h1><p>Paragraph</p><button>Button</button></div>`;
  if (language === "javascript" || language === "js")
    return `<script>${code}</script>`;
  return "";
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}
