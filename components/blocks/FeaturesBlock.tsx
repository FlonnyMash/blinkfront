import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { FeaturesContent } from "@/types/layout";

type FeaturesBlockProps = {
  content: FeaturesContent;
};

export function FeaturesBlock({ content }: FeaturesBlockProps) {
  return (
    <section
      className={cn(
        "bg-[var(--background)] text-[var(--text)]",
        content.sectionClassName ?? "mx-auto w-full max-w-5xl px-4 py-16",
      )}
    >
      <h2 className="mb-10 text-center text-2xl font-bold tracking-tight text-[var(--text)] sm:text-3xl">
        {content.heading}
      </h2>
      <div
        className={cn(
          "grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
          content.gridClassName,
        )}
      >
        {content.items.map((feature) => (
          <Card
            key={feature.title}
            className="border-[var(--text)]/10 bg-[var(--background)]"
          >
            <CardHeader>
              {feature.iconClassName ? (
                <span
                  className={cn("mb-2 inline-flex", feature.iconClassName)}
                  aria-hidden
                />
              ) : null}
              <CardTitle className="text-[var(--text)]">
                {feature.title}
              </CardTitle>
              <CardDescription className="text-[var(--text)]/70">
                {feature.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
