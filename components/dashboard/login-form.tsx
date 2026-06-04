"use client";

import { useEffect, useState } from "react";
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

import {
  bridgeGuestDraftToPending,
  loadCommittedPendingDraft,
  syncPendingDraftAfterAuth,
} from "@/lib/site-layout-client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") ?? "/builder";

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPendingDraft, setHasPendingDraft] = useState(false);

  useEffect(() => {
    bridgeGuestDraftToPending();
    setHasPendingDraft(Boolean(loadCommittedPendingDraft()));
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const pendingDraft = bridgeGuestDraftToPending();

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          ...(pendingDraft
            ? {
                siteId: pendingDraft.siteId,
                ...(pendingDraft.guestId
                  ? { guestId: pendingDraft.guestId }
                  : {}),
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

      const synced = await syncPendingDraftAfterAuth({
        claimedSiteId: result.claimedSiteId,
      });

      if (!synced.success) {
        toast.error(synced.error);
        return;
      }

      const siteId =
        synced.siteId ?? result.claimedSiteId ?? pendingDraft?.siteId;
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
        <CardTitle>Sign in to Blinkfront AI</CardTitle>
        <CardDescription>
          Save your generated site, publish to a live URL, and manage leads from
          one dashboard.
          {hasPendingDraft ? (
            <>
              {" "}
              Your current builder progress will be linked to this account.
            </>
          ) : null}
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
          <Link
            href="/builder"
            className="text-primary underline-offset-4 hover:underline"
          >
            Back to builder
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
