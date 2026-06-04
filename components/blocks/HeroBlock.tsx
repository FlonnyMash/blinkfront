import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HeroContent, HeroVariant } from "@/types/layout";

type HeroBlockProps = {
  content: HeroContent;
};

const sectionShellByVariant: Record<HeroVariant, string> = {
  default:
    "w-full border-b border-[var(--text)]/10 bg-[var(--background)] px-6 py-16 md:py-20",
  centered:
    "w-full bg-[var(--primary)]/[0.07] px-6 py-24 md:min-h-[min(72vh,720px)] md:py-32",
  split:
    "w-full bg-[var(--secondary)]/25 px-6 py-16 md:py-24",
};

const innerByVariant: Record<HeroVariant, string> = {
  default: "mx-auto flex max-w-3xl flex-col items-start gap-6 text-left",
  centered:
    "mx-auto flex max-w-4xl flex-col items-center gap-10 text-center",
  split:
    "mx-auto grid w-full max-w-6xl items-center gap-10 md:grid-cols-2 md:gap-14",
};

function HeroCopy({
  content,
  variant,
}: {
  content: HeroContent;
  variant: HeroVariant;
}) {
  const headlineClass =
    variant === "centered"
      ? "text-5xl font-bold tracking-tight text-[var(--text)] sm:text-6xl md:text-7xl"
      : variant === "split"
        ? "text-4xl font-bold tracking-tight text-[var(--text)] sm:text-5xl"
        : "text-4xl font-bold tracking-tight text-[var(--text)] sm:text-5xl md:text-[2.75rem]";

  return (
    <>
      <h1 className={headlineClass}>{content.headline}</h1>
      <p
        className={cn(
          "max-w-2xl text-lg text-[var(--text)]/70",
          variant === "centered" && "text-xl",
        )}
      >
        {content.subheadline}
      </p>
      <Button
        size="lg"
        className={cn(
          "bg-[var(--primary)] text-[var(--background)] hover:bg-[var(--primary)]/90",
          variant === "centered" && "px-10 text-base",
        )}
      >
        {content.ctaText}
      </Button>
    </>
  );
}

export function HeroBlock({ content }: HeroBlockProps) {
  const variant = content.variant ?? "centered";

  return (
    <section
      data-variant={variant}
      className={cn(
        "text-[var(--text)]",
        content.sectionClassName ?? sectionShellByVariant[variant],
      )}
    >
      <div
        className={cn(innerByVariant[variant], content.containerClassName)}
      >
        {variant === "split" ? (
          <>
            <div className="flex flex-col items-start gap-6">
              <HeroCopy content={content} variant={variant} />
            </div>
            <div
              className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-2xl ring-1 ring-[var(--text)]/10"
              aria-hidden
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)] via-[var(--primary)]/80 to-[var(--secondary)]" />
              <div className="absolute inset-4 rounded-xl border border-[var(--background)]/30 bg-[var(--background)]/10 backdrop-blur-sm" />
            </div>
          </>
        ) : (
          <HeroCopy content={content} variant={variant} />
        )}
      </div>
    </section>
  );
}
