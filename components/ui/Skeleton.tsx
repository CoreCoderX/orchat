import { CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  // Allow inline style for dynamic widths
  style?: CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      style={style}
      className={cn(
        "rounded-md bg-neutral-200 dark:bg-dark-tertiary animate-pulse",
        className,
      )}
    />
  );
}

// Multi-line skeleton for chat messages
export function MessageSkeleton() {
  return (
    <div className="flex gap-3 px-4 py-3">
      <Skeleton className="size-7 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

// Sidebar conversation list skeleton
export function ConversationSkeleton() {
  return (
    <div className="space-y-1 px-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 px-2 py-2 rounded-lg">
          {/* Dynamic width via style prop — now valid */}
          <Skeleton
            className="h-3 flex-1"
            style={{ width: `${60 + i * 8}%` }}
          />
        </div>
      ))}
    </div>
  );
}
