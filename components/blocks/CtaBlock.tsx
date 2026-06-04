import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CtaContent, CtaVariant } from "@/types/layout";

type CtaBlockProps = {
  content: CtaContent;
};

const sectionClassByVariant: Record<CtaVariant, string> = {
  default: "mx-auto w-full max-w-5xl px-4 py-16",
  minimal: "mx-auto w-full max-w-3xl px-4 py-16",
  split: "mx-auto w-full max-w-5xl px-4 py-16",
};

function CtaCopy({ content }: { content: CtaContent }) {
  return (
    <>
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
        {content.headline}
      </h2>
      {content.subheadline ? (
        <p className="max-w-2xl text-lg text-[var(--background)]/80">
          {content.subheadline}
        </p>
      ) : null}
    </>
  );
}

export function CtaBlock({ content }: CtaBlockProps) {
  const variant = content.variant ?? "split";

  if (variant === "minimal") {
    return (
      <section
        id="cta"
        className={cn(
          "bg-[var(--background)] text-[var(--text)]",
          content.sectionClassName ?? sectionClassByVariant.minimal,
        )}
      >
        <div
          className={cn(
            "flex flex-col items-center gap-6 text-center",
            content.containerClassName,
          )}
        >
          <h2 className="text-3xl font-bold tracking-tight text-[var(--text)] sm:text-4xl">
            {content.headline}
          </h2>
          {content.subheadline ? (
            <p className="max-w-2xl text-lg text-[var(--text)]/70">
              {content.subheadline}
            </p>
          ) : null}
          <Button
            size="lg"
            variant="outline"
            className="border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)]/10"
          >
            {content.buttonText}
          </Button>
        </div>
      </section>
    );
  }

  if (variant === "split") {
    return (
      <section
        id="cta"
        className={cn(
          "bg-[var(--background)] text-[var(--text)]",
          content.sectionClassName ?? sectionClassByVariant.split,
        )}
      >
        <div
          className={cn(
            "grid items-center gap-8 rounded-xl bg-[var(--primary)] px-8 py-12 text-[var(--background)] md:grid-cols-2 md:py-16",
            content.containerClassName,
          )}
        >
          <div className="flex flex-col gap-4">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {content.headline}
            </h2>
            {content.subheadline ? (
              <p className="text-lg text-[var(--background)]/80">
                {content.subheadline}
              </p>
            ) : null}
          </div>
          <div className="flex md:justify-end">
            <Button
              size="lg"
              variant="secondary"
              className="bg-[var(--background)] text-[var(--primary)] hover:bg-[var(--background)]/90"
            >
              {content.buttonText}
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="cta"
      className={cn(
        "bg-[var(--background)] text-[var(--text)]",
        content.sectionClassName ?? sectionClassByVariant.default,
      )}
    >
      <div
        className={cn(
          "flex flex-col items-center gap-6 rounded-xl bg-[var(--primary)] px-8 py-16 text-center text-[var(--background)]",
          content.containerClassName,
        )}
      >
        <CtaCopy content={content} />
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
