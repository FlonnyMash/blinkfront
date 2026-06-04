import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CtaContent } from "@/types/layout";

type CtaBlockProps = {
  content: CtaContent;
};

export function CtaBlock({ content }: CtaBlockProps) {
  return (
    <section
      className={cn(
        "bg-[var(--background)] text-[var(--text)]",
        content.sectionClassName ?? "mx-auto w-full max-w-5xl px-4 py-16",
      )}
    >
      <div
        className={cn(
          "flex flex-col items-center gap-6 rounded-xl bg-[var(--primary)] px-8 py-16 text-center text-[var(--background)]",
          content.containerClassName,
        )}
      >
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {content.headline}
        </h2>
        {content.subheadline ? (
          <p className="max-w-2xl text-lg text-[var(--background)]/80">
            {content.subheadline}
          </p>
        ) : null}
        <Button
          size="lg"
          variant="secondary"
          className="bg-[var(--background)] text-[var(--primary)] hover:bg-[var(--background)]/90"
        >
          {content.buttonText}
        </Button>
      </div>
    </section>
  );
}
