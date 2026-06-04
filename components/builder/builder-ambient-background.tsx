"use client";

import { cn } from "@/lib/utils";

export type BuilderBackgroundVariant = "hero-orb" | "dots";

type BuilderAmbientBackgroundProps = {
  variant: BuilderBackgroundVariant;
};

const shellClass =
  "pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-slate-50 transition-opacity duration-500 dark:bg-slate-950";

const heroOrbMultiLight =
  "bg-[radial-gradient(circle_at_22%_32%,rgb(129_140_248/0.42),transparent_58%),radial-gradient(circle_at_78%_38%,rgb(192_132_252/0.38),transparent_55%),radial-gradient(circle_at_48%_72%,rgb(96_165_250/0.36),transparent_52%),radial-gradient(circle_at_62%_55%,rgb(244_114_182/0.28),transparent_48%)]";

const heroOrbMultiDark =
  "bg-[radial-gradient(circle_at_22%_32%,rgb(99_102_241/0.32),transparent_58%),radial-gradient(circle_at_78%_38%,rgb(139_92_246/0.28),transparent_55%),radial-gradient(circle_at_48%_72%,rgb(59_130_246/0.28),transparent_52%),radial-gradient(circle_at_62%_55%,rgb(217_70_239/0.24),transparent_48%)]";

const heroOrbConicLight =
  "bg-[conic-gradient(from_0deg,rgb(129_140_248/0.3),rgb(167_139_250/0.26),rgb(96_165_250/0.26),rgb(232_121_249/0.24),rgb(103_232_249/0.24),rgb(129_140_248/0.3))]";

const heroOrbConicDark =
  "bg-[conic-gradient(from_0deg,rgb(99_102_241/0.24),rgb(139_92_246/0.2),rgb(59_130_246/0.2),rgb(217_70_239/0.18),rgb(34_211_238/0.18),rgb(99_102_241/0.24))]";

/** Glow behind the hero stack; parent must be `position: relative`. */
export function BuilderHeroOrb() {
  return (
    <div className="builder-hero-orb-glow" aria-hidden>
      <div className="builder-hero-orb-glow__pulse size-full rounded-full blur-[92px] md:blur-[104px]">
        <div className="relative size-full overflow-hidden rounded-full animate-hero-orb-hue will-change-[filter]">
          <div
            className={cn(
              "absolute inset-0 origin-center animate-hero-orb-spin will-change-transform",
              heroOrbConicLight,
              "dark:hidden",
            )}
          />
          <div
            className={cn(
              "absolute inset-0 hidden origin-center animate-hero-orb-spin will-change-transform dark:block",
              heroOrbConicDark,
            )}
          />
          <div
            className={cn(
              "absolute inset-0 rounded-full dark:hidden",
              heroOrbMultiLight,
            )}
          />
          <div
            className={cn(
              "absolute inset-0 hidden rounded-full dark:block",
              heroOrbMultiDark,
            )}
          />
        </div>
      </div>
    </div>
  );
}

export function BuilderAmbientBackground({
  variant,
}: BuilderAmbientBackgroundProps) {
  if (variant === "hero-orb") {
    return <div className={shellClass} aria-hidden />;
  }

  return (
    <div className={shellClass} aria-hidden>
      <div className="absolute -top-32 left-1/4 size-112 rounded-full bg-blue-400/15 blur-3xl dark:bg-blue-500/10" />
      <div className="absolute top-1/3 -right-24 size-128 rounded-full bg-purple-400/10 blur-3xl dark:bg-purple-500/8" />
      <div className="absolute -bottom-40 left-1/3 size-104 rounded-full bg-indigo-400/10 blur-3xl dark:bg-indigo-500/8" />
    </div>
  );
}
