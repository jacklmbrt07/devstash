"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { listCollectionOptions } from "@/actions/collections";
import { updateItem } from "@/actions/items";
import { CollectionMultiSelect } from "@/components/collections/collection-multi-select";
import { CodeEditor, isCodeItemType } from "@/components/items/code-editor";
import {
  MarkdownEditor,
  isMarkdownItemType,
} from "@/components/items/markdown-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  getItemTypeLabel,
  ITEM_TYPE_ICONS,
} from "@/lib/constants/item-types";
import type { CollectionOption } from "@/lib/db/collections";
import type { ItemDetail } from "@/lib/db/items";
import { formatAbsoluteDate } from "@/lib/format-relative-time";
import { languageSelectOptions } from "@/lib/items/code-editor";
import { formatFileSize } from "@/lib/items/file-upload";

const SELECT_CLASS =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30";

const CONTENT_TYPES = new Set(["snippet", "prompt", "command", "note"]);
const LANGUAGE_TYPES = new Set(["snippet", "command"]);

function singularTypeLabel(name: string): string {
  const label = getItemTypeLabel(name);
  return label.endsWith("s") ? label.slice(0, -1) : label;
}

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

export function ItemDrawerEditor({
  item,
  onCancel,
  onSaved,
}: {
  item: ItemDetail;
  onCancel: () => void;
  onSaved: (item: ItemDetail) => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description ?? "");
  const [tags, setTags] = useState(item.tags.join(", "));
  const [collectionIds, setCollectionIds] = useState(
    item.collections.map((collection) => collection.id),
  );
  const [content, setContent] = useState(item.content ?? "");
  const [language, setLanguage] = useState(item.language ?? "");
  const [url, setUrl] = useState(item.url ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collectionOptions, setCollectionOptions] = useState<CollectionOption[]>(
    [],
  );
  const [collectionsLoading, setCollectionsLoading] = useState(true);

  const Icon = ITEM_TYPE_ICONS[item.typeName];
  const typeLabel = singularTypeLabel(item.typeName);
  const showContent = CONTENT_TYPES.has(item.typeName);
  const showLanguage = LANGUAGE_TYPES.has(item.typeName);
  const showUrl = item.typeName === "link";
  const titleMissing = title.trim().length === 0;

  useEffect(() => {
    let cancelled = false;

    void listCollectionOptions().then((result) => {
      if (cancelled) return;
      if (!result.success) {
        toast.error(result.error ?? "Couldn't load collections");
        setCollectionOptions([]);
        setCollectionsLoading(false);
        return;
      }
      setCollectionOptions(result.data);
      setCollectionsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  async function save() {
    if (titleMissing || saving) return;
    setSaving(true);
    setError(null);

    const result = await updateItem(item.id, {
      title,
      description,
      content,
      language,
      url,
      tags: tagList(tags),
      collectionIds,
    });

    if (!result.success || !result.data) {
      const message = result.error ?? "Couldn't save this item";
      setError(message);
      toast.error(message);
      setSaving(false);
      return;
    }

    onSaved(result.data);
    toast.success("Item saved");
    await router.refresh();
  }

  return (
    <form
      className="flex flex-col gap-5 p-4 pr-12"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <SheetHeader className="gap-3 p-0">
        <span
          className="inline-flex w-fit items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium"
          style={{
            color: item.typeColor,
            backgroundColor: `${item.typeColor}22`,
          }}
        >
          {Icon ? <Icon className="size-3" aria-hidden /> : null}
          {typeLabel}
        </span>
        <SheetTitle className="sr-only">Edit {item.title}</SheetTitle>
        <SheetDescription className="sr-only">
          Edit this item. The type stays the same.
        </SheetDescription>
      </SheetHeader>

      <Field label="Title">
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          autoFocus
          disabled={saving}
        />
      </Field>

      <Field label="Description">
        <Textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          disabled={saving}
        />
      </Field>

      <Field label="Tags">
        <Input
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          placeholder="utils, typescript"
          disabled={saving}
        />
      </Field>

      <Field label="Collections">
        <CollectionMultiSelect
          options={collectionOptions}
          value={collectionIds}
          onChange={setCollectionIds}
          disabled={saving}
          loading={collectionsLoading}
        />
      </Field>

      {showLanguage ? (
        <Field label="Language">
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            disabled={saving}
            className={SELECT_CLASS}
            aria-label="Language"
          >
            {languageSelectOptions(language).map((option) => (
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
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            disabled={saving}
          />
        </Field>
      ) : null}

      {showContent ? (
        <Field label="Content">
          {isCodeItemType(item.typeName) ? (
            <CodeEditor
              value={content}
              language={language}
              onChange={setContent}
              disabled={saving}
            />
          ) : isMarkdownItemType(item.typeName) ? (
            <MarkdownEditor
              value={content}
              onChange={setContent}
              disabled={saving}
            />
          ) : (
            <Textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={12}
              className="font-mono text-xs"
              disabled={saving}
            />
          )}
        </Field>
      ) : null}

      {item.fileName ? (
        <p className="text-sm">
          <span className="font-medium">File</span>{" "}
          <span className="text-muted-foreground">
            {item.fileName}
            {item.fileSize != null ? ` · ${formatFileSize(item.fileSize)}` : ""}
          </span>
        </p>
      ) : null}

      <p className="text-xs text-muted-foreground">
        Created {formatAbsoluteDate(item.createdAt)} · Updated{" "}
        {formatAbsoluteDate(item.updatedAt)}
      </p>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={saving || titleMissing}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}
