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
      <div className="relative inline-flex">
        <span
          className={cn(
            "pointer-events-none absolute -right-0.5 -top-0.5 z-10 size-2.5 rounded-full bg-white/90 shadow-[0_0_10px_3px_rgba(255,255,255,0.55)]",
            showAuditCta && "animate-pulse",
          )}
          aria-hidden
        />
        <Button
          type="button"
          onClick={onOptimizeWithAI}
          disabled={!showAuditCta}
          tabIndex={showAuditCta ? 0 : -1}
          aria-label="Optimize layout with AI to fix SEO issues found in your audit"
          className={cn(
            "h-10 min-h-10 w-auto shrink-0 gap-0 whitespace-nowrap rounded-full border-0 px-5 text-sm",
            "bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600",
            "font-medium text-white",
            "ring-1 ring-inset ring-white/10",
            "shadow-lg shadow-indigo-500/30",
            "transition-all duration-300 ease-out",
            "hover:scale-[1.02] hover:from-indigo-500 hover:via-violet-500 hover:to-indigo-500 hover:shadow-xl hover:shadow-indigo-500/50",
            "active:translate-y-0 active:scale-95",
            "focus-visible:ring-3 focus-visible:ring-white/25",
            "disabled:pointer-events-none disabled:opacity-0",
          )}
        >
          <Sparkles
            className="mr-2 h-4 w-4 shrink-0 text-white"
            aria-hidden
          />
          Optimize Layout with AI
        </Button>
      </div>
    </div>
  );
}
