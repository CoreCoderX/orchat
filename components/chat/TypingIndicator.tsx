"use client";

import { motion } from "framer-motion";

export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {/* AI avatar dot */}
      <div className="size-7 rounded-full bg-neutral-200 dark:bg-dark-quaternary flex-shrink-0 flex items-center justify-center">
        <div className="size-3 rounded-full bg-neutral-400 dark:bg-neutral-600" />
      </div>

      {/* Bouncing dots */}
      <div className="flex items-center gap-1 bg-neutral-100 dark:bg-dark-tertiary px-3 py-2 rounded-2xl">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="size-1.5 rounded-full bg-neutral-400 dark:bg-neutral-500"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 0.9,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}
