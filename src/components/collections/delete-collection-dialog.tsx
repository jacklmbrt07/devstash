"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteCollection } from "@/actions/collections";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export function DeleteCollectionDialog({
  collectionId,
  name,
  open,
  onOpenChange,
  redirectTo,
}: {
  collectionId: string;
  name: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function confirmDelete() {
    if (pending) return;
    setPending(true);

    const result = await deleteCollection(collectionId);
    if (!result.success) {
      toast.error(result.error ?? "Couldn't delete this collection");
      setPending(false);
      return;
    }

    onOpenChange(false);
    setPending(false);
    toast.success("Collection deleted");

    if (redirectTo) {
      router.push(redirectTo);
      return;
    }

    await router.refresh();
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (pending) return;
        onOpenChange(next);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete collection</AlertDialogTitle>
          <AlertDialogDescription>
            This removes “{name}” from your collections. Items in it are kept
            and are only unlinked from this collection.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogClose
            render={
              <Button variant="outline" type="button" disabled={pending} />
            }
          >
            Cancel
          </AlertDialogClose>
          <Button
            type="button"
            variant="destructive"
            disabled={pending}
            onClick={() => {
              void confirmDelete();
            }}
          >
            {pending ? "Deleting…" : "Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
