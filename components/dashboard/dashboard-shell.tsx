"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  BuilderAmbientBackground,
  type BuilderBackgroundVariant,
} from "@/components/builder/builder-ambient-background";
import { BuilderFloatingBubbles } from "@/components/builder/builder-floating-bubbles";
import { DashboardHeader } from "@/components/dashboard/header";
import { DeploymentStatusCard } from "@/components/dashboard/deployment-status-card";
import {
  UrlInputForm,
  type AuditView,
  type BuilderStep,
} from "@/components/dashboard/url-input-form";
import { AuthRequiredDialog } from "@/components/dashboard/auth-required-dialog";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { useDeploymentPolling } from "@/hooks/useDeploymentPolling";
import type { SessionUser } from "@/lib/auth/session";
import { clearGuestDraft } from "@/lib/guest-draft";
import {
  clearPendingDraft,
  commitPendingDraftFromBuilder,
  consumeSkipSiteIdHydration,
  discardVolatileBuilderSession,
  fetchSiteLayout,
  loadCommittedPendingDraft,
  savePendingDraftFromBuilder,
  saveSiteLayout,
  syncPendingDraftAfterAuth,
} from "@/lib/site-layout-client";
import type { SeoAuditResult } from "@/lib/validations/seo-audit-result";
import { getBrandName, type Website } from "@/types/layout";
import { cn } from "@/lib/utils";

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
  const [builderStep, setBuilderStep] = useState<BuilderStep>("audit");
  const [auditView, setAuditView] = useState<AuditView>("hero");
  const [backgroundVariant, setBackgroundVariant] =
    useState<BuilderBackgroundVariant>("hero-orb");
  const [initialSeoData, setInitialSeoData] = useState<SeoAuditResult | null>(
    null,
  );
  const [initialSourceUrl, setInitialSourceUrl] = useState("");
  const [initialWorkspaceCommitted, setInitialWorkspaceCommitted] =
    useState(false);
  const [hydrationReady, setHydrationReady] = useState(false);
  const hydratedForUser = useRef<string | null>(null);
  const mountChecked = useRef(false);

  useEffect(() => {
    if (mountChecked.current) {
      return;
    }
    mountChecked.current = true;
    setHydrationReady(true);
  }, []);

  const prepareSignIn = useCallback(() => {
    if (builderStep !== "workspace") {
      return;
    }
    savePendingDraftFromBuilder({
      siteId: activeSiteId,
      website: websiteData,
    });
  }, [activeSiteId, websiteData, builderStep]);

  const handleCommitWorkspace = useCallback(
    async (input: {
      seoData: SeoAuditResult | null;
      sourceUrl: string;
      guestId?: string;
    }) => {
      if (!websiteData || !activeSiteId) {
        return;
      }

      commitPendingDraftFromBuilder({
        siteId: activeSiteId,
        website: websiteData,
        seoData: input.seoData,
        sourceUrl: input.sourceUrl,
        guestId: input.guestId,
      });

      if (user) {
        const saved = await saveSiteLayout(activeSiteId, websiteData);
        if (!saved.success) {
          toast.error(saved.error);
        }
      }
    },
    [activeSiteId, user, websiteData],
  );

  const handleAbandonVolatileSession = useCallback(() => {
    setWebsiteData(null);
    setActiveSiteId(null);
    setInitialSeoData(null);
    setInitialWorkspaceCommitted(false);
  }, []);

  useEffect(() => {
    if (!hydrationReady) {
      return;
    }

    const userKey = user?.id ?? "guest";
    if (hydratedForUser.current === userKey) {
      return;
    }

    let cancelled = false;

    async function hydrateDraft() {
      const committedDraft = loadCommittedPendingDraft();

      if (committedDraft) {
        if (!cancelled) {
          setWebsiteData(committedDraft.website);
          setActiveSiteId(committedDraft.siteId);
          setInitialSeoData(committedDraft.seoData ?? null);
          setInitialSourceUrl(committedDraft.sourceUrl ?? "");
          setInitialWorkspaceCommitted(true);
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
      if (siteIdToLoad && !consumeSkipSiteIdHydration()) {
        const loaded = await fetchSiteLayout(siteIdToLoad);
        if (!cancelled && loaded.success) {
          setWebsiteData(loaded.data);
          setActiveSiteId(siteIdToLoad);
          setInitialWorkspaceCommitted(true);
        }
      }

      if (!cancelled) {
        hydratedForUser.current = userKey;
      }
    }

    void hydrateDraft();

    return () => {
      cancelled = true;
    };
  }, [user, initialSiteId, router, hydrationReady]);

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

  const handleResetProject = useCallback(() => {
    discardVolatileBuilderSession();
    clearPendingDraft();
    clearGuestDraft();
    setWebsiteData(null);
    setActiveSiteId(null);
    setInitialSeoData(null);
    setInitialSourceUrl("");
    setInitialWorkspaceCommitted(false);
  }, []);

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

  const isImmersive =
    builderStep === "generating" ||
    builderStep === "ready" ||
    builderStep === "workspace";
  const showMarketingFooter = !isImmersive;
  const isHeroView = auditView === "hero" && !isImmersive;

  return (
    <div className="relative isolate flex min-h-dvh flex-col antialiased md:h-dvh md:overflow-hidden md:overscroll-none">
      {!isHeroView ? <BuilderFloatingBubbles /> : null}
      <BuilderAmbientBackground variant={backgroundVariant} />
      <div className="relative z-10 flex flex-1 flex-col md:h-full md:min-h-0">
        <header className="shrink-0">
          <DashboardHeader
            websiteData={websiteData}
            isPublishing={isPublishing}
            isSaving={isSaving}
            user={user}
            onPublish={handlePublish}
            onSave={handleSave}
            onPrepareSignIn={prepareSignIn}
          />
        </header>

        <main className="relative flex w-full flex-1 flex-col md:min-h-0 md:overflow-hidden md:overscroll-none">
          <div
            className={cn(
              "mx-auto flex w-full flex-col px-6",
              isImmersive
                ? "max-w-full flex-1 gap-y-6 py-4 md:h-full md:overflow-hidden"
                : isHeroView
                  ? "max-w-7xl flex-1 md:h-full md:overflow-hidden"
                  : "max-w-7xl flex-1 py-6 md:min-h-0 md:overflow-y-auto md:overscroll-none md:py-8",
              !isImmersive && !isHeroView && "gap-y-6",
            )}
          >
            <div
              className={cn(
                "flex w-full flex-col",
                (isImmersive || isHeroView) && "flex-1 md:h-full md:min-h-0",
                !isImmersive && !isHeroView && "flex-1 gap-y-6 md:min-h-0",
              )}
            >
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
                initialSeoData={initialSeoData}
                initialSourceUrl={initialSourceUrl}
                initialWorkspaceCommitted={initialWorkspaceCommitted}
                onCommitWorkspace={handleCommitWorkspace}
                onAbandonVolatileSession={handleAbandonVolatileSession}
                onStepChange={setBuilderStep}
                onAuditViewChange={setAuditView}
                onBackgroundVariantChange={setBackgroundVariant}
                onResetProject={handleResetProject}
              />
            </div>
          </div>
        </main>

        {showMarketingFooter ? (
          <footer className="mt-auto shrink-0 border-t border-slate-200 py-8 dark:border-slate-800">
            <MarketingFooter />
          </footer>
        ) : null}
      </div>
    </div>
  );
}
