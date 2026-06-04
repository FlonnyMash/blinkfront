"use client";

import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SeoOptimizeCtaProps = {
  showAuditCta: boolean;
  onOptimizeWithAI: () => void;
  /** Fits inside the URL input bar (replaces Scan URL). */
  compact?: boolean;
  className?: string;
};

export function SeoOptimizeCta({
  showAuditCta,
  onOptimizeWithAI,
  compact = false,
  className,
}: SeoOptimizeCtaProps) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full transition-opacity duration-500",
        showAuditCta ? "opacity-100" : "pointer-events-none opacity-0",
        className,
      )}
      aria-hidden={!showAuditCta}
    >
      <Button
        type="button"
        onClick={onOptimizeWithAI}
        disabled={!showAuditCta}
        tabIndex={showAuditCta ? 0 : -1}
        aria-label="Optimize layout with AI to fix SEO issues found in your audit"
        className={cn(
          "relative isolate w-auto max-w-full shrink-0 overflow-hidden rounded-full border-0 bg-transparent p-0 shadow-none",
          compact ? "h-9 min-h-9 text-xs" : "h-10 min-h-10 text-sm",
          "transition-transform duration-300 ease-out",
          "hover:scale-[1.02] active:translate-y-0 active:scale-[0.98]",
          "ring-0 focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-violet-300/60",
          "disabled:pointer-events-none disabled:opacity-0",
        )}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
        >
          <span
            className={cn(
              "absolute inset-0 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700",
              "transition-all duration-300",
              "group-hover/button:from-indigo-500 group-hover/button:via-violet-500 group-hover/button:to-indigo-600",
            )}
          />
          <span className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 via-white/5 to-transparent" />
          <span className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/20" />
        </span>
        <span
          className={cn(
            "relative z-10 inline-flex h-full w-full items-center justify-center gap-1.5 font-medium whitespace-nowrap text-white",
            compact ? "px-4" : "gap-2 px-5 sm:px-6",
          )}
        >
          <Sparkles
            className={cn(
              "shrink-0 text-white/95 transition-transform duration-300 group-hover/button:scale-110",
              compact ? "size-3.5" : "size-4",
            )}
            aria-hidden
          />
          Optimize Layout with AI
        </span>
      </Button>
    </div>
  );
}
