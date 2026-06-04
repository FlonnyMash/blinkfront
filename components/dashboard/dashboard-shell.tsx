"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { DashboardHeader } from "@/components/dashboard/header";
import { DeploymentStatusCard } from "@/components/dashboard/deployment-status-card";
import { UrlInputForm } from "@/components/dashboard/url-input-form";
import { AuthRequiredDialog } from "@/components/dashboard/auth-required-dialog";
import { useDeploymentPolling } from "@/hooks/useDeploymentPolling";
import type { SessionUser } from "@/lib/auth/session";
import { clearGuestDraft, loadGuestDraft } from "@/lib/guest-draft";
import {
  fetchSiteLayout,
  loadPendingDraft,
  savePendingDraftFromBuilder,
  saveSiteLayout,
  syncPendingDraftAfterAuth,
} from "@/lib/site-layout-client";
import { getBrandName, type Website } from "@/types/layout";

type PublishSuccessResponse = {
  success: true;
  url: string;
  deploymentId: string;
  status: "READY" | "BUILDING";
  siteId?: string;
};

type PublishFailureResponse = {
  success: false;
  error: string;
  requiresAuth?: boolean;
};

type PublishResponse = PublishSuccessResponse | PublishFailureResponse;

type DashboardShellProps = {
  user: SessionUser | null;
  initialSiteId?: string | null;
};

export function DashboardShell({
  user,
  initialSiteId = null,
}: DashboardShellProps) {
  const router = useRouter();
  const [websiteData, setWebsiteData] = useState<Website | null>(null);
  const [activeSiteId, setActiveSiteId] = useState<string | null>(null);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const hydratedForUser = useRef<string | null>(null);

  const prepareSignIn = useCallback(() => {
    savePendingDraftFromBuilder({
      siteId: activeSiteId,
      website: websiteData,
    });
  }, [activeSiteId, websiteData]);

  useEffect(() => {
    const userKey = user?.id ?? "guest";
    if (hydratedForUser.current === userKey) {
      return;
    }

    let cancelled = false;

    async function hydrateDraft() {
      const pendingDraft = loadPendingDraft() ?? loadGuestDraft();

      if (pendingDraft) {
        if (!cancelled) {
          setWebsiteData(pendingDraft.website);
          setActiveSiteId(pendingDraft.siteId);
        }

        if (user) {
          const synced = await syncPendingDraftAfterAuth();
          if (!cancelled) {
            if (synced.success) {
              if (synced.siteId) {
                setActiveSiteId(synced.siteId);
              }
              router.refresh();
            } else {
              toast.error(synced.error);
            }
          }
        }

        if (!cancelled) {
          hydratedForUser.current = userKey;
        }
        return;
      }

      if (!user) {
        if (!cancelled) {
          hydratedForUser.current = userKey;
        }
        return;
      }

      const siteIdToLoad = initialSiteId ?? null;
      if (!siteIdToLoad) {
        if (!cancelled) {
          hydratedForUser.current = userKey;
        }
        return;
      }

      const loaded = await fetchSiteLayout(siteIdToLoad);
      if (!cancelled && loaded.success) {
        setWebsiteData(loaded.data);
        setActiveSiteId(siteIdToLoad);
      }

      if (!cancelled) {
        hydratedForUser.current = userKey;
      }
    }

    void hydrateDraft();

    return () => {
      cancelled = true;
    };
  }, [user, initialSiteId, router]);

  useEffect(() => {
    if (websiteData) {
      document.title = getBrandName(websiteData);
    }
  }, [websiteData]);

  function handleWebsiteDataChange(data: Website | null) {
    setWebsiteData(data);
    if (!data) {
      setActiveSiteId(null);
      if (!user) {
        clearGuestDraft();
      }
    }
  }

  const {
    status: deploymentStatus,
    liveUrl,
    error: deploymentError,
    isPublishing,
    startPolling,
    completeImmediately,
    markBuilding,
    failImmediately,
    reset: resetDeployment,
  } = useDeploymentPolling();

  async function handlePublish(subdomain: string) {
    if (!websiteData) {
      return;
    }

    markBuilding();

    try {
      const response = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          website: websiteData,
          subdomain,
          ...(activeSiteId ? { siteId: activeSiteId } : {}),
        }),
      });

      const result = (await response.json()) as PublishResponse;

      if (!response.ok || !result.success) {
        if (result.success === false && result.requiresAuth) {
          failImmediately(result.error);
          prepareSignIn();
          setAuthDialogOpen(true);
          return;
        }

        throw new Error(
          result.success === false
            ? result.error
            : `Publish request failed (HTTP ${response.status})`,
        );
      }

      if (result.siteId) {
        setActiveSiteId(result.siteId);
      }

      if (!user) {
        clearGuestDraft();
      }

      if (result.status === "READY") {
        completeImmediately(result.url);
        return;
      }

      startPolling(result.deploymentId, result.url);
    } catch (error) {
      const message =
        error instanceof TypeError
          ? "Could not reach the publish server. Check that the app is running and try again."
          : error instanceof Error
            ? error.message
            : "Failed to publish site";

      failImmediately(message);
    }
  }

  async function handleSave() {
    if (!websiteData) {
      toast.error("Generate a site before saving.");
      return;
    }

    if (!activeSiteId) {
      toast.error("No site draft to save. Scan a URL first.");
      return;
    }

    setIsSaving(true);

    try {
      const result = await saveSiteLayout(activeSiteId, websiteData);

      if (result.success) {
        toast.success("Progress saved to your account.");
      } else {
        toast.error(result.error);
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <DashboardHeader
        websiteData={websiteData}
        isPublishing={isPublishing}
        isSaving={isSaving}
        user={user}
        onPublish={handlePublish}
        onSave={handleSave}
        onPrepareSignIn={prepareSignIn}
      />

      <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <div className="mb-8 space-y-3 text-center md:mb-10">
          <p className="inline-flex items-center rounded-full border border-indigo-200/80 bg-indigo-50 px-3 py-1 text-xs font-medium tracking-wide text-indigo-700">
            AI Site Builder
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Generate your high-performance site
          </h1>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-slate-600 md:text-base">
            Enter a URL, let AI rebuild your layout for speed and conversion,
            then publish in one click.
          </p>
        </div>

        <div className="mx-auto w-full max-w-3xl space-y-6">
          <AuthRequiredDialog
            open={authDialogOpen}
            onOpenChange={setAuthDialogOpen}
            actionLabel="publish"
            onPrepareSignIn={prepareSignIn}
          />

          {deploymentStatus !== "IDLE" ? (
            <DeploymentStatusCard
              status={deploymentStatus}
              liveUrl={liveUrl}
              error={deploymentError}
              onDismiss={resetDeployment}
            />
          ) : null}

          <UrlInputForm
            websiteData={websiteData}
            onWebsiteDataChange={handleWebsiteDataChange}
            onSiteIdChange={setActiveSiteId}
            siteId={activeSiteId}
            user={user}
            onPrepareSignIn={prepareSignIn}
          />
        </div>
      </div>
    </>
  );
}
