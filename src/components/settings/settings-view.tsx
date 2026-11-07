import { DeleteAccountDialog } from "@/components/profile/delete-account-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SettingsView() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage account security and destructive actions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Permanently remove your DevStash account and all saved data.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <DeleteAccountDialog />
        </CardContent>
      </Card>
    </div>
  );
}
