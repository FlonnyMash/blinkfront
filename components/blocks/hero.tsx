import { Button } from "@/components/ui/button";
import type { WebsiteTheme } from "@/lib/validations/website";

type HeroProps = {
  headline: string;
  subheadline: string;
  ctaText: string;
  theme: WebsiteTheme;
};

export function Hero({ headline, subheadline, ctaText, theme }: HeroProps) {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 text-center">
      <h1
        className="text-4xl font-bold tracking-tight sm:text-5xl"
        style={{ color: theme.textColor }}
      >
        {headline}
      </h1>
      <p
        className="max-w-2xl text-lg"
        style={{ color: theme.mutedTextColor }}
      >
        {subheadline}
      </p>
      <Button
        size="lg"
        style={{
          backgroundColor: theme.primaryColor,
          color: theme.backgroundColor,
        }}
      >
        {ctaText}
      </Button>
    </section>
  );
}
