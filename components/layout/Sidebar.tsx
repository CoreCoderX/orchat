"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, Settings, PanelLeftClose, Trash2 } from "lucide-react";
import { useChatStore } from "@/store/chatStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useUIStore } from "@/store/uiStore";
import ConversationList from "./ConversationList";
import Button from "@/components/ui/Button";

export default function Sidebar() {
  const {
    conversations,
    activeConversationId,
    createConversation,
    clearAllConversations,
  } = useChatStore();
  const { selectedModel } = useSettingsStore();
  const { sidebarOpen, toggleSidebar, openModal } = useUIStore();

  const handleNewChat = () => {
    createConversation(selectedModel);
    // Auto-close sidebar on mobile after creating chat
    if (window.innerWidth < 1024) toggleSidebar();
  };

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-20 lg:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className={[
              "flex flex-col h-full overflow-hidden",
              "border-r border-neutral-200 dark:border-dark-border",
              "bg-neutral-50 dark:bg-dark-secondary",
              "w-[280px] flex-shrink-0",
              // On mobile: fixed overlay; on desktop: part of layout
              "fixed lg:relative z-30 lg:z-auto",
              "top-0 left-0 bottom-0",
            ].join(" ")}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-3 border-b border-neutral-100 dark:border-dark-border flex-shrink-0">
              <div className="flex items-center gap-2 px-1">
                <div className="size-5 rounded-md bg-neutral-900 dark:bg-neutral-100 flex items-center justify-center">
                  <div className="size-2 rounded-full bg-white dark:bg-neutral-900" />
                </div>
                <span className="text-sm font-semibold text-ink dark:text-neutral-100">
                  OR Chat
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={toggleSidebar}>
                <PanelLeftClose className="size-4" />
              </Button>
            </div>

            {/* New Chat */}
            <div className="px-3 pt-3 pb-2 flex-shrink-0">
              <Button
                variant="outline"
                size="md"
                onClick={handleNewChat}
                className="w-full justify-start gap-2 min-h-[44px]"
              >
                <Plus className="size-4" />
                New Chat
              </Button>
            </div>

            {/* Conversation list — scrollable */}
            <div className="flex-1 min-h-0 sidebar-scroll">
              <ConversationList
                conversations={conversations}
                activeId={activeConversationId}
                onSelect={() => {
                  if (window.innerWidth < 1024) toggleSidebar();
                }}
              />
            </div>

            {/* Footer */}
            <div className="border-t border-neutral-100 dark:border-dark-border p-3 space-y-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start min-h-[44px]"
                onClick={() => {
                  openModal("settings");
                  if (window.innerWidth < 1024) toggleSidebar();
                }}
              >
                <Settings className="size-3.5" />
                Settings
              </Button>

              {conversations.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-ink-tertiary dark:text-neutral-500 min-h-[44px]"
                  onClick={() => {
                    if (confirm("Clear all conversations?")) {
                      clearAllConversations();
                    }
                  }}
                >
                  <Trash2 className="size-3.5" />
                  Clear all
                </Button>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
