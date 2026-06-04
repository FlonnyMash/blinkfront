"use client";

import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SeoOptimizeCtaProps = {
  showAuditCta: boolean;
  onOptimizeWithAI: () => void;
  className?: string;
};

export function SeoOptimizeCta({
  showAuditCta,
  onOptimizeWithAI,
  className,
}: SeoOptimizeCtaProps) {
  return (
    <div
      className={cn(
        "shrink-0 transition-opacity duration-500",
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
          "relative isolate h-10 min-h-10 w-auto max-w-full shrink-0 overflow-hidden rounded-full border-0 bg-transparent p-0 text-sm shadow-none",
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
              "shadow-md shadow-indigo-600/25 transition-all duration-300",
              "group-hover/button:from-indigo-500 group-hover/button:via-violet-500 group-hover/button:to-indigo-600",
              "group-hover/button:shadow-lg group-hover/button:shadow-violet-500/35",
            )}
          />
          <span className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 via-white/5 to-transparent" />
          <span className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/20" />
        </span>
        <span className="relative z-10 inline-flex h-full w-full items-center justify-center gap-2 whitespace-nowrap px-6 font-medium text-white">
          <Sparkles
            className="size-4 shrink-0 text-white/95 transition-transform duration-300 group-hover/button:scale-110"
            aria-hidden
          />
          Optimize Layout with AI
        </span>
      </Button>
    </div>
  );
}
