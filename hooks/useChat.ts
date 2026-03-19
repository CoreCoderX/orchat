"use client";

import { useCallback } from "react";
import { useChatStore } from "@/store/chatStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useUIStore } from "@/store/uiStore";
import { streamChatDirect } from "@/lib/openrouter-client";
import { AttachedFile, ChatMessage } from "@/types";

export function useChat() {
  const chatStore = useChatStore();
  const settingsStore = useSettingsStore();
  const uiStore = useUIStore();

  // ── Build message array ───────────────────────────────────────────────────

  const buildMessages = useCallback(
    (
      conversationId: string,
      newUserContent: string,
      attachments?: AttachedFile[],
    ): ChatMessage[] => {
      const conv = chatStore.getConversation(conversationId);
      const result: ChatMessage[] = [];

      const sysPrompt =
        conv?.systemPrompt?.trim() || settingsStore.systemPrompt?.trim();
      if (sysPrompt) result.push({ role: "system", content: sysPrompt });

      if (conv?.isCodeMode ?? settingsStore.codeMode) {
        result.push({
          role: "system",
          content:
            "You are a code-focused assistant. Respond with clean, well-commented code in fenced markdown code blocks.",
        });
      }

      // History
      if (conv) {
        conv.messages
          .filter(
            (m) =>
              !m.isStreaming &&
              !m.isError &&
              m.content.trim() &&
              (m.role === "user" || m.role === "assistant"),
          )
          .slice(-20)
          .forEach((m) => result.push({ role: m.role, content: m.content }));
      }

      // Build the user message with image attachments
      const imageAttachments =
        attachments?.filter((f) => f.type.startsWith("image/")) ?? [];

      if (imageAttachments.length > 0) {
        // Multi-modal message format for vision models
        result.push({
          role: "user",
          content: [
            { type: "text", text: newUserContent || "Analyze these images." },
            ...imageAttachments.map((img) => ({
              type: "image_url",
              image_url: { url: img.content },
            })),
          ] as unknown as string,
        });
      } else {
        const last = result[result.length - 1];
        if (!last || last.role !== "user" || last.content !== newUserContent) {
          result.push({ role: "user", content: newUserContent });
        }
      }

      return result;
    },
    [chatStore, settingsStore],
  );

  // ── Stream runner ─────────────────────────────────────────────────────────

  const runStream = useCallback(
    async (
      convId: string,
      assistantMsgId: string,
      model: string,
      messages: ChatMessage[],
      controller: AbortController,
      keyId: string,
      keyValue: string,
      providerOrder?: string[],
    ) => {
      await streamChatDirect({
        model,
        messages,
        apiKey: keyValue,
        signal: controller.signal,

        onChunk: (chunk) => {
          chatStore.appendToMessage(convId, assistantMsgId, chunk);
        },

        onComplete: (fullText) => {
          const stored =
            chatStore
              .getConversation(convId)
              ?.messages.find((m) => m.id === assistantMsgId)?.content ?? "";
          chatStore.updateMessage(convId, assistantMsgId, {
            content: fullText || stored,
            isStreaming: false,
            isError: false,
          });
          uiStore.setIsGenerating(false);
          uiStore.setAbortController(null);
          settingsStore.updateKeyStatus(keyId, "valid");
        },

        onError: async (err, availableProviders) => {
          console.error(
            "[runStream] Error:",
            err.message,
            "providers:",
            availableProviders,
          );

          // Auto-retry with available providers
          if (
            !providerOrder &&
            availableProviders &&
            availableProviders.length > 0
          ) {
            await runStream(
              convId,
              assistantMsgId,
              model,
              messages,
              controller,
              keyId,
              keyValue,
              availableProviders,
            );
            return;
          }

          // Try fallback key
          const fallback = settingsStore.getNextFallbackKey(keyId);
          if (fallback && !providerOrder) {
            settingsStore.updateKeyStatus(keyId, "invalid");
            settingsStore.setActiveKey(fallback.id);
            await runStream(
              convId,
              assistantMsgId,
              model,
              messages,
              controller,
              fallback.id,
              fallback.key,
            );
            return;
          }

          chatStore.updateMessage(convId, assistantMsgId, {
            content:
              `❌ **${err.message}**\n\n` +
              `**Model:** \`${model}\`\n\n` +
              `Please select a different model or check your API key in **Settings → API Keys**.`,
            isStreaming: false,
            isError: true,
          });
          uiStore.setIsGenerating(false);
          uiStore.setAbortController(null);
        },
      });
    },
    [chatStore, settingsStore, uiStore],
  );

  // ── Send message ──────────────────────────────────────────────────────────

  const sendMessage = useCallback(
    async (
      content: string,
      conversationId?: string,
      attachments?: AttachedFile[],
    ) => {
      const trimmed = content.trim();
      if (!trimmed && (!attachments || attachments.length === 0)) return;

      let convId = conversationId ?? chatStore.activeConversationId;
      if (!convId)
        convId = chatStore.createConversation(settingsStore.selectedModel);

      const conv = chatStore.getConversation(convId);
      const model = conv?.model ?? settingsStore.selectedModel;

      const activeKey = settingsStore.apiKeys.find(
        (k) => k.id === settingsStore.activeKeyId,
      );
      if (!activeKey?.key) {
        chatStore.addMessage(convId, {
          role: "assistant",
          content:
            "⚠️ **No API key configured.**\n\nGo to **Settings → API Keys** and add your [OpenRouter API key](https://openrouter.ai/keys).",
          isError: true,
        });
        return;
      }

      // Add user message
      chatStore.addMessage(convId, {
        role: "user",
        content: trimmed || "Analyze the attached files.",
        attachments,
      });

      const messages = buildMessages(convId, trimmed, attachments);

      const assistantMsgId = chatStore.addMessage(convId, {
        role: "assistant",
        content: "",
        isStreaming: true,
        model,
      });

      const controller = new AbortController();
      uiStore.setAbortController(controller);
      uiStore.setIsGenerating(true);

      await runStream(
        convId,
        assistantMsgId,
        model,
        messages,
        controller,
        activeKey.id,
        activeKey.key,
      );
    },
    [chatStore, settingsStore, uiStore, buildMessages, runStream],
  );

  // ── Regenerate ────────────────────────────────────────────────────────────

  const regenerateLastMessage = useCallback(async () => {
    const convId = chatStore.activeConversationId;
    if (!convId) return;

    const conv = chatStore.getConversation(convId);
    if (!conv || conv.messages.length < 2) return;

    const model = conv.model ?? settingsStore.selectedModel;
    const msgs = conv.messages;

    const lastAsstIdx = [...msgs]
      .reverse()
      .findIndex((m) => m.role === "assistant");
    if (lastAsstIdx === -1) return;

    const lastAsst = msgs[msgs.length - 1 - lastAsstIdx];
    const historyMsgs: ChatMessage[] = [];

    const sysPrompt =
      conv.systemPrompt?.trim() || settingsStore.systemPrompt?.trim();
    if (sysPrompt) historyMsgs.push({ role: "system", content: sysPrompt });

    msgs
      .filter(
        (m) =>
          m.id !== lastAsst.id &&
          !m.isStreaming &&
          !m.isError &&
          m.content.trim() &&
          (m.role === "user" || m.role === "assistant"),
      )
      .slice(-20)
      .forEach((m) => historyMsgs.push({ role: m.role, content: m.content }));

    if (historyMsgs.length === 0) return;

    const activeKey = settingsStore.apiKeys.find(
      (k) => k.id === settingsStore.activeKeyId,
    );
    if (!activeKey?.key) return;

    chatStore.updateMessage(convId, lastAsst.id, {
      content: "",
      isStreaming: true,
      isError: false,
    });

    const controller = new AbortController();
    uiStore.setAbortController(controller);
    uiStore.setIsGenerating(true);

    await runStream(
      convId,
      lastAsst.id,
      model,
      historyMsgs,
      controller,
      activeKey.id,
      activeKey.key,
    );
  }, [chatStore, settingsStore, uiStore, runStream]);

  return {
    sendMessage,
    regenerateLastMessage,
    isGenerating: uiStore.isGenerating,
    stopGeneration: uiStore.stopGeneration,
  };
}
