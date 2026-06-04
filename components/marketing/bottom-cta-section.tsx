import Link from "next/link";

import { Button } from "@/components/ui/button";

export function BottomCtaSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="rounded-2xl border border-border bg-muted/40 px-6 py-12 text-center md:px-12">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Trusted by builders who ship fast
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
            Ready to launch your next site?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Join teams using AI to go from idea to production URL without
            sacrificing performance or design quality.
          </p>
          <div className="mt-8">
            <Button size="lg" asChild>
              <Link href="/builder">Build your site with AI</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
