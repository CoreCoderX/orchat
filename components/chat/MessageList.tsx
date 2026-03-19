"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { Message } from "@/types";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import WelcomeScreen from "./WelcomeScreen";
import { useChat } from "@/hooks/useChat";
import { cn } from "@/lib/utils";

interface MessageListProps {
  messages: Message[];
  isGenerating: boolean;
}

export default function MessageList({
  messages,
  isGenerating,
}: MessageListProps) {
  const { regenerateLastMessage } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);
  const [showBtn, setShowBtn] = useState(false);

  const isNearBottom = () => {
    const el = scrollRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight <= 120;
  };

  const scrollToBottom = (instant = false) => {
    const el = scrollRef.current;
    if (!el) return;
    if (instant) {
      el.scrollTop = el.scrollHeight;
    } else {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  };

  // Only scroll when user sends a new message
  useEffect(() => {
    const count = messages.length;
    if (count > prevCountRef.current) {
      const last = messages[count - 1];
      if (last?.role === "user") {
        scrollToBottom(true);
      }
    }
    prevCountRef.current = count;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  // Show/hide scroll button
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => setShowBtn(!isNearBottom());
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initial scroll
  useEffect(() => {
    scrollToBottom(true);
  }, []); // eslint-disable-line

  if (messages.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <WelcomeScreen />
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      <div
        ref={scrollRef}
        className="h-full w-full"
        style={
          {
            overflowY: "scroll", // Always show scroll track
            overflowX: "hidden",
            overflowAnchor: "none",
            WebkitOverflowScrolling: "touch", // Momentum scroll on iOS
            overscrollBehavior: "contain",
            // Critical: pointer-events must be auto so touch works
            pointerEvents: "auto",
            // Critical: touch-action allows native scroll
            touchAction: "pan-y",
          } as React.CSSProperties
        }
      >
        <div className="min-h-full flex flex-col justify-end">
          <div className="w-full py-4">
            {messages.map((message, index) => {
              const isLast = index === messages.length - 1;
              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isLast={isLast}
                  onRegenerate={
                    isLast && message.role === "assistant"
                      ? regenerateLastMessage
                      : undefined
                  }
                  isGenerating={isGenerating}
                />
              );
            })}

            {isGenerating && messages[messages.length - 1]?.role === "user" && (
              <TypingIndicator />
            )}

            <div className="h-4" aria-hidden />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showBtn && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            onClick={() => scrollToBottom(false)}
            className={cn(
              "absolute bottom-4 left-1/2 -translate-x-1/2 z-10",
              "flex items-center gap-1.5 px-3 py-2 rounded-full",
              "bg-neutral-900 dark:bg-neutral-100",
              "text-white dark:text-neutral-900",
              "text-xs font-medium shadow-lg",
              "border border-neutral-700 dark:border-neutral-300",
              "active:scale-95 transition-transform",
            )}
          >
            <ArrowDown className="size-3" />
            Latest
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
