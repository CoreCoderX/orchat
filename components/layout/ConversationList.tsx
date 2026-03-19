"use client";

import { useMemo } from "react";
import { Conversation } from "@/types";
import ConversationItem from "./ConversationItem";
import { ConversationSkeleton } from "@/components/ui/Skeleton";

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  isLoading?: boolean;
  onSelect?: () => void;
}

function groupByDate(
  conversations: Conversation[],
): Record<string, Conversation[]> {
  const now = Date.now();
  const day = 86_400_000;
  const groups: Record<string, Conversation[]> = {
    Today: [],
    Yesterday: [],
    "Last 7 days": [],
    "Last 30 days": [],
    Older: [],
  };
  for (const conv of conversations) {
    const diff = now - conv.updatedAt;
    if (diff < day) groups["Today"].push(conv);
    else if (diff < 2 * day) groups["Yesterday"].push(conv);
    else if (diff < 7 * day) groups["Last 7 days"].push(conv);
    else if (diff < 30 * day) groups["Last 30 days"].push(conv);
    else groups["Older"].push(conv);
  }
  return groups;
}

export default function ConversationList({
  conversations,
  activeId,
  isLoading,
  onSelect,
}: ConversationListProps) {
  const grouped = useMemo(() => groupByDate(conversations), [conversations]);

  if (isLoading) return <ConversationSkeleton />;

  if (conversations.length === 0) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-xs text-ink-muted dark:text-neutral-600">
          No conversations yet.
          <br />
          Start a new chat!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 px-2 py-2">
      {Object.entries(grouped).map(([group, convs]) => {
        if (convs.length === 0) return null;
        return (
          <div key={group}>
            <p className="px-2 py-1 text-[10px] font-medium text-ink-muted dark:text-neutral-600 uppercase tracking-wider">
              {group}
            </p>
            <div className="space-y-0.5">
              {convs.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  isActive={conv.id === activeId}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
