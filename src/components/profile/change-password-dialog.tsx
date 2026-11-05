"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { changePassword } from "@/actions/profile";
import { AuthField } from "@/components/auth/auth-field";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

function ChangePasswordForm({ onClose }: { onClose: () => void }) {
  const [state, formAction, pending] = useActionState(changePassword, null);

  useEffect(() => {
    if (!state?.success) return;
    toast.success("Your password was updated", { id: "password-updated" });
    onClose();
  }, [onClose, state]);

  return (
    <form action={formAction} className="flex flex-col gap-3" noValidate>
      {state?.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      <AuthField
        id="current-password"
        label="Current password"
        name="currentPassword"
        type="password"
        autoComplete="current-password"
        invalid={Boolean(state?.error)}
      />
      <AuthField
        id="new-password"
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        invalid={Boolean(state?.error)}
      />
      <AuthField
        id="confirm-new-password"
        label="Confirm new password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        invalid={Boolean(state?.error)}
      />
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Updating…" : "Update password"}
        </Button>
      </div>
    </form>
  );
}

export function ChangePasswordDialog() {
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const close = useCallback(() => {
    setOpen(false);
    setFormKey((key) => key + 1);
  }, []);

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setFormKey((key) => key + 1);
      }}
    >
      <AlertDialogTrigger render={<Button variant="outline" />}>
        Change password
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Change password</AlertDialogTitle>
          <AlertDialogDescription>
            Enter your current password, then choose a new one.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <ChangePasswordForm key={formKey} onClose={close} />
      </AlertDialogContent>
    </AlertDialog>
  );
}
