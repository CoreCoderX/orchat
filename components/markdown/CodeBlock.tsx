"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Check, Copy, Play, X } from "lucide-react";
import { cn, isPreviewable } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";
import Button from "@/components/ui/Button";

interface CodeBlockProps {
  code: string;
  language: string;
}

export default function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);
  const canPreview = isPreviewable(language);

  const { setPreviewContent, splitViewEnabled, toggleSplitView } = useUIStore();

  // ── Syntax highlighting ─────────────────────────────────────────────────

  useEffect(() => {
    if (!codeRef.current) return;
    import("highlight.js").then((hljs) => {
      if (!codeRef.current) return;
      const lang =
        language && hljs.default.getLanguage(language) ? language : "plaintext";
      const result = hljs.default.highlight(code, {
        language: lang,
        ignoreIllegals: true,
      });
      if (codeRef.current) {
        codeRef.current.innerHTML = result.value;
      }
    });
  }, [code, language]);

  // ── Copy ────────────────────────────────────────────────────────────────

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = code;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  // ── Preview — set content in store, open split view ─────────────────────

  const handlePreview = useCallback(() => {
    // Pass both code and language to the store
    setPreviewContent(code, language);
    // If split view isn't open yet, open it
    if (!splitViewEnabled) {
      toggleSplitView();
    }
  }, [code, language, setPreviewContent, splitViewEnabled, toggleSplitView]);

  return (
    <div className="group relative my-3 rounded-xl overflow-hidden border border-neutral-200 dark:border-dark-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-100 dark:bg-dark-quaternary border-b border-neutral-200 dark:border-dark-border">
        <span className="text-xs font-mono text-ink-tertiary dark:text-neutral-500 select-none">
          {language || "text"}
        </span>

        <div className="flex items-center gap-1">
          {canPreview && (
            <Button
              variant="ghost"
              size="xs"
              onClick={handlePreview}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Play className="size-3" />
              <span>Preview</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="xs"
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Copy code"
          >
            {copied ? (
              <>
                <Check className="size-3 text-emerald-500" />
                <span className="text-emerald-500">Copied</span>
              </>
            ) : (
              <>
                <Copy className="size-3" />
                <span>Copy</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Code */}
      <div className="overflow-x-auto bg-neutral-50 dark:bg-dark-tertiary">
        <pre className="p-4 text-xs leading-relaxed m-0 overflow-x-auto">
          <code
            ref={codeRef}
            className={cn(
              "font-mono hljs block",
              language && `language-${language}`,
            )}
          >
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
}
