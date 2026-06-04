import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { FeaturesContent } from "@/types/layout";

type FeatureItem = FeaturesContent["items"][number];

type FeaturesBlockProps = {
  content: FeaturesContent;
};

function FeatureIcon({ iconClassName }: { iconClassName?: string }) {
  if (!iconClassName) {
    return null;
  }
  return (
    <span className={cn("mb-2 inline-flex", iconClassName)} aria-hidden />
  );
}

function FeatureGridItem({ feature }: { feature: FeatureItem }) {
  return (
    <div className="flex flex-col gap-2">
      <FeatureIcon iconClassName={feature.iconClassName} />
      <h3 className="text-lg font-semibold text-[var(--text)]">
        {feature.title}
      </h3>
      <p className="text-[var(--text)]/70">{feature.description}</p>
    </div>
  );
}

function FeatureListItem({ feature }: { feature: FeatureItem }) {
  return (
    <div className="flex flex-col gap-2 border-b border-[var(--text)]/10 pb-8 last:border-b-0 last:pb-0">
      <FeatureIcon iconClassName={feature.iconClassName} />
      <h3 className="text-xl font-semibold text-[var(--text)]">
        {feature.title}
      </h3>
      <p className="text-[var(--text)]/70">{feature.description}</p>
    </div>
  );
}

function FeatureCardItem({ feature }: { feature: FeatureItem }) {
  return (
    <Card className="border-[var(--text)]/10 bg-[var(--background)]">
      <CardHeader>
        <FeatureIcon iconClassName={feature.iconClassName} />
        <CardTitle className="text-[var(--text)]">{feature.title}</CardTitle>
        <CardDescription className="text-[var(--text)]/70">
          {feature.description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

export function FeaturesBlock({ content }: FeaturesBlockProps) {
  const variant = content.variant ?? "cards";

  const gridClass =
    variant === "list"
      ? "flex flex-col gap-8"
      : cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3", content.gridClassName);

  return (
    <section
      id="features"
      className={cn(
        "bg-[var(--background)] text-[var(--text)]",
        content.sectionClassName ?? "mx-auto w-full max-w-5xl px-4 py-16",
      )}
    >
      <h2 className="mb-10 text-center text-2xl font-bold tracking-tight text-[var(--text)] sm:text-3xl">
        {content.heading}
      </h2>
      <div className={gridClass}>
        {content.items.map((feature) => {
          if (variant === "list") {
            return <FeatureListItem key={feature.title} feature={feature} />;
          }
          if (variant === "grid") {
            return <FeatureGridItem key={feature.title} feature={feature} />;
          }
          return <FeatureCardItem key={feature.title} feature={feature} />;
        })}
      </div>
    </section>
  );
}
