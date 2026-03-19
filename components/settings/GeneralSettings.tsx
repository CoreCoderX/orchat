"use client";

import { useSettingsStore } from "@/store/settingsStore";
import Toggle from "@/components/ui/Toggle";
import { cn } from "@/lib/utils";

export default function GeneralSettings() {
  const {
    theme,
    setTheme,
    systemPrompt,
    setSystemPrompt,
    streamingEnabled,
    toggleStreaming,
    sendOnEnter,
    toggleSendOnEnter,
    showTimestamps,
    toggleTimestamps,
  } = useSettingsStore();

  return (
    <div className="space-y-6">
      {/* ── Appearance ─────────────────────────────────────── */}
      <section>
        <h3 className="text-sm font-medium text-ink dark:text-neutral-100 mb-3">
          Appearance
        </h3>
        <div className="flex gap-2">
          {(["light", "dark", "system"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={cn(
                "flex-1 py-2 rounded-xl text-xs font-medium capitalize border transition-colors",
                theme === t
                  ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-transparent"
                  : "border-neutral-200 dark:border-dark-border text-ink-secondary dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-dark-tertiary",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      {/* ── Global System Prompt ────────────────────────────── */}
      <section>
        <h3 className="text-sm font-medium text-ink dark:text-neutral-100 mb-1">
          Global System Prompt
        </h3>
        <p className="text-xs text-ink-tertiary dark:text-neutral-500 mb-2">
          Applied to all new conversations (can be overridden per chat)
        </p>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          placeholder="You are a helpful assistant..."
          rows={4}
          className={cn(
            "w-full px-3 py-2.5 text-sm rounded-xl resize-none",
            "border border-neutral-200 dark:border-dark-border",
            "bg-neutral-50 dark:bg-dark-tertiary",
            "text-ink dark:text-neutral-100",
            "placeholder:text-ink-muted dark:placeholder:text-neutral-600",
            "outline-none focus:border-neutral-300 dark:focus:border-neutral-700",
            "transition-colors",
          )}
        />
      </section>

      {/* ── Chat Behavior ───────────────────────────────────── */}
      <section>
        <h3 className="text-sm font-medium text-ink dark:text-neutral-100 mb-3">
          Chat Behavior
        </h3>
        <div className="space-y-3">
          <Toggle
            checked={streamingEnabled}
            onChange={toggleStreaming}
            label="Streaming responses"
            description="Show AI responses token by token as they arrive"
          />
          <Toggle
            checked={sendOnEnter}
            onChange={toggleSendOnEnter}
            label="Send on Enter"
            description="Press Enter to send · Shift+Enter for new line"
          />
          <Toggle
            checked={showTimestamps}
            onChange={toggleTimestamps}
            label="Show timestamps"
            description="Display time and model name under each message"
          />
        </div>
      </section>
    </div>
  );
}
