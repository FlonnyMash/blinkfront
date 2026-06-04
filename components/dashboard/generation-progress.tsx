"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type ScanPhase = "idle" | "scraping" | "auditing" | "generating";

type GenerationProgressProps = {
  isLoading: boolean;
  isAuditing: boolean;
  isGenerating: boolean;
  className?: string;
  variant?: "inline" | "embedded";
};

function resolvePhase(
  isLoading: boolean,
  isAuditing: boolean,
  isGenerating: boolean,
): ScanPhase {
  if (isGenerating) {
    return "generating";
  }
  if (isAuditing) {
    return "auditing";
  }
  if (isLoading) {
    return "scraping";
  }
  return "idle";
}

const PHASE_CONFIG: Record<
  Exclude<ScanPhase, "idle">,
  { label: string; floor: number; cap: number; tickMs: number }
> = {
  scraping: {
    label: "Scanning page…",
    floor: 6,
    cap: 46,
    tickMs: 140,
  },
  auditing: {
    label: "Analysing SEO…",
    floor: 42,
    cap: 92,
    tickMs: 160,
  },
  generating: {
    label: "Generating AI layout…",
    floor: 72,
    cap: 97,
    tickMs: 180,
  },
};

function useAnimatedScanProgress(phase: ScanPhase) {
  const [displayValue, setDisplayValue] = useState(0);
  const lastPhaseRef = useRef<ScanPhase>("idle");

  useEffect(() => {
    if (phase === "idle") {
      lastPhaseRef.current = "idle";
      return;
    }

    const { floor, cap, tickMs } = PHASE_CONFIG[phase];
    const enteredFromIdle = lastPhaseRef.current === "idle";
    lastPhaseRef.current = phase;

    setDisplayValue((current) =>
      enteredFromIdle ? floor : Math.max(current, floor),
    );

    const intervalId = window.setInterval(() => {
      setDisplayValue((current) => {
        if (current >= cap) {
          return Math.min(cap, current + 0.15 + Math.random() * 0.35);
        }
        const remaining = cap - current;
        const step = Math.max(0.35, remaining * 0.06 + Math.random() * 1.4);
        return Math.min(cap, current + step);
      });
    }, tickMs);

    return () => window.clearInterval(intervalId);
  }, [phase]);

  return phase === "idle" ? 0 : Math.round(displayValue);
}

function getProgressLabel(phase: ScanPhase): string {
  if (phase === "idle") {
    return "";
  }
  return PHASE_CONFIG[phase].label;
}

export function GenerationProgress({
  isLoading,
  isAuditing,
  isGenerating,
  className,
  variant = "inline",
}: GenerationProgressProps) {
  const phase = resolvePhase(isLoading, isAuditing, isGenerating);
  const isBusy = phase !== "idle";
  const displayValue = useAnimatedScanProgress(phase);

  if (!isBusy) {
    return null;
  }

  const label = getProgressLabel(phase);
  const isEmbedded = variant === "embedded";

  return (
    <div
      className={cn(
        "transition-opacity duration-300",
        isEmbedded
          ? "border-b border-slate-200/60 bg-slate-50/80 px-5 py-3.5 dark:border-slate-800/60 dark:bg-slate-900/40"
          : "space-y-2.5 rounded-2xl border border-slate-200/60 bg-white/90 px-4 py-3 shadow-sm ring-1 ring-slate-200/40 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-950/90 dark:ring-slate-800/50",
        className,
      )}
      role="progressbar"
      aria-live="polite"
      aria-valuenow={displayValue}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="relative flex size-2 shrink-0"
            aria-hidden
          >
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-indigo-400/70 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-indigo-500" />
          </span>
          <span
            className={cn(
              "truncate font-medium text-slate-800 dark:text-slate-100",
              isEmbedded ? "text-xs" : "text-sm",
            )}
          >
            {label}
          </span>
        </div>
        <span
          className={cn(
            "shrink-0 tabular-nums text-indigo-600/90 dark:text-indigo-400",
            isEmbedded ? "text-[0.65rem]" : "text-xs",
          )}
        >
          {displayValue}%
        </span>
      </div>
      <div
        className={cn(
          "relative overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800/80",
          isEmbedded ? "mt-2.5 h-1" : "mt-3 h-1.5",
        )}
      >
        <div
          className="h-full rounded-full bg-linear-to-r from-indigo-500 via-violet-500 to-indigo-400 transition-[width] duration-300 ease-out shadow-[0_0_12px_rgba(99,102,241,0.35)]"
          style={{ width: `${displayValue}%` }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 w-1/3 rounded-full bg-linear-to-r from-transparent via-white/35 to-transparent motion-safe:animate-[shimmer_2.2s_ease-in-out_infinite]"
          style={{ left: `${Math.max(0, displayValue - 28)}%` }}
          aria-hidden
        />
      </div>
    </div>
  );
}
