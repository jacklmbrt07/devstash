"use client";

import { useMemo, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "cn";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { editorHeight } from "@/lib/items/code-editor";

export { isMarkdownItemType } from "@/lib/items/markdown-editor";

type EditorTab = "write" | "preview";

export function MarkdownEditor({
  value,
  readOnly = false,
  disabled = false,
  onChange,
  className,
}: {
  value: string;
  readOnly?: boolean;
  disabled?: boolean;
  onChange?: (value: string) => void;
  className?: string;
}) {
  const [tab, setTab] = useState<EditorTab>(readOnly ? "preview" : "write");
  const [copied, setCopied] = useState(false);
  const height = useMemo(() => editorHeight(value), [value]);
  const locked = readOnly || disabled;
  const activeTab: EditorTab = readOnly ? "preview" : tab;

  async function copyMarkdown() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Copied to clipboard");
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy");
    }
  }

  return (
    <div
      className={cn(
        "markdown-editor overflow-hidden rounded-lg border border-border bg-[#1e1e1e]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-[#2d2d2d] px-3 py-2">
        <div className="flex items-center gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex items-center gap-1">
          {readOnly ? (
            <span className="px-1 text-[11px] font-medium tracking-wide text-white/50 uppercase">
              Preview
            </span>
          ) : (
            <div
              role="tablist"
              aria-label="Markdown editor mode"
              className="flex items-center gap-0.5 rounded-md bg-black/25 p-0.5"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "write"}
                disabled={disabled}
                className={cn(
                  "rounded px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase transition-colors",
                  activeTab === "write"
                    ? "bg-white/15 text-white"
                    : "text-white/50 hover:text-white/80",
                  disabled && "opacity-50",
                )}
                onClick={() => setTab("write")}
              >
                Write
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "preview"}
                disabled={disabled}
                className={cn(
                  "rounded px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase transition-colors",
                  activeTab === "preview"
                    ? "bg-white/15 text-white"
                    : "text-white/50 hover:text-white/80",
                  disabled && "opacity-50",
                )}
                onClick={() => setTab("preview")}
              >
                Preview
              </button>
            </div>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Copy markdown"
            className="text-white/70 hover:bg-white/10 hover:text-white"
            onClick={() => {
              void copyMarkdown();
            }}
            disabled={disabled}
          >
            {copied ? <Check /> : <Copy />}
          </Button>
        </div>
      </div>

      {activeTab === "write" ? (
        <textarea
          value={value}
          onChange={(event) => {
            if (locked) return;
            onChange?.(event.target.value);
          }}
          disabled={disabled}
          readOnly={readOnly}
          spellCheck={false}
          aria-label="Markdown content"
          className="w-full resize-none border-0 bg-transparent px-3 py-2 font-mono text-xs leading-[19px] text-white/90 outline-none placeholder:text-white/30 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ height }}
          placeholder="Write markdown…"
        />
      ) : (
        <div
          className="markdown-preview overflow-auto px-3 py-2 text-sm text-white/90"
          style={{ height }}
        >
          {value.trim() ? (
            <Markdown remarkPlugins={[remarkGfm]}>{value}</Markdown>
          ) : (
            <p className="text-white/30">Nothing to preview</p>
          )}
        </div>
      )}
    </div>
  );
}
