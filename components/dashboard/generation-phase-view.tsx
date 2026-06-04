"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight, Check } from "lucide-react";

import { cn } from "@/lib/utils";

const TERMINAL_STEPS = [
  "✨ [SYSTEM]: Initializing structural scrapers...",
  "🎨 [ART DIRECTOR]: Structuring zero-token layout system & variants...",
  "✍️ [COPYWRITER]: Injecting optimized AIDA framework heuristics...",
  "🚀 [VITE / DEPLOY]: Pre-rendering static production HTML files...",
] as const;

const TERMINAL_STEP_MS = 2800;

type GenerationPhaseViewProps = {
  mode: "generating" | "ready";
  onEnterWorkspace?: () => void;
  className?: string;
};

function PhaseShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center text-center",
        className,
      )}
    >
      {children}
    </div>
  );
}

function AiCoreSpinner() {
  return (
    <div className="relative mb-8 flex items-center justify-center" aria-hidden>
      <div className="absolute size-20 rounded-full bg-indigo-500/15 blur-2xl will-change-transform" />
      <div
        className={cn(
          "relative size-16 rounded-full border-2 border-indigo-500/20 border-t-indigo-600",
          "animate-spin shadow-[0_0_50px_rgba(99,102,241,0.25)] will-change-transform",
        )}
      />
    </div>
  );
}

function TerminalLogFeed({ activeIndex }: { activeIndex: number }) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-md space-y-2 rounded-xl border border-slate-200/50 bg-white/40 p-4 text-left shadow-sm backdrop-blur-md",
        "font-mono text-xs tracking-tight text-slate-500",
        "dark:border-slate-800/50 dark:bg-slate-900/40",
      )}
      role="log"
      aria-live="polite"
      aria-label="AI factory terminal output"
    >
      {TERMINAL_STEPS.map((line, index) => {
        const isComplete = index < activeIndex;
        const isActive = index === activeIndex;
        const isPending = index > activeIndex;

        if (isPending) {
          return null;
        }

        return (
          <p
            key={line}
            className={cn(
              "transition-all duration-500 ease-out",
              isComplete && "text-slate-400/90 dark:text-slate-500",
              isActive &&
                "text-slate-700 dark:text-slate-200 [text-shadow:0_0_14px_rgba(99,102,241,0.35)] animate-pulse",
            )}
          >
            <span
              className={cn(
                "mr-2 inline-block size-1.5 rounded-full align-middle transition-colors duration-500",
                isComplete && "bg-slate-300 dark:bg-slate-600",
                isActive && "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]",
              )}
            />
            {line}
          </p>
        );
      })}
    </div>
  );
}

export function GenerationPhaseView({
  mode,
  onEnterWorkspace,
  className,
}: GenerationPhaseViewProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  useEffect(() => {
    if (mode !== "generating") {
      setActiveStepIndex(0);
      return;
    }

    const timer = window.setInterval(() => {
      setActiveStepIndex((prev) =>
        prev >= TERMINAL_STEPS.length - 1 ? prev : prev + 1,
      );
    }, TERMINAL_STEP_MS);

    return () => window.clearInterval(timer);
  }, [mode]);

  if (mode === "ready") {
    return (
      <PhaseShell className={className}>
        <div className="relative z-10 flex w-full animate-fade-in flex-col items-center text-center">
          <div className="relative mx-auto mb-6" aria-hidden>
            <div className="absolute -inset-3 rounded-full bg-indigo-500/10 blur-xl will-change-transform" />
            <div
              className={cn(
                "relative mx-auto flex size-14 items-center justify-center rounded-full",
                "border border-indigo-500/30 bg-indigo-500/10 text-indigo-600",
                "shadow-[0_0_40px_rgba(99,102,241,0.2)] animate-pulse",
                "dark:bg-indigo-500/20 dark:text-indigo-400",
              )}
            >
              <Check className="size-6" strokeWidth={2.5} />
            </div>
          </div>

          <h2 className="mb-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Your AI workspace is ready
          </h2>
          <p className="mx-auto mb-8 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            Layout synthesis is complete. Open the editor to refine your site and preview
            changes in real time.
          </p>

          <button
            type="button"
            onClick={onEnterWorkspace}
            className={cn(
              "group mx-auto flex items-center justify-center gap-2 rounded-full",
              "bg-indigo-600 px-8 py-3.5 text-sm font-medium text-white shadow-md",
              "transition-all duration-200 hover:bg-indigo-700 hover:shadow-indigo-500/20",
              "active:scale-[0.98]",
            )}
          >
            Enter AI Editor
            <ArrowRight
              className="size-4 text-white transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </button>
        </div>
      </PhaseShell>
    );
  }

  return (
    <PhaseShell className={className}>
      <AiCoreSpinner />
      <div className="mb-6 space-y-1">
        <p className="text-[10px] font-medium tracking-[0.2em] text-indigo-500/80 uppercase">
          AI Factory Terminal
        </p>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Synthesizing your workspace
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Layout pipeline active — background agents are composing your site.
        </p>
      </div>
      <TerminalLogFeed activeIndex={activeStepIndex} />
    </PhaseShell>
  );
}
