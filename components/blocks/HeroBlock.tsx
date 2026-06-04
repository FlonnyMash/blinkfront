import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HeroContent } from "@/types/layout";

type HeroBlockProps = {
  content: HeroContent;
};

export function HeroBlock({ content }: HeroBlockProps) {
  return (
    <section
      className={cn(
        "bg-[var(--background)] text-[var(--text)]",
        content.sectionClassName ??
          "mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-20 text-center",
      )}
    >
      <div
        className={cn(
          "flex flex-col items-center gap-6",
          content.containerClassName,
        )}
      >
        <h1 className="text-4xl font-bold tracking-tight text-[var(--text)] sm:text-5xl">
          {content.headline}
        </h1>
        <p className="max-w-2xl text-lg text-[var(--text)]/70">
          {content.subheadline}
        </p>
        <Button
          size="lg"
          className="bg-[var(--primary)] text-[var(--background)] hover:bg-[var(--primary)]/90"
        >
          {content.ctaText}
        </Button>
      </div>
    </section>
  );
}
