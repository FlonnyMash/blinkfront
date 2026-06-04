"use client";

import Link from "next/link";
import { useState } from "react";

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
import type { Website } from "@/types/layout";

const SLUG_PATTERN = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
const deploymentDomain =
  process.env.NEXT_PUBLIC_DEPLOYMENT_DOMAIN ?? "yourdomain.com";

type DashboardHeaderProps = {
  websiteData: Website | null;
  isPublishing: boolean;
  onPublish: (subdomain: string) => void;
};

export function DashboardHeader({
  websiteData,
  isPublishing,
  onPublish,
}: DashboardHeaderProps) {
  const [open, setOpen] = useState(false);
  const [subdomain, setSubdomain] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  function normalizeSlug(value: string): string {
    const trimmed = value.trim().toLowerCase();
    const suffix = `.${deploymentDomain.toLowerCase()}`;
    return trimmed.endsWith(suffix) ? trimmed.slice(0, -suffix.length) : trimmed;
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

  const canPublish = Boolean(websiteData) && !isPublishing;

  return (
    <header className="flex w-full items-center justify-between gap-4 border-b pb-4">
      <div className="text-left">
        <p className="text-sm font-medium">Site Builder</p>
        <p className="text-xs text-muted-foreground">
          {websiteData
            ? "Ready to publish your generated site"
            : "Generate a site to enable publishing"}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button variant="outline" asChild>
          <Link href="/dashboard">Sites</Link>
        </Button>
        <Dialog
          open={open}
          onOpenChange={(nextOpen) => {
            setOpen(nextOpen);
            if (!nextOpen) {
              setValidationError(null);
            }
          }}
        >
          {canPublish ? (
            <DialogTrigger asChild>
              <Button>Publish</Button>
            </DialogTrigger>
          ) : (
            <Button disabled>Publish</Button>
          )}
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
            >
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={isPublishing || !subdomain.trim()}>
              Publish
            </Button>
          </DialogFooter>
        </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}
