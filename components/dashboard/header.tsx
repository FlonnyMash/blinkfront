"use client";

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
import type { Website } from "@/lib/validations/website";

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

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) {
            setValidationError(null);
          }
        }}
      >
        <DialogTrigger asChild>
          <Button disabled={!websiteData || isPublishing}>Publish</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish your site</DialogTitle>
            <DialogDescription>
              Choose a subdomain for your live site. It will be available at{" "}
              <span className="font-medium text-foreground">
                your-name.{deploymentDomain}
              </span>
              .
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
    </header>
  );
}
