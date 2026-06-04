"use client";

import Link from "next/link";

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
};

export function AuthRequiredDialog({
  open,
  onOpenChange,
  actionLabel = "publish",
  returnTo = "/builder",
}: AuthRequiredDialogProps) {
  const loginHref = `/login?returnTo=${encodeURIComponent(returnTo)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm gap-6">
        <DialogHeader className="items-center space-y-3 text-center sm:text-center">
          <DialogTitle className="text-center">Sign in to continue</DialogTitle>
          <DialogDescription className="text-center text-balance">
            Sign in to {actionLabel} your site and keep your progress. You can
            keep previewing without an account.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col sm:justify-center">
          <Button asChild className="w-full">
            <Link href={loginHref}>Sign in</Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Keep previewing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
