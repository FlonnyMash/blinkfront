"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowRight, BarChart3, Globe, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChatEditor } from "@/components/dashboard/chat-editor";
import { GenerationPhaseView } from "@/components/dashboard/generation-phase-view";
import { LivePreviewFrame } from "@/components/dashboard/live-preview-frame";
import { SeoAuditPanel } from "@/components/dashboard/seo-audit-results";
import { SeoPreview } from "@/components/dashboard/seo-preview";
import { ResumeSessionDialog } from "@/components/dashboard/resume-session-dialog";
import { StartNewScanDialog } from "@/components/dashboard/start-new-scan-dialog";
import type { SessionUser } from "@/lib/auth/session";
import { updateGuestDraftWebsite } from "@/lib/guest-draft";
import {
  discardVolatileBuilderSession,
  hasResumableVolatileSession,
  hydrateVolatileSession,
  loadVolatileDraft,
  saveVolatileDraft,
  type VolatileBuilderStep,
} from "@/lib/site-layout-client";
import type { ScrapeUrlResult } from "@/lib/scraper";
import type { SeoAuditResult } from "@/lib/validations/seo-audit-result";
import { cn, normalizeUrl } from "@/lib/utils";
import type { SeoAudit } from "@/lib/validations/seo";
import {
  BuilderHeroOrb,
  type BuilderBackgroundVariant,
} from "@/components/builder/builder-ambient-background";
import type { Website } from "@/types/layout";
import {
  useScanLayoutFlip,
  type ScanLayoutSnapshot,
} from "@/hooks/useScanLayoutFlip";

export type BuilderStep = "audit" | "generating" | "ready" | "workspace";
export type AuditView = "hero" | "seo";

type UrlInputFormProps = {
  websiteData: Website | null;
  onWebsiteDataChange: (data: Website | null) => void;
  siteId?: string | null;
  onSiteIdChange?: (siteId: string | null) => void;
  user?: SessionUser | null;
  onPrepareSignIn?: () => void;
  initialSeoData?: SeoAuditResult | null;
  initialSourceUrl?: string;
  initialWorkspaceCommitted?: boolean;
  initialVolatileStep?: VolatileBuilderStep | null;
  initialScrapeAudit?: SeoAudit | null;
  initialGuestId?: string;
  onCommitWorkspace?: (input: {
    seoData: SeoAuditResult | null;
    sourceUrl: string;
    guestId?: string;
  }) => void | Promise<void>;
  onAbandonVolatileSession?: () => void;
  onStepChange?: (step: BuilderStep) => void;
  onAuditViewChange?: (view: AuditView) => void;
  onBackgroundVariantChange?: (variant: BuilderBackgroundVariant) => void;
  onResetProject?: () => void;
};

type GenerateWebsiteApiResponse =
  | {
      success: true;
      data: Website;
      siteId?: string;
      guest?: boolean;
      guestId?: string;
    }
  | { success: false; error: string };

type SeoAuditApiResponse =
  | { success: true; data: SeoAuditResult }
  | { success: false; error: string };

const LAST_URL_STORAGE_KEY = "blinkfront:lastUrl";

