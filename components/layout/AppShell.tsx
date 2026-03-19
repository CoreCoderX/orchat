"use client";

import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useTheme } from "@/hooks/useTheme";
import { useUIStore } from "@/store/uiStore";
import { useSettingsStore } from "@/store/settingsStore";
import Sidebar from "@/components/layout/Sidebar";
import ChatArea from "@/components/chat/ChatArea";
import SettingsModal from "@/components/settings/SettingsModal";
import Button from "@/components/ui/Button";
import Tooltip from "@/components/ui/Tooltip";
import { Settings, Sun, Moon, Monitor, PanelLeft } from "lucide-react";

export default function AppShell() {
  useKeyboardShortcuts();

  const { theme, toggleTheme } = useTheme();
  const { openModal, sidebarOpen, toggleSidebar } = useUIStore();
  const { apiKeys } = useSettingsStore();
  const hasApiKey = apiKeys.length > 0;

  const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;

  return (
    // Root: fill viewport, no overflow, no position:fixed (let CSS handle it)
    <div
      className="flex bg-white dark:bg-dark"
      style={{
        width: "100vw",
        height: "100dvh", // dvh respects mobile browser chrome
        overflow: "hidden",
        position: "fixed", // Prevent body scroll on mobile
        top: 0,
        left: 0,
      }}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-100 dark:border-dark-border flex-shrink-0 bg-white dark:bg-dark">
          <div className="flex items-center gap-1">
            {!sidebarOpen && (
              <Button variant="ghost" size="sm" onClick={toggleSidebar}>
                <PanelLeft className="size-4" />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-1">
            {!hasApiKey && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openModal("settings")}
                className="text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 text-xs"
              >
                ⚠ Add API Key
              </Button>
            )}

            <Tooltip content={`Theme: ${theme}`}>
              <Button variant="ghost" size="sm" onClick={toggleTheme}>
                <ThemeIcon className="size-4" />
              </Button>
            </Tooltip>

            <Tooltip content="Settings (⌘,)">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openModal("settings")}
              >
                <Settings className="size-4" />
              </Button>
            </Tooltip>
          </div>
        </div>

        {/* Chat — fills remaining space */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ChatArea />
        </div>
      </div>

      {/* Modal — rendered at root level so it's above everything */}
      <SettingsModal />
    </div>
  );
}
