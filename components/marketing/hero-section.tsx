import { MarketingCtaButton } from "@/components/marketing/marketing-cta-button";
import { cn } from "@/lib/utils";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28 lg:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div
          className={cn(
            "absolute inset-0 bg-[linear-gradient(to_right,oklch(0.556_0_0/0.06)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.556_0_0/0.06)_1px,transparent_1px)]",
            "bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_70%,transparent_110%)]",
          )}
        />
        <div className="absolute -top-32 left-1/4 size-[28rem] rounded-full bg-blue-400/25 blur-3xl" />
        <div className="absolute top-1/3 -right-24 size-[32rem] rounded-full bg-purple-400/20 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 size-[26rem] rounded-full bg-indigo-400/15 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 text-center">
        <p className="mb-6 inline-flex items-center rounded-full border border-indigo-200/80 bg-indigo-50 px-3 py-1 text-xs font-medium tracking-wide text-indigo-700">
          AI-first site generation
        </p>
        <h1 className="mx-auto max-w-4xl text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl lg:text-6xl lg:leading-[1.1]">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Turn any URL into a high-performance website
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 md:text-xl">
          Paste a link, let AI rebuild your site for speed and conversion, and
          publish in minutes — no code, no drag-and-drop maze.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <MarketingCtaButton>Build your site with AI</MarketingCtaButton>
          <p className="text-sm text-slate-500">
            Free to start · Deploy in one click
          </p>
        </div>
      </div>
    </section>
  );
}
