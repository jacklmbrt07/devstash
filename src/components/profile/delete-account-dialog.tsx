"use client";

import { useActionState, useState } from "react";

import { deleteAccount } from "@/actions/profile";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export function DeleteAccountDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(deleteAccount, null);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button variant="destructive" />}>
        Delete account
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete account</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes your account, items, and collections.
            This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {state?.error ? (
          <p className="text-sm text-destructive" role="alert">
            {state.error}
          </p>
        ) : null}
        <form action={formAction}>
          <AlertDialogFooter>
            <AlertDialogClose render={<Button variant="outline" type="button" />}>
              Cancel
            </AlertDialogClose>
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending ? "Deleting…" : "Delete account"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
