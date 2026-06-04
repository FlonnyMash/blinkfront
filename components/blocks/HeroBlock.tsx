import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HeroContent, HeroVariant } from "@/types/layout";

type HeroBlockProps = {
  content: HeroContent;
};

const sectionClassByVariant: Record<HeroVariant, string> = {
  default:
    "mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-20 text-center",
  centered:
    "mx-auto flex max-w-4xl flex-col items-center gap-8 px-4 py-24 text-center",
  split:
    "mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-20 md:grid-cols-2",
};

function HeroCopy({ content }: { content: HeroContent }) {
  return (
    <>
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
    </>
  );
}

export function HeroBlock({ content }: HeroBlockProps) {
  const variant = content.variant ?? "centered";

  if (variant === "split") {
    return (
      <section
        className={cn(
          "bg-[var(--background)] text-[var(--text)]",
          content.sectionClassName ?? sectionClassByVariant.split,
          content.containerClassName,
        )}
      >
        <div className="flex flex-col gap-6">
          <HeroCopy content={content} />
        </div>
        <div
          className="aspect-[4/3] w-full rounded-xl border border-dashed border-[var(--text)]/20 bg-[var(--text)]/5"
          aria-hidden
        />
      </section>
    );
  }

  const isCentered = variant === "centered";

  return (
    <section
      className={cn(
        "bg-[var(--background)] text-[var(--text)]",
        content.sectionClassName ?? sectionClassByVariant[variant],
      )}
    >
      <div
        className={cn(
          "flex flex-col items-center gap-6",
          isCentered && "gap-8",
          content.containerClassName,
        )}
      >
        <HeroCopy content={content} />
      </div>
    </section>
  );
}
