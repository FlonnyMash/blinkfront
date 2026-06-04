import { MarketingCtaButton } from "@/components/marketing/marketing-cta-button";

export function BottomCtaSection() {
  return (
    <section className="pb-16 md:pb-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-indigo-50/50 px-6 py-14 text-center shadow-sm md:px-12 md:py-16">
          <div
            className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-indigo-200/30 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-12 size-56 rounded-full bg-purple-200/25 blur-3xl"
            aria-hidden
          />

          <p className="relative text-sm font-medium uppercase tracking-wide text-indigo-600">
            Trusted by builders who ship fast
          </p>
          <h2 className="relative mt-4 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Ready to launch your next site?
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-slate-600">
            Join teams using AI to go from idea to production URL without
            sacrificing performance or design quality.
          </p>
          <div className="relative mt-8 flex justify-center">
            <MarketingCtaButton>Build your site with AI</MarketingCtaButton>
          </div>
        </div>
      </div>
    </section>
  );
}
