"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { DashboardHeader } from "@/components/dashboard/header";
import { DeploymentStatusCard } from "@/components/dashboard/deployment-status-card";
import { UrlInputForm } from "@/components/dashboard/url-input-form";
import { AuthRequiredDialog } from "@/components/dashboard/auth-required-dialog";
import { useDeploymentPolling } from "@/hooks/useDeploymentPolling";
import type { SessionUser } from "@/lib/auth/session";
import { clearGuestDraft, loadGuestDraft } from "@/lib/guest-draft";
import { fetchSiteLayout, saveSiteLayout } from "@/lib/site-layout-client";
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
  const [websiteData, setWebsiteData] = useState<Website | null>(null);
  const [activeSiteId, setActiveSiteId] = useState<string | null>(null);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const hydrationDone = useRef(false);

  useEffect(() => {
    if (hydrationDone.current) {
      return;
    }

    let cancelled = false;

    async function hydrateDraft() {
      const guestDraft = loadGuestDraft();

      if (guestDraft) {
        if (!cancelled) {
          setWebsiteData(guestDraft.website);
          setActiveSiteId(guestDraft.siteId);
        }

        if (user) {
          const saved = await saveSiteLayout(
            guestDraft.siteId,
            guestDraft.website,
          );
          if (!cancelled) {
            if (saved.success) {
              clearGuestDraft();
            } else {
              toast.error(saved.error);
            }
          }
        }

        hydrationDone.current = true;
        return;
      }

      if (!user) {
        hydrationDone.current = true;
        return;
      }

      const siteIdToLoad = initialSiteId ?? null;
      if (!siteIdToLoad) {
        hydrationDone.current = true;
        return;
      }

      const loaded = await fetchSiteLayout(siteIdToLoad);
      if (!cancelled && loaded.success) {
        setWebsiteData(loaded.data);
        setActiveSiteId(siteIdToLoad);
      }

      hydrationDone.current = true;
    }

    void hydrateDraft();

    return () => {
      cancelled = true;
    };
  }, [user, initialSiteId]);

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
    <div className="w-full space-y-6">
      <DashboardHeader
        websiteData={websiteData}
        isPublishing={isPublishing}
        isSaving={isSaving}
        user={user}
        onPublish={handlePublish}
        onSave={handleSave}
      />

      <AuthRequiredDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        actionLabel="publish"
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
      />
    </div>
  );
}
