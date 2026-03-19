"use client";

import { cn } from "@/lib/utils";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: "sm" | "md";
}

export default function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = "md",
}: ToggleProps) {
  const sizes = {
    sm: { track: "w-8 h-4", thumb: "size-3", translate: "translate-x-4" },
    md: { track: "w-10 h-5", thumb: "size-3.5", translate: "translate-x-5" },
  };

  const { track, thumb, translate } = sizes[size];

  return (
    <label
      className={cn(
        "flex items-center gap-3 cursor-pointer group",
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      {/* Track */}
      <div
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && onChange(!checked)}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            if (!disabled) onChange(!checked);
          }
        }}
        className={cn(
          "relative flex-shrink-0 rounded-full transition-colors duration-200",
          track,
          checked
            ? "bg-neutral-800 dark:bg-neutral-200"
            : "bg-neutral-300 dark:bg-neutral-700",
        )}
      >
        {/* Thumb */}
        <div
          className={cn(
            "absolute top-0.5 left-0.5 rounded-full",
            "bg-white dark:bg-neutral-900",
            "shadow-sm transition-transform duration-200",
            thumb,
            checked ? translate : "translate-x-0",
          )}
        />
      </div>

      {/* Label */}
      {(label || description) && (
        <div className="flex flex-col min-w-0">
          {label && (
            <span className="text-sm font-medium text-ink dark:text-neutral-100 leading-none">
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs text-ink-tertiary dark:text-neutral-500 mt-0.5">
              {description}
            </span>
          )}
        </div>
      )}
    </label>
  );
}
