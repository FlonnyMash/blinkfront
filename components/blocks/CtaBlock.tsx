import { Button } from "@/components/ui/button";
import { LeadForm } from "@/components/ui/lead-form";
import { cn } from "@/lib/utils";
import type { CtaContent, CtaVariant } from "@/types/layout";

type CtaBlockProps = {
  content: CtaContent;
  siteId?: string;
};

const sectionShellByVariant: Record<CtaVariant, string> = {
  default: "w-full bg-[var(--background)] px-4 py-16 md:py-20",
  minimal:
    "w-full border-t-4 border-[var(--primary)] bg-[var(--secondary)]/10 px-4 py-20 md:py-28",
  split: "w-full bg-[var(--background)] px-4 py-16 md:py-24",
};

function CtaAction({
  siteId,
  buttonText,
  layout,
}: {
  siteId?: string;
  buttonText: string;
  layout: "cta-default" | "cta-split" | "cta-minimal";
}) {
  if (siteId) {
    return (
      <LeadForm siteId={siteId} buttonText={buttonText} layout={layout} />
    );
  }

  const buttonClass =
    layout === "cta-minimal"
      ? "border-2 border-[var(--primary)] px-8 text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--background)]"
      : layout === "cta-split"
        ? "w-full bg-[var(--background)] px-8 text-lg text-[var(--primary)] hover:bg-[var(--background)]/90 md:w-auto"
        : "bg-[var(--background)] text-[var(--primary)] hover:bg-[var(--background)]/90";

  return (
    <Button
      size="lg"
      variant={layout === "cta-minimal" ? "outline" : "secondary"}
      className={buttonClass}
    >
      {buttonText}
    </Button>
  );
}

export function CtaBlock({ content, siteId }: CtaBlockProps) {
  const variant = content.variant ?? "split";

  if (variant === "minimal") {
    return (
      <section
        id="cta"
        data-variant={variant}
        className={cn(
          "text-[var(--text)]",
          content.sectionClassName ?? sectionShellByVariant.minimal,
        )}
      >
        <div
          className={cn(
            "mx-auto flex max-w-2xl flex-col items-center gap-8 text-center",
            content.containerClassName,
          )}
        >
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {content.headline}
          </h2>
          {content.subheadline ? (
            <p className="text-xl leading-relaxed text-[var(--text)]/70">
              {content.subheadline}
            </p>
          ) : null}
          <CtaAction
            siteId={siteId}
            buttonText={content.buttonText}
            layout="cta-minimal"
          />
        </div>
      </section>
    );
  }

  if (variant === "split") {
    return (
      <section
        id="cta"
        data-variant={variant}
        className={cn(
          "text-[var(--text)]",
          content.sectionClassName ?? sectionShellByVariant.split,
        )}
      >
        <div
          className={cn(
            "mx-auto grid max-w-5xl items-center gap-10 rounded-3xl bg-[var(--primary)] px-8 py-12 text-[var(--background)] md:grid-cols-[1.4fr_0.6fr] md:gap-12 md:px-12 md:py-16",
            content.containerClassName,
          )}
        >
          <div className="flex flex-col gap-4 text-left">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              {content.headline}
            </h2>
            {content.subheadline ? (
              <p className="text-lg text-[var(--background)]/85 md:text-xl">
                {content.subheadline}
              </p>
            ) : null}
          </div>
          <div className="flex md:justify-end">
            <CtaAction
              siteId={siteId}
              buttonText={content.buttonText}
              layout="cta-split"
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="cta"
      data-variant={variant}
      className={cn(
        "text-[var(--text)]",
        content.sectionClassName ?? sectionShellByVariant.default,
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-4xl flex-col items-center gap-8 rounded-2xl bg-[var(--primary)] px-8 py-16 text-center text-[var(--background)] shadow-xl md:px-14 md:py-20",
          content.containerClassName,
        )}
      >
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {content.headline}
        </h2>
        {content.subheadline ? (
          <p className="max-w-2xl text-lg text-[var(--background)]/85">
            {content.subheadline}
          </p>
        ) : null}
        <CtaAction
          siteId={siteId}
          buttonText={content.buttonText}
          layout="cta-default"
        />
      </div>
    </section>
  );
}
