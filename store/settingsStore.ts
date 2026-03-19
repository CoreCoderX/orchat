import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ApiKey, AppSettings } from "@/types";
import { v4 as uuidv4 } from "uuid";

const DEFAULT_SETTINGS: AppSettings = {
  apiKeys: [],
  activeKeyId: null,
  // Google Gemini Flash — available on google-ai-studio which you have access to
  selectedModel: "google/gemini-2.0-flash-001",
  theme: "system",
  systemPrompt: "",
  codeMode: false,
  streamingEnabled: true,
  sidebarCollapsed: false,
  sendOnEnter: true,
  showTimestamps: false,
};

interface SettingsStore extends AppSettings {
  addApiKey: (key: string, label: string) => void;
  removeApiKey: (id: string) => void;
  setActiveKey: (id: string) => void;
  updateKeyStatus: (id: string, status: ApiKey["status"]) => void;
  getActiveApiKey: () => string | null;
  getNextFallbackKey: (failedKeyId: string) => ApiKey | null;
  setSelectedModel: (model: string) => void;
  setTheme: (theme: AppSettings["theme"]) => void;
  setSystemPrompt: (prompt: string) => void;
  toggleCodeMode: () => void;
  toggleStreaming: () => void;
  toggleSendOnEnter: () => void;
  toggleTimestamps: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,

      addApiKey: (key: string, label: string) => {
        const newKey: ApiKey = {
          id: uuidv4(),
          key,
          label: label || `Key ${get().apiKeys.length + 1}`,
          isActive: get().apiKeys.length === 0,
          addedAt: Date.now(),
          status: "unknown",
        };
        set((state) => ({
          apiKeys: [...state.apiKeys, newKey],
          activeKeyId:
            state.apiKeys.length === 0 ? newKey.id : state.activeKeyId,
        }));
      },

      removeApiKey: (id: string) => {
        set((state) => {
          const filtered = state.apiKeys.filter((k) => k.id !== id);
          const newActiveId =
            state.activeKeyId === id
              ? (filtered[0]?.id ?? null)
              : state.activeKeyId;
          return { apiKeys: filtered, activeKeyId: newActiveId };
        });
      },

      setActiveKey: (id: string) => {
        set((state) => ({
          activeKeyId: id,
          apiKeys: state.apiKeys.map((k) => ({
            ...k,
            isActive: k.id === id,
            lastUsed: k.id === id ? Date.now() : k.lastUsed,
          })),
        }));
      },

      updateKeyStatus: (id: string, status: ApiKey["status"]) => {
        set((state) => ({
          apiKeys: state.apiKeys.map((k) =>
            k.id === id ? { ...k, status } : k,
          ),
        }));
      },

      getActiveApiKey: () => {
        const { apiKeys, activeKeyId } = get();
        return apiKeys.find((k) => k.id === activeKeyId)?.key ?? null;
      },

      getNextFallbackKey: (failedKeyId: string) => {
        const { apiKeys } = get();
        return (
          apiKeys.find((k) => k.id !== failedKeyId && k.status !== "invalid") ??
          null
        );
      },

      setSelectedModel: (model) => set({ selectedModel: model }),
      setTheme: (theme) => set({ theme }),
      setSystemPrompt: (prompt) => set({ systemPrompt: prompt }),
      toggleCodeMode: () => set((s) => ({ codeMode: !s.codeMode })),
      toggleStreaming: () =>
        set((s) => ({ streamingEnabled: !s.streamingEnabled })),
      toggleSendOnEnter: () => set((s) => ({ sendOnEnter: !s.sendOnEnter })),
      toggleTimestamps: () =>
        set((s) => ({ showTimestamps: !s.showTimestamps })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      resetSettings: () => set({ ...DEFAULT_SETTINGS }),
    }),
    {
      name: "openrouter-settings",
      partialize: (state) => ({
        apiKeys: state.apiKeys,
        activeKeyId: state.activeKeyId,
        selectedModel: state.selectedModel,
        theme: state.theme,
        systemPrompt: state.systemPrompt,
        codeMode: state.codeMode,
        streamingEnabled: state.streamingEnabled,
        sidebarCollapsed: state.sidebarCollapsed,
        sendOnEnter: state.sendOnEnter,
        showTimestamps: state.showTimestamps,
      }),
      // Auto-fix stale/broken model IDs from old sessions
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const brokenModels = new Set([
          "meta-llama/llama-3.1-8b-instruct:free",
          "minimax-m2.5:free",
          "openai/gpt-4o-mini",
          "openai/gpt-4o",
          "openai/gpt-4-turbo",
          "openrouter/free",
        ]);
        if (brokenModels.has(state.selectedModel)) {
          state.selectedModel = "google/gemini-2.0-flash-001";
        }
      },
    },
  ),
);
