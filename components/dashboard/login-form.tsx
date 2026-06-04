"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { clearGuestDraft, loadGuestDraft } from "@/lib/guest-draft";
import { saveSiteLayout } from "@/lib/site-layout-client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") ?? "/builder";

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const guestDraft = loadGuestDraft();
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          ...(guestDraft
            ? {
                siteId: guestDraft.siteId,
                ...(guestDraft.guestId ? { guestId: guestDraft.guestId } : {}),
              }
            : {}),
        }),
      });

      const result = (await response.json()) as
        | { success: true; claimedSiteId?: string }
        | { success: false; error: string };

      if (!response.ok || !result.success) {
        setError(
          result.success === false ? result.error : "Failed to sign in",
        );
        return;
      }

      if (guestDraft) {
        const saved = await saveSiteLayout(
          guestDraft.siteId,
          guestDraft.website,
        );
        if (!saved.success) {
          toast.error(saved.error);
        } else {
          clearGuestDraft();
        }
      }

      const siteId = result.claimedSiteId ?? guestDraft?.siteId;
      const destination = siteId
        ? `${returnTo}${returnTo.includes("?") ? "&" : "?"}siteId=${encodeURIComponent(siteId)}`
        : returnTo;

      router.push(destination);
      router.refresh();
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-md text-left">
      <CardHeader>
        <CardTitle>Sign in to Blinkfront</CardTitle>
        <CardDescription>
          Save your generated site, publish to a live URL, and manage leads from
          one dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError(null);
            }}
            required
            disabled={isSubmitting}
          />
          {error ? (
            <p className="text-sm text-red-500" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Continue with email"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Just exploring?{" "}
          <Link href="/builder" className="text-primary underline-offset-4 hover:underline">
            Back to builder
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
