"use client";

import { Code2, Layout, ChevronDown, X } from "lucide-react";
import { useChatStore } from "@/store/chatStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useUIStore } from "@/store/uiStore";
import Button from "@/components/ui/Button";
import Toggle from "@/components/ui/Toggle";
import Tooltip from "@/components/ui/Tooltip";
import { truncate } from "@/lib/utils";

export default function ChatHeader() {
  const conversation = useChatStore((s) => s.getActiveConversation());
  const setConversationCodeMode = useChatStore(
    (s) => s.setConversationCodeMode,
  );
  const { selectedModel, codeMode, toggleCodeMode } = useSettingsStore();
  const { splitViewEnabled, toggleSplitView, openModal } = useUIStore();

  const model = conversation?.model ?? selectedModel;
  const modelName = model.includes("/") ? model.split("/").pop()! : model;
  const isCodeMode = conversation?.isCodeMode ?? codeMode;

  const handleCodeModeToggle = (checked: boolean) => {
    if (conversation) {
      setConversationCodeMode(conversation.id, checked);
    } else {
      toggleCodeMode();
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-100 dark:border-dark-border bg-white dark:bg-dark flex-shrink-0">
      {/* Model selector */}
      <button
        onClick={() => openModal("settings")}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-dark-tertiary transition-colors group max-w-[50%]"
      >
        <div className="size-1.5 rounded-full bg-neutral-400 dark:bg-neutral-500 flex-shrink-0" />
        <span className="text-sm font-medium text-ink dark:text-neutral-100 truncate">
          {truncate(modelName, 28)}
        </span>
        <ChevronDown className="size-3.5 text-ink-tertiary dark:text-neutral-500 flex-shrink-0" />
      </button>

      {/* Right controls */}
      <div className="flex items-center gap-1">
        {/* Code Mode toggle */}
        <Tooltip content="Code Mode — prioritises code responses">
          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-dark-tertiary transition-colors cursor-pointer">
            <Code2 className="size-3.5 text-ink-tertiary dark:text-neutral-500" />
            <span className="text-xs text-ink-secondary dark:text-neutral-400 hidden sm:block select-none">
              Code
            </span>
            <Toggle
              size="sm"
              checked={isCodeMode}
              onChange={handleCodeModeToggle}
            />
          </div>
        </Tooltip>

        {/* Preview toggle */}
        <Tooltip
          content={
            splitViewEnabled ? "Close preview" : "Open live preview panel"
          }
        >
          <Button
            variant={splitViewEnabled ? "default" : "ghost"}
            size="sm"
            onClick={toggleSplitView}
            className={
              splitViewEnabled ? "bg-neutral-100 dark:bg-dark-tertiary" : ""
            }
          >
            <Layout className="size-3.5" />
            <span className="hidden sm:block text-xs">
              {splitViewEnabled ? "Close" : "Preview"}
            </span>
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}
