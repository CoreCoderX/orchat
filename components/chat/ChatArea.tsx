"use client";

import { useState, useCallback } from "react";
import { useChatStore } from "@/store/chatStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useUIStore } from "@/store/uiStore";
import { useChat } from "@/hooks/useChat";
import { AttachedFile } from "@/types";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import SplitView from "@/components/preview/SplitView";

export default function ChatArea() {
  const [inputValue, setInputValue] = useState("");

  const { sendMessage, isGenerating, stopGeneration } = useChat();
  const conversation = useChatStore((s) => s.getActiveConversation());
  const activeConvId = useChatStore((s) => s.activeConversationId);
  const selectedModel = useSettingsStore((s) => s.selectedModel);
  const createConversation = useChatStore((s) => s.createConversation);
  const { splitViewEnabled } = useUIStore();

  const messages = conversation?.messages ?? [];

  const handleSend = useCallback(
    async (attachments?: AttachedFile[], webSearch?: boolean) => {
      const content = inputValue.trim();
      if (!content && (!attachments || attachments.length === 0)) return;
      if (isGenerating) return;

      let convId = activeConvId;
      if (!convId) convId = createConversation(selectedModel);

      setInputValue("");
      await sendMessage(
        content || "Please analyze the attached files.",
        convId,
        attachments,
      );
    },
    [
      inputValue,
      isGenerating,
      activeConvId,
      selectedModel,
      createConversation,
      sendMessage,
    ],
  );

  return (
    // Fill 100% of whatever parent gives us — no intrinsic size
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        minHeight: 0,
        minWidth: 0,
      }}
    >
      {/* Model selector bar */}
      <ChatHeader />

      {/* Main body row — chat left, preview right */}
      <div
        style={{
          display: "flex",
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          overflow: "hidden",
          width: "100%",
        }}
      >
        {/* ── Chat column ────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            // When preview is open take 50%, else take 100%
            flex: splitViewEnabled ? "0 0 50%" : "1 1 100%",
            minHeight: 0,
            minWidth: 0,
            overflow: "hidden",
            transition: "flex-basis 0.25s ease",
          }}
        >
          {/* Messages — grows to fill space */}
          <div
            style={{
              flex: 1,
              minHeight: 0,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <MessageList messages={messages} isGenerating={isGenerating} />
          </div>

          {/* Input — fixed height at bottom */}
          <div
            style={{
              flexShrink: 0,
              borderTop: "1px solid",
              borderColor: "var(--input-border, #e5e5e5)",
            }}
            className="bg-white dark:bg-dark border-neutral-100 dark:border-dark-border"
          >
            <div className="w-full px-3 md:px-5 py-3">
              <ChatInput
                value={inputValue}
                onChange={setInputValue}
                onSend={handleSend}
                isGenerating={isGenerating}
                onStop={stopGeneration}
              />
            </div>
          </div>
        </div>

        {/* ── Preview column ──────────────────────────────── */}
        {splitViewEnabled && (
          <div
            style={{
              flex: "0 0 50%",
              minHeight: 0,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              borderLeft: "1px solid",
            }}
            className="border-neutral-200 dark:border-dark-border"
          >
            <SplitView />
          </div>
        )}
      </div>
    </div>
  );
}
