"use client";

import { useState } from "react";
import { Copy, Check, RefreshCw, ThumbsUp, ThumbsDown } from "lucide-react";
import Button from "@/components/ui/Button";
import Tooltip from "@/components/ui/Tooltip";
import { Message } from "@/types";

interface MessageActionsProps {
  message: Message;
  onRegenerate?: () => void;
  isLast?: boolean;
  isGenerating?: boolean;
}

export default function MessageActions({
  message,
  onRegenerate,
  isLast,
  isGenerating,
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
      {/* Copy */}
      <Tooltip content="Copy message">
        <Button variant="ghost" size="xs" onClick={handleCopy}>
          {copied ? (
            <Check className="size-3.5 text-emerald-500" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </Button>
      </Tooltip>

      {/* Regenerate — only for last assistant message */}
      {message.role === "assistant" && isLast && onRegenerate && (
        <Tooltip content="Regenerate response">
          <Button
            variant="ghost"
            size="xs"
            onClick={onRegenerate}
            disabled={isGenerating}
          >
            <RefreshCw
              className={`size-3.5 ${isGenerating ? "animate-spin" : ""}`}
            />
          </Button>
        </Tooltip>
      )}

      {/* Thumbs feedback — cosmetic only for now */}
      {message.role === "assistant" && (
        <>
          <Tooltip content="Good response">
            <Button variant="ghost" size="xs">
              <ThumbsUp className="size-3.5" />
            </Button>
          </Tooltip>
          <Tooltip content="Bad response">
            <Button variant="ghost" size="xs">
              <ThumbsDown className="size-3.5" />
            </Button>
          </Tooltip>
        </>
      )}
    </div>
  );
}
