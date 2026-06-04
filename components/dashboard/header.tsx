"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthRequiredDialog } from "@/components/dashboard/auth-required-dialog";
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
import type { SessionUser } from "@/lib/auth/session";
import type { Website } from "@/types/layout";

const SLUG_PATTERN = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
const deploymentDomain =
  process.env.NEXT_PUBLIC_DEPLOYMENT_DOMAIN ?? "yourdomain.com";

const LOGIN_HREF = "/login?returnTo=%2Fbuilder";

type DashboardHeaderProps = {
  websiteData: Website | null;
  isPublishing: boolean;
  isSaving?: boolean;
  user: SessionUser | null;
  onPublish: (subdomain: string) => void;
  onSave?: () => void;
  onPrepareSignIn?: () => void;
};

export function DashboardHeader({
  websiteData,
  isPublishing,
  isSaving = false,
  user,
  onPublish,
  onSave,
  onPrepareSignIn,
}: DashboardHeaderProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [subdomain, setSubdomain] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const isGuest = !user;

  function normalizeSlug(value: string): string {
    const trimmed = value.trim().toLowerCase();
    const suffix = `.${deploymentDomain.toLowerCase()}`;
    return trimmed.endsWith(suffix) ? trimmed.slice(0, -suffix.length) : trimmed;
  }

  function handlePublishClick() {
    if (isGuest) {
      setAuthDialogOpen(true);
      return;
    }
    setOpen(true);
  }

  function handleSaveClick() {
    onSave?.();
  }

  function handleConfirm() {
    const slug = normalizeSlug(subdomain);

    if (!SLUG_PATTERN.test(slug)) {
      setValidationError(
        "Use lowercase letters, numbers, and hyphens (2–63 characters).",
      );
      return;
    }

    setValidationError(null);
    setOpen(false);
    onPublish(slug);
  }

  function handleSignInClick() {
    onPrepareSignIn?.();
    router.push(LOGIN_HREF);
  }

  const canPublish = Boolean(websiteData) && !isPublishing;

  const publishDialog = (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setValidationError(null);
        }
      }}
    >
      {!isGuest && canPublish ? (
        <DialogTrigger asChild>
          <Button
            size="sm"
            className="bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Publish
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Publish your site</DialogTitle>
          <DialogDescription>
            Choose a site name for this deployment. Without a custom domain,
            your site will be live at a unique{" "}
            <span className="font-medium text-foreground">*.vercel.app</span>{" "}
            URL. To use{" "}
            <span className="font-medium text-foreground">
              your-name.{deploymentDomain}
            </span>
            , add and verify that domain on the publish project in Vercel.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Input
              value={subdomain}
              onChange={(event) => {
                setSubdomain(event.target.value);
                setValidationError(null);
              }}
              placeholder="my-awesome-site"
              disabled={isPublishing}
              aria-invalid={validationError ? true : undefined}
            />
            <span className="shrink-0 text-sm text-muted-foreground">
              .{deploymentDomain}
            </span>
          </div>
          {validationError && (
            <p className="text-sm text-red-500" role="alert">
              {validationError}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPublishing}
            className="border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isPublishing || !subdomain.trim()}
            className="bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Publish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight text-slate-900"
          >
            Blinkfront AI
          </Link>

          <nav className="flex items-center gap-2">
            {isGuest ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignInClick}
                className="border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Login
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="border-slate-200 text-slate-700 hover:bg-slate-50"
                asChild
              >
                <Link href="/dashboard">Sites</Link>
              </Button>
            )}

            {!isGuest && canPublish ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveClick}
                disabled={isSaving}
                className="border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                {isSaving ? "Saving…" : "Save"}
              </Button>
            ) : null}

            {canPublish && isGuest ? (
              <Button
                size="sm"
                onClick={handlePublishClick}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Publish
              </Button>
            ) : canPublish && !isGuest ? (
              publishDialog
            ) : (
              <Button size="sm" disabled>
                Publish
              </Button>
            )}
          </nav>
        </div>
      </header>

      <AuthRequiredDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        actionLabel="publish"
        onPrepareSignIn={onPrepareSignIn}
      />
    </>
  );
}
