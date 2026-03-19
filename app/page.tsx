"use client";

import ClientOnly from "@/components/ui/ClientOnly";
import AppShell from "@/components/layout/AppShell";

export default function HomePage() {
  return (
    <ClientOnly
      fallback={
        // Minimal skeleton shown during SSR — no dynamic values
        <div className="flex h-dvh overflow-hidden bg-white dark:bg-dark">
          {/* Sidebar skeleton */}
          <div className="w-[260px] flex-shrink-0 border-r border-neutral-200 dark:border-dark-border bg-neutral-50 dark:bg-dark-secondary" />
          {/* Main area skeleton */}
          <div className="flex-1 bg-white dark:bg-dark" />
        </div>
      }
    >
      <AppShell />
    </ClientOnly>
  );
}
