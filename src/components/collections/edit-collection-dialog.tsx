"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateCollection } from "@/actions/collections";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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

export function EditCollectionDialog({
  collectionId,
  name,
  description,
  open,
  onOpenChange,
}: {
  collectionId: string;
  name: string;
  description: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    name,
    description: description ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm({ name, description: description ?? "" });
    setError(null);
    setSaving(false);
  }, [open, name, description]);

  const nameMissing = form.name.trim().length === 0;

  function update<Key extends keyof typeof form>(
    key: Key,
    value: (typeof form)[Key],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleOpenChange(next: boolean) {
    if (saving) return;
    onOpenChange(next);
  }

  async function save() {
    if (nameMissing || saving) return;
    setSaving(true);
    setError(null);

    const result = await updateCollection(collectionId, {
      name: form.name,
      description: form.description,
    });

    if (!result.success || !result.data) {
      const message = result.error ?? "Couldn't update this collection";
      setError(message);
      toast.error(message);
      setSaving(false);
      return;
    }

    toast.success("Collection updated");
    onOpenChange(false);
    setSaving(false);
    await router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
            <DialogTitle>Edit collection</DialogTitle>
            <DialogDescription>
              Update the name and optional description.
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
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
