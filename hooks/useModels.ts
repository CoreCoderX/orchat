"use client";

import { useState, useEffect, useCallback } from "react";
import { OpenRouterModel, ModelCategory } from "@/types";
// Both fetchOpenRouterModels and filterModels now live in lib/models
import { fetchOpenRouterModels, filterModels } from "@/lib/models";
import { useSettingsStore } from "@/store/settingsStore";

export { filterModels };

export function useModels() {
  const [allModels, setAllModels] = useState<OpenRouterModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] =
    useState<ModelCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { getActiveApiKey } = useSettingsStore();

  const loadModels = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const apiKey = getActiveApiKey() ?? undefined;
      const models = await fetchOpenRouterModels(apiKey);
      setAllModels(models);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [getActiveApiKey]);

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  const filteredModels = filterModels(allModels, selectedCategory, searchQuery);

  return {
    allModels,
    filteredModels,
    isLoading,
    error,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    refreshModels: loadModels,
  };
}
