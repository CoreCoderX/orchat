"use client";

import { motion } from "framer-motion";
import { Sparkles, Code2, Globe, Lightbulb } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { useChatStore } from "@/store/chatStore";

// Suggested starter prompts
const STARTER_PROMPTS = [
  {
    icon: Sparkles,
    label: "Brainstorm ideas",
    prompt:
      "Help me brainstorm creative ideas for a new side project as a developer.",
  },
  {
    icon: Code2,
    label: "Review my code",
    prompt:
      "Explain best practices for writing clean, maintainable TypeScript code.",
  },
  {
    icon: Globe,
    label: "Explain a concept",
    prompt:
      "Explain how the internet works, from DNS resolution to HTTP responses.",
  },
  {
    icon: Lightbulb,
    label: "Solve a problem",
    prompt:
      "What are the most effective strategies for debugging complex software issues?",
  },
];

export default function WelcomeScreen() {
  const { sendMessage } = useChat();
  const activeConvId = useChatStore((s) => s.activeConversationId);

  const handlePrompt = (prompt: string) => {
    sendMessage(prompt, activeConvId ?? undefined);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-lg text-center"
      >
        {/* Logo / Icon */}
        <div className="size-12 rounded-2xl bg-neutral-100 dark:bg-dark-tertiary border border-neutral-200 dark:border-dark-border flex items-center justify-center mx-auto mb-5">
          <div className="size-5 rounded-full bg-neutral-400 dark:bg-neutral-500" />
        </div>

        <h1 className="text-2xl font-semibold text-ink dark:text-neutral-100 mb-1">
          How can I help you today?
        </h1>
        <p className="text-sm text-ink-tertiary dark:text-neutral-500 mb-8">
          Powered by OpenRouter · Access to 200+ AI models
        </p>

        {/* Starter prompts grid */}
        <div className="grid grid-cols-2 gap-2">
          {STARTER_PROMPTS.map(({ icon: Icon, label, prompt }) => (
            <motion.button
              key={label}
              onClick={() => handlePrompt(prompt)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="flex flex-col items-start gap-2 p-3.5 rounded-xl text-left
                         border border-neutral-200 dark:border-dark-border
                         bg-white dark:bg-dark-secondary
                         hover:bg-neutral-50 dark:hover:bg-dark-tertiary
                         hover:border-neutral-300 dark:hover:border-neutral-700
                         transition-all duration-150 group"
            >
              <div className="size-7 rounded-lg bg-neutral-100 dark:bg-dark-tertiary flex items-center justify-center group-hover:bg-neutral-200 dark:group-hover:bg-dark-quaternary transition-colors">
                <Icon className="size-3.5 text-ink-secondary dark:text-neutral-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-ink dark:text-neutral-100">
                  {label}
                </div>
                <div className="text-xs text-ink-tertiary dark:text-neutral-500 mt-0.5 line-clamp-2 text-left">
                  {prompt}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
