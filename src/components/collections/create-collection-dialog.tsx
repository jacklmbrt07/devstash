"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { FolderPlus } from "lucide-react";
import { toast } from "sonner";

import { createCollection } from "@/actions/collections";
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
  name: "",
  description: "",
};

export function CreateCollectionDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameMissing = form.name.trim().length === 0;

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
    if (nameMissing || saving) return;
    setSaving(true);
    setError(null);

    const result = await createCollection({
      name: form.name,
      description: form.description,
    });

    if (!result.success || !result.data) {
      const message = result.error ?? "Couldn't create this collection";
      setError(message);
      toast.error(message);
      setSaving(false);
      return;
    }

    toast.success("Collection created");
    setOpen(false);
    reset();
    await router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button type="button" variant="outline" />}>
        <FolderPlus data-icon="inline-start" />
        New collection
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form
          className="contents"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void save();
          }}
        >
          <DialogHeader>
            <DialogTitle>New collection</DialogTitle>
            <DialogDescription>
              Group related items under a name and optional description.
            </DialogDescription>
          </DialogHeader>

          <Field label="Name">
            <Input
              value={form.name}
              onChange={(event) => update("name", event.target.value)}
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
            <Button type="submit" disabled={saving || nameMissing}>
              {saving ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
