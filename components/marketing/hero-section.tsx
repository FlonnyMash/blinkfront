import Link from "next/link";

import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          Turn any URL into a high-performance website
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Paste a link, let AI rebuild your site for speed and conversion, and
          publish in minutes — no code, no drag-and-drop maze.
        </p>
        <div className="mt-10">
          <Button size="lg" asChild>
            <Link href="/builder">Build your site with AI</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
