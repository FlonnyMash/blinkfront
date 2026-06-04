"use client";

import { GenerationProgress } from "@/components/dashboard/generation-progress";
import { SeoPreview } from "@/components/dashboard/seo-preview";
import type { SessionUser } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import type { SeoAuditResult } from "@/lib/validations/seo-audit-result";

type SeoAuditPanelProps = {
  seoData: SeoAuditResult | null;
  isAuditing: boolean;
  isScraping?: boolean;
  isLoading?: boolean;
  isGenerating?: boolean;
  showAuditCta?: boolean;
  onOptimizeWithAI?: () => void;
  user?: SessionUser | null;
  onPrepareSignIn?: () => void;
  className?: string;
  entrance?: "fade" | "slide-up" | "none";
  embedProgress?: boolean;
};

export function SeoAuditPanel({
  seoData,
  isAuditing,
  isScraping = false,
  isLoading = false,
  isGenerating = false,
  showAuditCta = false,
  onOptimizeWithAI,
  user = null,
  onPrepareSignIn,
  className,
  entrance = "fade",
  embedProgress = false,
}: SeoAuditPanelProps) {
  const isScanning = isScraping || isAuditing;
  const showPanel = seoData !== null || isScanning;

  if (!showPanel) {
    return null;
  }

  return (
    <div
      className={cn(
        "w-full max-w-full overflow-hidden",
        entrance === "slide-up" && "animate-slide-up-panel",
        entrance === "fade" && "animate-fade-in",
        className,
      )}
    >
      <div className="w-full max-w-full overflow-hidden rounded-2xl border border-slate-200/60 bg-white/90 shadow-lg ring-1 ring-slate-200/50 backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-950/90 dark:ring-slate-800/50">
        {embedProgress ? (
          <GenerationProgress
            isLoading={isLoading}
            isAuditing={isAuditing}
            isGenerating={isGenerating}
            variant="embedded"
          />
        ) : null}
        <SeoPreview
          seoData={seoData}
          isAuditing={isAuditing || isScraping}
          isScraping={isScraping}
          isGenerating={isGenerating}
          pulseGrid={false}
          user={user}
          onPrepareSignIn={onPrepareSignIn}
          showOptimizeCta={showAuditCta}
          onOptimizeWithAI={onOptimizeWithAI}
          className={
            embedProgress
              ? "rounded-none border-0 bg-transparent shadow-none ring-0"
              : undefined
          }
        />
      </div>
    </div>
  );
}
