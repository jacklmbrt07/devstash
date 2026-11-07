"use client";

import { useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import { cn } from "cn";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  editorHeight,
  monacoLanguage,
} from "@/lib/items/code-editor";

export { isCodeItemType } from "@/lib/items/code-editor";

export function CodeEditor({
  value,
  language,
  readOnly = false,
  disabled = false,
  onChange,
  className,
}: {
  value: string;
  language?: string | null;
  readOnly?: boolean;
  disabled?: boolean;
  onChange?: (value: string) => void;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const height = useMemo(() => editorHeight(value), [value]);
  const locked = readOnly || disabled;
  const languageLabel = language?.trim() || "plaintext";

  async function copyCode() {
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
        "code-editor overflow-hidden rounded-lg border border-border bg-[#1e1e1e]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-2">
        <div className="flex items-center gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex items-center gap-1">
          <span className="px-1 text-[11px] font-medium tracking-wide text-white/50 uppercase">
            {languageLabel}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Copy code"
            className="text-white/70 hover:bg-white/10 hover:text-white"
            onClick={() => {
              void copyCode();
            }}
            disabled={disabled}
          >
            {copied ? <Check /> : <Copy />}
          </Button>
        </div>
      </div>

      <Editor
        height={height}
        language={monacoLanguage(language)}
        value={value}
        theme="vs-dark"
        onChange={(next) => {
          if (locked) return;
          onChange?.(next ?? "");
        }}
        loading={
          <div className="flex h-[120px] items-center px-3 text-xs text-white/40">
            Loading editor…
          </div>
        }
        options={{
          readOnly: locked,
          domReadOnly: locked,
          minimap: { enabled: false },
          fontSize: 12,
          fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          wordWrap: "on",
          automaticLayout: true,
          padding: { top: 8, bottom: 8 },
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
            useShadows: false,
            verticalHasArrows: false,
            horizontalHasArrows: false,
          },
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          renderLineHighlight: locked ? "none" : "line",
          contextmenu: !locked,
          folding: true,
          renderWhitespace: "selection",
        }}
      />
    </div>
  );
}
