import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "free" | "popular" | "new";
  className?: string;
}

export default function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  const variants = {
    default:
      "bg-neutral-100 dark:bg-dark-tertiary text-ink-secondary dark:text-neutral-400",
    free: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400",
    popular:
      "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900",
    new: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
