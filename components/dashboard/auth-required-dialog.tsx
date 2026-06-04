"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AuthRequiredDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionLabel?: string;
  returnTo?: string;
  onPrepareSignIn?: () => void;
};

export function AuthRequiredDialog({
  open,
  onOpenChange,
  actionLabel = "publish",
  returnTo = "/builder",
  onPrepareSignIn,
}: AuthRequiredDialogProps) {
  const router = useRouter();
  const loginHref = `/login?returnTo=${encodeURIComponent(returnTo)}`;

  function handleSignIn() {
    onPrepareSignIn?.();
    router.push(loginHref);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-6 sm:max-w-sm">
        <DialogHeader className="items-center space-y-3 text-center sm:text-center">
          <DialogTitle className="text-center">Sign in to continue</DialogTitle>
          <DialogDescription className="text-balance text-center">
            Sign in to {actionLabel} your site and keep your progress. You can
            keep previewing without an account.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-3 sm:flex-col sm:justify-center">
          <Button type="button" className="w-full" onClick={handleSignIn}>
            Sign in
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full border-border bg-background text-foreground hover:bg-muted"
            onClick={() => onOpenChange(false)}
          >
            Keep previewing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
