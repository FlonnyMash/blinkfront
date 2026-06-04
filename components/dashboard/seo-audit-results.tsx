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
  user = null,
  onPrepareSignIn,
  className,
  entrance = "fade",
  embedProgress = false,
}: SeoAuditPanelProps) {
  const isScanning = isScraping || isAuditing;
  const showPanel = seoData !== null || isScanning;
  const embedProgressVisible =
    embedProgress && (isLoading || isAuditing || isGenerating);

  if (!showPanel) {
    return null;
  }

  return (
    <div
      className={cn(
        "min-h-min w-full max-w-full",
        entrance === "slide-up" && "animate-slide-up-panel",
        entrance === "fade" && "animate-fade-in",
        className,
      )}
    >
      <div className="min-h-min w-full max-w-full isolate rounded-2xl border border-slate-200/60 bg-white/90 shadow-lg ring-1 ring-slate-200/50 dark:border-slate-800/60 dark:bg-slate-950/90 dark:ring-slate-800/50">
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
          className={
            embedProgress
              ? cn(
                  "overflow-visible border-0 bg-transparent shadow-none ring-0 backdrop-blur-none rounded-b-2xl",
                  embedProgressVisible
                    ? "rounded-t-none"
                    : "rounded-none rounded-t-2xl",
                )
              : "overflow-visible"
          }
        />
      </div>
    </div>
  );
}
