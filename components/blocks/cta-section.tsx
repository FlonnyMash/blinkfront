import { Button } from "@/components/ui/button";
import type { WebsiteTheme } from "@/lib/validations/website";

type CtaSectionProps = {
  headline: string;
  buttonText: string;
  theme: WebsiteTheme;
};

export function CtaSection({ headline, buttonText, theme }: CtaSectionProps) {
  return (
    <section className="mx-auto w-full max-w-5xl px-4">
      <div
        className="flex flex-col items-center gap-6 rounded-xl px-8 py-16 text-center"
        style={{
          backgroundColor: theme.primaryColor,
          color: theme.backgroundColor,
        }}
      >
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {headline}
        </h2>
        <Button
          variant="secondary"
          size="lg"
          style={{
            backgroundColor: theme.backgroundColor,
            color: theme.primaryColor,
          }}
        >
          {buttonText}
        </Button>
      </div>
    </section>
  );
}
