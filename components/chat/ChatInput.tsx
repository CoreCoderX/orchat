"use client";

import { useRef, useCallback, KeyboardEvent, useState, useEffect } from "react";
import TextareaAutosize from "react-textarea-autosize";
import {
  ArrowUp,
  Square,
  Paperclip,
  X,
  Image as ImageIcon,
  FileText,
  Globe,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/store/settingsStore";
import { useUIStore } from "@/store/uiStore";
import { AttachedFile } from "@/types";
import Button from "@/components/ui/Button";
import Tooltip from "@/components/ui/Tooltip";
import { v4 as uuidv4 } from "uuid";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (attachments?: AttachedFile[], webSearch?: boolean) => void;
  isGenerating: boolean;
  onStop: () => void;
  placeholder?: string;
}

// File size limit: 10 MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Accepted file types
const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/json",
  "application/pdf",
  "text/javascript",
  "text/typescript",
  "text/html",
  "text/css",
];

export default function ChatInput({
  value,
  onChange,
  onSend,
  isGenerating,
  onStop,
  placeholder = "Message…",
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [webSearchOn, setWebSearchOn] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const { sendOnEnter } = useSettingsStore();
  const { isGenerating: globalGenerating } = useUIStore();

  const canSend =
    (value.trim().length > 0 || attachments.length > 0) && !isGenerating;

  // ── Handle file processing ────────────────────────────────────────────────

  const processFile = useCallback(
    async (file: File): Promise<AttachedFile | null> => {
      if (file.size > MAX_FILE_SIZE) {
        alert(`File "${file.name}" is too large. Max size is 10 MB.`);
        return null;
      }

      if (
        !ACCEPTED_TYPES.includes(file.type) &&
        !file.name.match(
          /\.(txt|md|csv|json|js|ts|tsx|jsx|html|css|py|java|c|cpp|rs|go)$/i,
        )
      ) {
        alert(`File type "${file.type}" is not supported.`);
        return null;
      }

      return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = (e) => {
          const content = e.target?.result as string;

          const attached: AttachedFile = {
            id: uuidv4(),
            name: file.name,
            type: file.type,
            size: file.size,
            content: content,
            preview: file.type.startsWith("image/") ? content : undefined,
          };

          resolve(attached);
        };

        reader.onerror = () => resolve(null);

        if (file.type.startsWith("image/")) {
          reader.readAsDataURL(file);
        } else {
          reader.readAsText(file);
        }
      });
    },
    [],
  );

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const processed = await Promise.all(fileArray.map(processFile));
      const valid = processed.filter((f): f is AttachedFile => f !== null);
      setAttachments((prev) => [...prev, ...valid].slice(0, 5)); // Max 5 files
    },
    [processFile],
  );

  // ── File input change ─────────────────────────────────────────────────────

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
    e.target.value = ""; // Reset so same file can be reselected
  };

  // ── Drag and drop ─────────────────────────────────────────────────────────

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  // ── Paste image ───────────────────────────────────────────────────────────

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageItems: File[] = [];
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) imageItems.push(file);
        }
      }
      if (imageItems.length > 0) handleFiles(imageItems);
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handleFiles]);

  // ── Remove attachment ─────────────────────────────────────────────────────

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // ── Send ──────────────────────────────────────────────────────────────────

  const handleSend = useCallback(() => {
    if (!canSend) return;
    onSend(attachments.length > 0 ? attachments : undefined, webSearchOn);
    setAttachments([]);
  }, [canSend, onSend, attachments, webSearchOn]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && sendOnEnter && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [sendOnEnter, handleSend],
  );

  // ── Format file size ──────────────────────────────────────────────────────

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      className={cn(
        "relative transition-colors",
        isDragging && "bg-neutral-50 dark:bg-dark-tertiary",
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl border-2 border-dashed border-neutral-400 dark:border-neutral-600 bg-neutral-50/90 dark:bg-dark-tertiary/90">
          <p className="text-sm font-medium text-ink-secondary dark:text-neutral-400">
            Drop files here
          </p>
        </div>
      )}

      {/* Attachment previews */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2 px-1 pb-2 overflow-hidden"
          >
            {attachments.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group flex items-center gap-1.5 bg-neutral-100 dark:bg-dark-tertiary rounded-xl px-2.5 py-1.5 pr-1 max-w-[200px]"
              >
                {/* File icon or thumbnail */}
                {file.preview ? (
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="size-8 object-cover rounded-lg flex-shrink-0"
                  />
                ) : file.type.startsWith("image/") ? (
                  <ImageIcon className="size-4 text-ink-tertiary flex-shrink-0" />
                ) : (
                  <FileText className="size-4 text-ink-tertiary flex-shrink-0" />
                )}

                {/* File info */}
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-ink dark:text-neutral-100 truncate font-medium">
                    {file.name}
                  </p>
                  <p className="text-[10px] text-ink-muted dark:text-neutral-600">
                    {formatSize(file.size)}
                  </p>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeAttachment(file.id)}
                  className="flex-shrink-0 size-5 rounded-full bg-neutral-200 dark:bg-dark-quaternary flex items-center justify-center hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors ml-1"
                >
                  <X className="size-3 text-ink-secondary dark:text-neutral-400" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input box */}
      <div
        className={cn(
          "flex items-end gap-2 px-3 py-2.5 rounded-2xl border transition-colors",
          "bg-white dark:bg-dark-secondary",
          "border-neutral-200 dark:border-dark-border",
          "focus-within:border-neutral-300 dark:focus-within:border-neutral-700",
          "shadow-sm",
        )}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(",")}
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Attach button */}
        <Tooltip content="Attach files (images, text, code)">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "flex-shrink-0 self-end mb-0.5",
              attachments.length > 0 && "text-ink dark:text-neutral-100",
            )}
            disabled={isGenerating}
          >
            <Paperclip className="size-4" />
          </Button>
        </Tooltip>

        {/* Web search toggle */}
        <Tooltip
          content={
            webSearchOn
              ? "Web search: ON"
              : "Web search: OFF (uses search-capable models)"
          }
        >
          <Button
            variant={webSearchOn ? "default" : "ghost"}
            size="sm"
            onClick={() => setWebSearchOn((v) => !v)}
            className={cn(
              "flex-shrink-0 self-end mb-0.5 gap-1",
              webSearchOn
                ? "bg-neutral-100 dark:bg-dark-tertiary text-ink dark:text-neutral-100"
                : "text-ink-tertiary dark:text-neutral-600",
            )}
            disabled={isGenerating}
          >
            <Globe className="size-4" />
            <span className="hidden sm:block text-xs">
              {webSearchOn ? "Search: On" : "Search"}
            </span>
          </Button>
        </Tooltip>

        {/* Textarea */}
        <TextareaAutosize
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            webSearchOn
              ? "Ask anything — I'll search the web…"
              : attachments.length > 0
                ? "Ask about the attached files…"
                : placeholder
          }
          minRows={1}
          maxRows={8}
          className={cn(
            "flex-1 resize-none bg-transparent outline-none",
            "text-sm text-ink dark:text-neutral-100",
            "placeholder:text-ink-muted dark:placeholder:text-neutral-600",
            "py-1.5 px-1 leading-relaxed",
            // Prevent iOS zoom
            "text-[16px] md:text-[14px]",
          )}
          disabled={globalGenerating && !isGenerating}
        />

        {/* Send / Stop */}
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="stop"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Button
                variant="primary"
                size="sm"
                onClick={onStop}
                className="flex-shrink-0 self-end mb-0.5"
              >
                <Square className="size-3.5" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="send"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Button
                variant="primary"
                size="sm"
                onClick={handleSend}
                disabled={!canSend}
                className="flex-shrink-0 self-end mb-0.5"
                aria-label="Send message"
              >
                <ArrowUp className="size-3.5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hints */}
      <p className="text-[10px] text-ink-muted dark:text-neutral-600 text-center mt-1.5 px-2">
        {webSearchOn && (
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            🔍 Web search active ·{" "}
          </span>
        )}
        {sendOnEnter
          ? "Enter to send · Shift+Enter new line"
          : "Shift+Enter to send"}
        {" · Paste or drop files"}
      </p>
    </div>
  );
}
