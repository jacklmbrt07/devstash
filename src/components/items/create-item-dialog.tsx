"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { createItem } from "@/actions/items";
import { CodeEditor, isCodeItemType } from "@/components/items/code-editor";
import {
  FileUpload,
  type UploadedFile,
} from "@/components/items/file-upload";
import {
  MarkdownEditor,
  isMarkdownItemType,
} from "@/components/items/markdown-editor";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { languageSelectOptions } from "@/lib/items/code-editor";
import {
  CREATABLE_ITEM_TYPES,
  CREATABLE_ITEM_TYPE_LABELS,
  type CreatableItemType,
} from "@/lib/items/create-item-input";

const SELECT_CLASS =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30";

const CONTENT_TYPES = new Set<CreatableItemType>([
  "snippet",
  "prompt",
  "command",
  "note",
]);
const LANGUAGE_TYPES = new Set<CreatableItemType>(["snippet", "command"]);
const FILE_TYPES = new Set<CreatableItemType>(["file", "image"]);

function tagList(value: string): string[] {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 text-sm font-medium">
      <span>{label}</span>
      {children}
    </div>
  );
}

const emptyForm = {
  type: "snippet" as CreatableItemType,
  title: "",
  description: "",
  tags: "",
  content: "",
  language: "",
  url: "",
  upload: null as UploadedFile | null,
};

export function CreateItemDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showContent = CONTENT_TYPES.has(form.type);
  const showLanguage = LANGUAGE_TYPES.has(form.type);
  const showUrl = form.type === "link";
  const showUpload = FILE_TYPES.has(form.type);
  const titleMissing = form.title.trim().length === 0;
  const urlMissing = showUrl && form.url.trim().length === 0;
  const fileMissing = showUpload && form.upload === null;

  function update<Key extends keyof typeof emptyForm>(
    key: Key,
    value: (typeof emptyForm)[Key],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function reset() {
    setForm(emptyForm);
    setError(null);
    setSaving(false);
  }

  function handleOpenChange(next: boolean) {
    if (saving) return;
    setOpen(next);
    if (!next) reset();
  }

  async function save() {
    if (titleMissing || urlMissing || fileMissing || saving) return;
    setSaving(true);
    setError(null);

    const result = await createItem({
      type: form.type,
      title: form.title,
      description: form.description,
      tags: tagList(form.tags),
      ...(showContent ? { content: form.content } : {}),
      ...(showLanguage ? { language: form.language } : {}),
      ...(showUrl ? { url: form.url } : {}),
      ...(showUpload && form.upload
        ? {
            fileUrl: form.upload.fileUrl,
            fileName: form.upload.fileName,
            fileSize: form.upload.fileSize,
          }
        : {}),
    });

    if (!result.success || !result.data) {
      const message = result.error ?? "Couldn't create this item";
      setError(message);
      toast.error(message);
      setSaving(false);
      return;
    }

    toast.success("Item created");
    setOpen(false);
    reset();
    await router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button type="button" />}>
        <Plus data-icon="inline-start" />
        New item
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100%-2rem)] overflow-y-auto sm:max-w-lg">
        <form
          className="contents"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void save();
          }}
        >
          <DialogHeader>
            <DialogTitle>New item</DialogTitle>
            <DialogDescription>
              Save a snippet, prompt, command, note, file, image, or link.
            </DialogDescription>
          </DialogHeader>

          <Field label="Type">
            <select
              value={form.type}
              onChange={(event) => {
                const nextType = event.target.value as CreatableItemType;
                setForm((current) => ({
                  ...current,
                  type: nextType,
                  // File and image share storage fields but not accept rules.
                  upload: nextType === current.type ? current.upload : null,
                }));
              }}
              disabled={saving}
              className={SELECT_CLASS}
            >
              {CREATABLE_ITEM_TYPES.map((type) => (
                <option key={type} value={type}>
                  {CREATABLE_ITEM_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Title">
            <Input
              value={form.title}
              onChange={(event) => update("title", event.target.value)}
              required
              autoFocus
              disabled={saving}
            />
          </Field>

          <Field label="Description">
            <Textarea
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
              rows={3}
              disabled={saving}
            />
          </Field>

          <Field label="Tags">
            <Input
              value={form.tags}
              onChange={(event) => update("tags", event.target.value)}
              placeholder="utils, typescript"
              disabled={saving}
            />
          </Field>

          {showLanguage ? (
            <Field label="Language">
              <select
                value={form.language}
                onChange={(event) => update("language", event.target.value)}
                disabled={saving}
                className={SELECT_CLASS}
                aria-label="Language"
              >
                {languageSelectOptions(form.language).map((option) => (
                  <option key={option.value || "plaintext"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
          ) : null}

          {showUrl ? (
            <Field label="URL">
              <Input
                type="url"
                value={form.url}
                onChange={(event) => update("url", event.target.value)}
                required
                disabled={saving}
              />
            </Field>
          ) : null}

          {showUpload ? (
            <Field label={form.type === "image" ? "Image" : "File"}>
              <FileUpload
                kind={form.type === "image" ? "image" : "file"}
                value={form.upload}
                onChange={(upload) => update("upload", upload)}
                disabled={saving}
              />
            </Field>
          ) : null}

          {showContent ? (
            <Field label="Content">
              {isCodeItemType(form.type) ? (
                <CodeEditor
                  value={form.content}
                  language={form.language}
                  onChange={(content) => update("content", content)}
                  disabled={saving}
                />
              ) : isMarkdownItemType(form.type) ? (
                <MarkdownEditor
                  value={form.content}
                  onChange={(content) => update("content", content)}
                  disabled={saving}
                />
              ) : (
                <Textarea
                  value={form.content}
                  onChange={(event) => update("content", event.target.value)}
                  rows={8}
                  className="font-mono text-xs"
                  disabled={saving}
                />
              )}
            </Field>
          ) : null}

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || titleMissing || urlMissing || fileMissing}
            >
              {saving ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