function readStoredUrl(): string {
  try {
    return sessionStorage.getItem(LAST_URL_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

async function readApiError(response: Response, fallback: string): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? fallback;
  } catch {
    return fallback;
  }
}

function UrlInputCard({
  url,
  setUrl,
  setError,
  isScanBusy,
  isAuditing,
  isHeroLayout,
  handleSubmit,
}: {
  url: string;
  setUrl: (value: string) => void;
  setError: (value: string | null) => void;
  isScanBusy: boolean;
  isAuditing: boolean;
  isHeroLayout: boolean;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const showAiRing = isFocused || !isHeroLayout;

  return (
    <div
      className={cn(
        "relative mx-auto w-full overflow-hidden rounded-full",
        isHeroLayout ? "max-w-xl" : "max-w-2xl",
        showAiRing && "p-[2px]",
      )}
    >
      {showAiRing ? (
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
          <div
            className={cn(
              "absolute top-1/2 left-1/2 h-[200vmax] w-[200vmax] -translate-x-1/2 -translate-y-1/2",
              "bg-[conic-gradient(from_0deg,#818cf8,#a78bfa,#60a5fa,#f472b6,#22d3ee,#818cf8)]",
              "animate-ai-input-ring-spin animate-ai-input-ring-hue will-change-[transform,filter]",
            )}
          />
        </div>
      ) : null}
      <form
        onSubmit={handleSubmit}
        onFocusCapture={() => setIsFocused(true)}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
            setIsFocused(false);
          }
        }}
        className={cn(
          "relative z-10 mx-auto flex w-full items-center gap-2 rounded-full border bg-white p-1.5 transition-shadow duration-300 dark:border-slate-800 dark:bg-slate-950",
          isHeroLayout
            ? "h-14 ring-1 ring-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 dark:ring-slate-700"
            : "max-w-2xl border-slate-200/80 shadow-lg",
          !isHeroLayout &&
            showAiRing &&
            "border-transparent shadow-[0_0_32px_-8px_rgba(99,102,241,0.35)]",
        )}
      >
        <Globe
          className={cn(
            "ml-2 shrink-0 text-slate-400",
            isHeroLayout ? "size-5" : "size-4",
          )}
          aria-hidden
        />
        <input
          type="text"
          name="url"
          inputMode="url"
          autoComplete="url"
          placeholder="example.com"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError(null);
          }}
          disabled={isScanBusy}
          required
          className="min-w-0 flex-1 border-0 bg-transparent px-4 text-sm text-slate-900 outline-none focus:ring-0 focus-visible:ring-0 placeholder:text-slate-400 disabled:opacity-60 dark:text-slate-100"
        />
        <button
          type="submit"
          disabled={isScanBusy}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-full bg-indigo-600 px-5 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700 disabled:pointer-events-none disabled:opacity-60",
            isHeroLayout ? "h-11" : "h-9",
          )}
        >
          {isScanBusy ? (
            <>
              <Loader2 className="size-4 shrink-0 animate-spin text-white" aria-hidden />
              <span>{isAuditing ? "Analysing SEO…" : "Scanning…"}</span>
            </>
          ) : (
            <>
              <span>Scan URL</span>
              <ArrowRight className="size-4 shrink-0 text-white" aria-hidden />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export function UrlInputForm({
  websiteData,
  onWebsiteDataChange,
  siteId,
  onSiteIdChange,
  user = null,
  onPrepareSignIn,
  initialSeoData = null,
  initialSourceUrl = "",
  initialWorkspaceCommitted = false,
  initialVolatileStep = null,
  initialScrapeAudit = null,
  initialGuestId,
  onCommitWorkspace,
  onAbandonVolatileSession,
  onStepChange,
  onAuditViewChange,
  onBackgroundVariantChange,
  onResetProject,
}: UrlInputFormProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SeoAudit | null>(null);
  const [seoData, setSeoData] = useState<SeoAuditResult | null>(null);
  const [currentStep, setCurrentStep] = useState<BuilderStep>("audit");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [scanFlipSnapshot, setScanFlipSnapshot] =
    useState<ScanLayoutSnapshot | null>(null);

  const inputDockRef = useRef<HTMLDivElement>(null);
  const heroCopyRef = useRef<HTMLDivElement>(null);
  const panelSlotRef = useRef<HTMLDivElement>(null);

  const initialDraftSeeded = useRef(false);
  const restoredWorkspaceFromDraft = useRef(false);
  const restoredVolatileFromDraft = useRef(false);
  const mountResumeChecked = useRef(false);
  const currentStepRef = useRef(currentStep);
  const lastGuestIdRef = useRef<string | undefined>(initialGuestId);
  currentStepRef.current = currentStep;

  function resumeVolatileSession() {
    const draft = hydrateVolatileSession();
    if (!draft) {
      setIsResumeModalOpen(false);
      return;
    }

    if (draft.sourceUrl) {
      setUrl(draft.sourceUrl);
    }
    if (draft.seoData) {
      setSeoData(draft.seoData);
    }
    if (draft.scrapeAudit) {
      setData(draft.scrapeAudit);
    }
    if (draft.website) {
      onWebsiteDataChange(draft.website);
    }
    if (draft.siteId) {
      onSiteIdChange?.(draft.siteId);
    }
    if (draft.guestId) {
      lastGuestIdRef.current = draft.guestId;
    }

    setCurrentStep(draft.step);
    restoredVolatileFromDraft.current = true;
    initialDraftSeeded.current = true;
    setIsResumeModalOpen(false);
  }

  function handleDiscardResumeSession() {
    discardVolatileBuilderSession();
    onAbandonVolatileSession?.();
    setIsResumeModalOpen(false);
  }

  useEffect(() => {
    if (mountResumeChecked.current) {
      return;
    }
    mountResumeChecked.current = true;

    if (initialVolatileStep || initialWorkspaceCommitted) {
      return;
    }

    if (currentStep === "audit" && hasResumableVolatileSession()) {
      setIsResumeModalOpen(true);
      return;
    }

    if (loadVolatileDraft()) {
      discardVolatileBuilderSession();
    }
  }, []);

  useEffect(() => {
    const stored = readStoredUrl();
    if (stored) {
      setUrl(stored);
    }
  }, []);

  useEffect(() => {
    if (initialDraftSeeded.current) {
      return;
    }
    if (initialWorkspaceCommitted && initialSeoData) {
      setSeoData(initialSeoData);
    }
    if (initialSourceUrl) {
      setUrl(initialSourceUrl);
    }
    if (initialWorkspaceCommitted && (initialSeoData || initialSourceUrl)) {
      initialDraftSeeded.current = true;
    }
  }, [initialSeoData, initialSourceUrl, initialWorkspaceCommitted]);

  useEffect(() => {
    if (!initialVolatileStep || restoredVolatileFromDraft.current) {
      return;
    }
    if (initialSeoData) {
      setSeoData(initialSeoData);
    }
    if (initialSourceUrl) {
      setUrl(initialSourceUrl);
    }
    if (initialScrapeAudit) {
      setData(initialScrapeAudit);
    }
    if (initialGuestId) {
      lastGuestIdRef.current = initialGuestId;
    }
    setCurrentStep(initialVolatileStep);
    restoredVolatileFromDraft.current = true;
    initialDraftSeeded.current = true;
  }, [
    initialVolatileStep,
    initialSeoData,
    initialSourceUrl,
    initialScrapeAudit,
    initialGuestId,
  ]);

  useEffect(() => {
    try {
      if (url.trim()) {
        sessionStorage.setItem(LAST_URL_STORAGE_KEY, url);
      } else {
        sessionStorage.removeItem(LAST_URL_STORAGE_KEY);
      }
    } catch {
      // sessionStorage unavailable (private mode, quota, etc.)
    }
  }, [url]);

  useEffect(() => {
    onStepChange?.(currentStep);
  }, [currentStep, onStepChange]);

  useEffect(() => {
    if (!websiteData) {
      restoredWorkspaceFromDraft.current = false;
      if (
        !initialVolatileStep &&
        (currentStep === "workspace" || currentStep === "ready")
      ) {
        setCurrentStep("audit");
      }
      return;
    }

    if (restoredWorkspaceFromDraft.current || restoredVolatileFromDraft.current) {
      return;
    }

    if (initialWorkspaceCommitted) {
      setCurrentStep("workspace");
      restoredWorkspaceFromDraft.current = true;
    }
  }, [websiteData, initialWorkspaceCommitted, initialVolatileStep, currentStep]);

  function handleWebsiteUpdate(data: Website) {
    onWebsiteDataChange(data);
    if (!user) {
      updateGuestDraftWebsite(data);
    }
  }

  function handleConfirmReset() {
    discardVolatileBuilderSession();
    setUrl("");
    setError(null);
    setData(null);
    setSeoData(null);
    setIsLoading(false);
    setIsAuditing(false);
    setIsGenerating(false);
    setIsSidebarCollapsed(false);
    setCurrentStep("audit");
    setScanFlipSnapshot(null);
    resetScanFlip();
    restoredWorkspaceFromDraft.current = false;
    restoredVolatileFromDraft.current = false;
    initialDraftSeeded.current = false;
    lastGuestIdRef.current = undefined;
    try {
      sessionStorage.removeItem(LAST_URL_STORAGE_KEY);
    } catch {
      // sessionStorage unavailable
    }
    onWebsiteDataChange(null);
    onSiteIdChange?.(null);
    onResetProject?.();
  }

  useEffect(() => {
    return () => {
      if (
        currentStepRef.current === "generating" ||
        currentStepRef.current === "ready"
      ) {
        onAbandonVolatileSession?.();
      }
    };
  }, [onAbandonVolatileSession]);

  const isScanBusy = isLoading || isAuditing;
  const chatEditorKey = siteId ?? "draft";
  const previewKey = siteId ?? "preview";
  const showAuditResults = seoData !== null || isAuditing || isLoading;
  const isHeroAtRest = !showAuditResults;
  const isHeroLayout = isHeroAtRest;
  const showAuditCta = currentStep === "audit" && seoData !== null && !isScanBusy;

  const {
    flipStyles,
    isAnimating: isScanFlipAnimating,
    resetFlip: resetScanFlip,
  } = useScanLayoutFlip(
    showAuditResults,
    scanFlipSnapshot,
    inputDockRef,
    panelSlotRef,
    () => setScanFlipSnapshot(null),
  );

  const showHeroCopy = isHeroAtRest || scanFlipSnapshot !== null;

  const onBackgroundVariantChangeRef = useRef(onBackgroundVariantChange);
  const onAuditViewChangeRef = useRef(onAuditViewChange);
  onBackgroundVariantChangeRef.current = onBackgroundVariantChange;
  onAuditViewChangeRef.current = onAuditViewChange;

  useLayoutEffect(() => {
    const isHero = currentStep === "audit" && isHeroAtRest;
    const useAmbientDots =
      currentStep === "generating" || currentStep === "ready" || !isHero;
    onBackgroundVariantChangeRef.current?.(useAmbientDots ? "dots" : "hero-orb");
    onAuditViewChangeRef.current?.(isHero ? "hero" : "seo");
  }, [currentStep, isHeroAtRest, websiteData]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formUrl = e.currentTarget.elements.namedItem("url");
    const rawUrl =
      formUrl instanceof HTMLInputElement
        ? formUrl.value
        : String(new FormData(e.currentTarget).get("url") ?? url);
    const normalizedUrl = normalizeUrl(rawUrl);

    if (!normalizedUrl) {
      setError("Please enter a URL");
      return;
    }

    setUrl(normalizedUrl);
    setCurrentStep("audit");

    if (isHeroAtRest && inputDockRef.current) {
      setScanFlipSnapshot({
        input: inputDockRef.current.getBoundingClientRect(),
        copy: heroCopyRef.current?.getBoundingClientRect(),
      });
    }

    setIsLoading(true);
    setIsAuditing(false);
    setIsGenerating(false);
    setError(null);
    setData(null);
    setSeoData(null);
    onWebsiteDataChange(null);
    onSiteIdChange?.(null);

    let scanFinishedWithResults = false;

    try {
      const scrapeResponse = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalizedUrl }),
      });

      if (!scrapeResponse.ok) {
        setError(await readApiError(scrapeResponse, "Failed to scrape URL"));
        return;
      }

      const scrapedResult = (await scrapeResponse.json()) as ScrapeUrlResult;

      if (!scrapedResult.success) {
        setError(scrapedResult.error);
        return;
      }

      setData(scrapedResult.data);
      setIsLoading(false);
      setIsAuditing(true);

      const auditResponse = await fetch("/api/seo-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: scrapedResult.data.url }),
      });

      const auditResult = (await auditResponse.json()) as SeoAuditApiResponse;

      if (!auditResponse.ok || !auditResult.success) {
        setError(
          auditResult.success === false
            ? auditResult.error
            : await readApiError(auditResponse, "SEO audit failed"),
        );
        return;
      }

      setSeoData(auditResult.data);
      setIsAuditing(false);
      scanFinishedWithResults = true;
    } catch (requestError) {
      setError(
        requestError instanceof TypeError
          ? "Could not reach the server. Check that the app is running and try again."
          : requestError instanceof Error
            ? requestError.message
            : "An unexpected error occurred",
      );
    } finally {
      setIsLoading(false);
      setIsAuditing(false);
      if (!scanFinishedWithResults) {
        setScanFlipSnapshot(null);
        resetScanFlip();
      }
    }
  }

  async function handleFixWithAI() {
    if (!data || !seoData) {
      setError("Run an SEO scan before generating your workspace.");
      return;
    }

    setCurrentStep("generating");
    setIsGenerating(true);
    setError(null);

    saveVolatileDraft({
      step: "generating",
      sourceUrl: data.url,
      seoData,
      scrapeAudit: data,
      siteId: siteId ?? null,
      guestId: lastGuestIdRef.current,
    });

    try {
      const generateResponse = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scrapedContent: data.rawContent,
          seoAudit: seoData,
          siteTitle: data.meta.title,
          sourceUrl: data.url,
        }),
      });

      const aiResult = (await generateResponse.json()) as GenerateWebsiteApiResponse;

      if (!generateResponse.ok || !aiResult.success) {
        discardVolatileBuilderSession();
        setCurrentStep("audit");
        setError(
          aiResult.success === false
            ? aiResult.error
            : await readApiError(generateResponse, "Failed to generate website"),
        );
        return;
      }

      onWebsiteDataChange(aiResult.data);
      if (aiResult.siteId) {
        onSiteIdChange?.(aiResult.siteId);
      } else {
        onSiteIdChange?.(null);
      }

      if (aiResult.guestId) {
        lastGuestIdRef.current = aiResult.guestId;
      }

      if (aiResult.guest) {
        toast.success(
          aiResult.siteId
            ? "Layout ready — enter the AI Editor when you are ready. Sign up to save your progress."
            : "Layout ready — enter the AI Editor when you are ready. Sign in to save to the cloud.",
        );
      } else {
        toast.success("Your AI layout is ready. Enter the editor when you are ready.");
      }

      setCurrentStep("ready");

      saveVolatileDraft({
        step: "ready",
        sourceUrl: data.url,
        seoData,
        scrapeAudit: data,
        website: aiResult.data,
        siteId: aiResult.siteId ?? null,
        guestId: aiResult.guestId ?? lastGuestIdRef.current,
      });
    } catch (requestError) {
      discardVolatileBuilderSession();
      setCurrentStep("audit");
      setError(
        requestError instanceof TypeError
          ? "Could not reach the server. Check that the app is running and try again."
          : requestError instanceof Error
            ? requestError.message
            : "An unexpected error occurred",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  const urlInputCard = (
    <UrlInputCard
      url={url}
      setUrl={setUrl}
      setError={setError}
      isScanBusy={isScanBusy}
      isAuditing={isAuditing}
      isHeroLayout={isHeroLayout}
      handleSubmit={handleSubmit}
    />
  );

  const errorAlert = error ? (
    <p className="text-sm text-red-500" role="alert">
      {error}
    </p>
  ) : null;

  const seoAuditPanelBlock = showAuditResults ? (
    <SeoAuditPanel
      seoData={seoData}
      isAuditing={isAuditing}
      isScraping={isLoading && !isAuditing}
      isLoading={isLoading}
      showAuditCta={showAuditCta}
      onOptimizeWithAI={() => void handleFixWithAI()}
      user={user}
      onPrepareSignIn={onPrepareSignIn}
      entrance={scanFlipSnapshot || isScanFlipAnimating ? "none" : "fade"}
      embedProgress
    />
  ) : null;

  const showPhaseOverlay =
    currentStep === "generating" ||
    (currentStep === "ready" && websiteData !== null);

  const resumeSessionDialog = (
    <ResumeSessionDialog
      open={isResumeModalOpen}
      onResume={resumeVolatileSession}
      onStartNew={handleDiscardResumeSession}
    />
  );

  if (showPhaseOverlay) {
    return (
      <>
        {resumeSessionDialog}
        <div className="fixed inset-0 z-50 flex h-full w-full items-center justify-center bg-slate-50/50 backdrop-blur-sm dark:bg-slate-950/50">
        <div className="flex w-full max-w-md flex-col items-center justify-center px-4">
          <GenerationPhaseView
            mode={currentStep === "ready" ? "ready" : "generating"}
            onEnterWorkspace={
              currentStep === "ready"
                ? () => {
                    void (async () => {
                      if (siteId) {
                        await onCommitWorkspace?.({
                          seoData,
                          sourceUrl: url || data?.url || "",
                          guestId: lastGuestIdRef.current,
                        });
                      }
                      setCurrentStep("workspace");
                    })();
                  }
                : undefined
            }
          />
        </div>
        </div>
      </>
    );
  }

  if (currentStep === "workspace" && websiteData) {
    return (
      <>
        {resumeSessionDialog}
        <div className="relative z-10 grid w-full grid-cols-1 gap-4 antialiased transition-opacity duration-200 ease-in-out md:grid-cols-12 md:gap-6 md:h-[calc(100vh-4rem)] md:overflow-hidden">
        <aside
          className={cn(
            "flex flex-col gap-4 transition-all duration-300 md:col-span-4 md:overflow-y-auto md:pr-2",
            isSidebarCollapsed && "hidden",
          )}
        >
          <StartNewScanDialog
            onConfirm={handleConfirmReset}
            trigger={
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto w-fit justify-start px-0 text-sm font-normal text-slate-500 hover:bg-transparent hover:text-slate-900"
              >
                ← Scan Another URL
              </Button>
            }
          />
          <ChatEditor
            key={chatEditorKey}
            currentWebsite={websiteData}
            siteId={siteId ?? undefined}
            seoInsights={seoData ? JSON.stringify(seoData) : undefined}
            onUpdate={handleWebsiteUpdate}
          />
          {seoData ? (
            <Accordion type="single" collapsible>
              <AccordionItem
                value="seo-audit"
                className="rounded-xl border border-border bg-card px-4"
              >
                <AccordionTrigger className="gap-2 py-3 hover:no-underline">
                  <BarChart3 className="size-4 shrink-0 text-slate-500" aria-hidden />
                  View Original SEO Audit
                </AccordionTrigger>
                <AccordionContent>
                  <SeoPreview
                    variant="compact"
                    seoData={seoData}
                    user={user}
                    onPrepareSignIn={onPrepareSignIn}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : null}
        </aside>
        <section
          className={cn(
            "flex min-h-[min(70vh,720px)] flex-col transition-all duration-300 md:h-full md:min-h-0",
            isSidebarCollapsed ? "md:col-span-12" : "md:col-span-8",
          )}
        >
          <LivePreviewFrame
            key={previewKey}
            websiteData={websiteData}
            siteId={siteId ?? undefined}
            sourceUrl={url}
            onConfirmReset={handleConfirmReset}
            onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
            isSidebarCollapsed={isSidebarCollapsed}
          />
        </section>
        </div>
      </>
    );
  }

  const heroCopyFlightStyle =
    scanFlipSnapshot?.copy && !isHeroAtRest
      ? {
          top: scanFlipSnapshot.copy.top,
          left: scanFlipSnapshot.copy.left,
          width: scanFlipSnapshot.copy.width,
        }
      : undefined;

  const heroCopyBlock = showHeroCopy ? (
    <div
      ref={heroCopyRef}
      style={heroCopyFlightStyle}
      className={cn(
        "w-[min(100%,42rem)] px-4 text-center",
        isHeroAtRest
          ? "pointer-events-none absolute bottom-full left-1/2 z-1 mb-3 w-full -translate-x-1/2"
          : "pointer-events-none fixed z-[5]",
        isScanFlipAnimating && "animate-hero-copy-capsule-exit",
        !isHeroAtRest &&
          !scanFlipSnapshot &&
          "pointer-events-none hidden",
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <p className="inline-flex items-center rounded-full border border-indigo-200/80 bg-indigo-50 px-3 py-1 text-xs font-medium tracking-wide text-indigo-700">
          AI Site Builder
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
          Generate your high-performance website
        </h1>
        <p className="text-sm leading-relaxed text-slate-600 md:text-base">
          Enter a URL, let AI rebuild your layout for speed and conversion,
          then publish in one click.
        </p>
      </div>
    </div>
  ) : null;

  const inputDockBlock = (
    <div
      ref={inputDockRef}
      style={flipStyles.input}
      className={cn(
        "relative w-full will-change-transform",
        isHeroAtRest && "z-2",
        !isHeroAtRest && "z-10 mx-auto max-w-2xl",
        isScanFlipAnimating && "z-20",
      )}
    >
      <div className="w-full">{urlInputCard}</div>
      {errorAlert}
    </div>
  );

  const heroInputStack = (
    <div className="relative w-full overflow-visible">
      {isHeroAtRest ? <BuilderHeroOrb /> : null}
      {inputDockBlock}
      {heroCopyBlock}
    </div>
  );

  return (
    <>
      {resumeSessionDialog}
      <section
        aria-label="URL scan"
        className={cn(
          "relative z-10 w-full flex-1",
          isHeroAtRest ? "min-h-0" : "mx-auto flex max-w-7xl flex-col gap-y-6 px-4",
        )}
      >
        {isHeroAtRest ? (
          <div className="pointer-events-none fixed inset-x-0 top-1/2 z-10 flex -translate-y-1/2 justify-center px-4">
            <div className="pointer-events-auto w-full max-w-xl">
              {heroInputStack}
            </div>
          </div>
        ) : (
          <>
            {heroInputStack}
            {showAuditResults ? (
              <div
                ref={panelSlotRef}
                style={flipStyles.panel}
                className={cn(
                  "w-full origin-top will-change-transform",
                  (scanFlipSnapshot || isScanFlipAnimating) &&
                    "min-h-[min(420px,58vh)]",
                )}
              >
                {seoAuditPanelBlock}
              </div>
            ) : null}
          </>
        )}
      </section>
    </>
  );
}
