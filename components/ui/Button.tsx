"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "outline" | "danger" | "primary";
  size?: "xs" | "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      isLoading,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed select-none";

    const variants = {
      default:
        "bg-neutral-100 hover:bg-neutral-200 dark:bg-dark-tertiary dark:hover:bg-dark-quaternary text-ink dark:text-neutral-100",
      ghost:
        "hover:bg-neutral-100 dark:hover:bg-dark-tertiary text-ink-secondary dark:text-neutral-400 hover:text-ink dark:hover:text-neutral-100",
      outline:
        "border border-neutral-200 dark:border-dark-border hover:bg-neutral-50 dark:hover:bg-dark-tertiary text-ink dark:text-neutral-100",
      danger:
        "bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400",
      primary:
        "bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900",
    };

    const sizes = {
      xs: "text-xs px-2 py-1 h-6",
      sm: "text-xs px-2.5 py-1.5 h-7",
      md: "text-sm px-3 py-2 h-9",
      lg: "text-sm px-4 py-2.5 h-10",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="size-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {children}
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
export default Button;
