"use client";

import { useEffect } from "react";
import { useChatStore } from "@/store/chatStore";
import { useUIStore } from "@/store/uiStore";
import { useSettingsStore } from "@/store/settingsStore";

export function useKeyboardShortcuts() {
  const chatStore = useChatStore();
  const uiStore = useUIStore();
  const settingsStore = useSettingsStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Cmd/Ctrl + K — New Chat
      if (cmdOrCtrl && e.key === "k") {
        e.preventDefault();
        chatStore.createConversation(settingsStore.selectedModel);
      }

      // Cmd/Ctrl + B — Toggle Sidebar
      if (cmdOrCtrl && e.key === "b") {
        e.preventDefault();
        uiStore.toggleSidebar();
      }

      // Cmd/Ctrl + , — Open Settings
      if (cmdOrCtrl && e.key === ",") {
        e.preventDefault();
        uiStore.openModal("settings");
      }

      // Escape — Close modal or stop generation
      if (e.key === "Escape") {
        if (uiStore.activeModal) {
          uiStore.closeModal();
        } else if (uiStore.isGenerating) {
          uiStore.stopGeneration();
        }
      }

      // Cmd/Ctrl + Shift + D — Toggle Dark Mode
      if (cmdOrCtrl && e.shiftKey && e.key === "D") {
        e.preventDefault();
        const current = settingsStore.theme;
        settingsStore.setTheme(current === "dark" ? "light" : "dark");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [chatStore, uiStore, settingsStore]);
}
