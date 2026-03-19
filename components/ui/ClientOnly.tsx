"use client";

import { useEffect, useState, ReactNode } from "react";

interface ClientOnlyProps {
  children: ReactNode;
  // Optional fallback shown during SSR / before hydration
  fallback?: ReactNode;
}

/**
 * Renders children only after the component has mounted on the client.
 * Prevents ALL hydration mismatches caused by:
 *  - Zustand persisted store values (localStorage)
 *  - Theme (dark/light class)
 *  - Lucide SVG icons that depend on client state
 *  - Any dynamic value that differs between server and client
 */
export default function ClientOnly({
  children,
  fallback = null,
}: ClientOnlyProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <>{fallback}</>;
  return <>{children}</>;
}
