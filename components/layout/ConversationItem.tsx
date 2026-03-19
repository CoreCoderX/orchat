"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { Conversation } from "@/types";
import { useChatStore } from "@/store/chatStore";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect?: () => void;
}

export default function ConversationItem({
  conversation,
  isActive,
  onSelect,
}: ConversationItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(conversation.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const { selectConversation, deleteConversation, renameConversation } =
    useChatStore();

  useEffect(() => {
    if (isRenaming) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isRenaming]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMenu]);

  const handleSelect = () => {
    if (isRenaming) return;
    selectConversation(conversation.id);
    onSelect?.();
  };

  const handleRenameSubmit = () => {
    renameConversation(conversation.id, renameValue);
    setIsRenaming(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "group relative flex items-center gap-2 px-2 rounded-lg cursor-pointer transition-colors",
        "min-h-[44px]", // Touch target
        isActive
          ? "bg-neutral-100 dark:bg-dark-tertiary"
          : "hover:bg-neutral-50 dark:hover:bg-dark-secondary active:bg-neutral-100 dark:active:bg-dark-tertiary",
      )}
      onClick={handleSelect}
    >
      <MessageSquare className="size-3.5 flex-shrink-0 text-ink-muted dark:text-neutral-500" />

      <div className="flex-1 min-w-0 py-2">
        {isRenaming ? (
          <input
            ref={inputRef}
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRenameSubmit();
              if (e.key === "Escape") {
                setRenameValue(conversation.title);
                setIsRenaming(false);
              }
            }}
            onBlur={handleRenameSubmit}
            onClick={(e) => e.stopPropagation()}
            className="w-full text-xs bg-transparent outline-none border-b border-neutral-300 dark:border-neutral-600 text-ink dark:text-neutral-100 pb-0.5"
          />
        ) : (
          <p className="text-xs text-ink dark:text-neutral-200 truncate">
            {conversation.title}
          </p>
        )}
      </div>

      {isRenaming ? (
        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <Button variant="ghost" size="xs" onClick={handleRenameSubmit}>
            <Check className="size-3 text-emerald-500" />
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => {
              setRenameValue(conversation.title);
              setIsRenaming(false);
            }}
          >
            <X className="size-3" />
          </Button>
        </div>
      ) : (
        <div className="relative" ref={menuRef}>
          <Button
            variant="ghost"
            size="xs"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className={cn(
              "opacity-0 group-hover:opacity-100 transition-opacity",
              // Always visible on touch devices
              "lg:opacity-0 opacity-100",
              (isActive || showMenu) && "opacity-100",
            )}
          >
            <MoreHorizontal className="size-3.5" />
          </Button>

          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.1 }}
              className="absolute right-0 top-full mt-1 z-50 w-36 bg-white dark:bg-dark-secondary border border-neutral-200 dark:border-dark-border rounded-xl shadow-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setIsRenaming(true);
                  setShowMenu(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-3 text-xs text-ink dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-dark-tertiary active:bg-neutral-100 transition-colors"
              >
                <Pencil className="size-3" /> Rename
              </button>
              <button
                onClick={() => {
                  deleteConversation(conversation.id);
                  setShowMenu(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-3 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 active:bg-red-100 transition-colors"
              >
                <Trash2 className="size-3" /> Delete
              </button>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}
