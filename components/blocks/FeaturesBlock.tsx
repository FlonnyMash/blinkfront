import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { cn } from "@/lib/utils";
import type { FeaturesContent, FeaturesVariant } from "@/types/layout";

type FeatureItem = FeaturesContent["items"][number];

type FeaturesBlockProps = {
  content: FeaturesContent;
};

const sectionShellByVariant: Record<FeaturesVariant, string> = {
  grid: "w-full bg-[var(--secondary)]/20 py-20 md:py-24",
  list: "w-full bg-[var(--background)] py-20 md:py-24",
  cards: "w-full border-y border-[var(--text)]/10 bg-[var(--primary)]/[0.04] py-20 md:py-28",
};

const headingByVariant: Record<FeaturesVariant, string> = {
  grid: "mb-12 text-left text-2xl font-bold tracking-tight sm:text-3xl",
  list: "mb-14 text-center text-3xl font-bold tracking-tight sm:text-4xl",
  cards: "mb-12 text-center text-2xl font-bold tracking-tight sm:text-3xl",
};

const featureIconClassName =
  "h-6 w-6 shrink-0 text-[var(--primary)]";

function FeatureIcon({ feature }: { feature: FeatureItem }) {
  if (!feature.icon?.trim()) {
    return null;
  }
  return (
    <DynamicIcon
      name={feature.icon}
      className={cn(featureIconClassName, feature.iconClassName)}
      fallback="circle-check"
    />
  );
}

function FeatureGridItem({
  feature,
  index,
}: {
  feature: FeatureItem;
  index: number;
}) {
  const hasIcon = Boolean(feature.icon?.trim());

  return (
    <div className="flex gap-4 rounded-lg border border-[var(--text)]/10 bg-[var(--background)]/80 p-6 shadow-sm">
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          hasIcon
            ? "bg-[var(--primary)]/10"
            : "bg-[var(--primary)] text-sm font-bold text-[var(--background)]",
        )}
      >
        {hasIcon ? <FeatureIcon feature={feature} /> : index + 1}
      </span>
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-[var(--text)]">
          {feature.title}
        </h3>
        <p className="text-[var(--text)]/70">{feature.description}</p>
      </div>
    </div>
  );
}

function FeatureListItem({ feature }: { feature: FeatureItem }) {
  return (
    <div className="flex gap-5 border-l-4 border-[var(--primary)] py-2 pl-8">
      <FeatureIcon feature={feature} />
      <div className="flex min-w-0 flex-col gap-3">
        <h3 className="text-2xl font-semibold text-[var(--text)]">
          {feature.title}
        </h3>
        <p className="text-lg leading-relaxed text-[var(--text)]/70">
          {feature.description}
        </p>
      </div>
    </div>
  );
}

function FeatureCardItem({ feature }: { feature: FeatureItem }) {
  return (
    <Card className="h-full border-[var(--primary)]/25 bg-[var(--background)] shadow-lg transition-shadow hover:shadow-xl">
      <CardHeader className="gap-4">
        <div className="flex items-center gap-3">
          <div className="h-1 w-12 rounded-full bg-[var(--primary)]" />
          <FeatureIcon feature={feature} />
        </div>
        <CardTitle className="text-xl text-[var(--text)]">
          {feature.title}
        </CardTitle>
        <CardDescription className="text-base text-[var(--text)]/70">
          {feature.description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

export function FeaturesBlock({ content }: FeaturesBlockProps) {
  const variant = content.variant ?? "cards";

  const itemsClass =
    variant === "list"
      ? "mx-auto flex max-w-2xl flex-col gap-12 px-4"
      : variant === "grid"
        ? cn(
            "mx-auto grid max-w-5xl gap-6 px-4 md:grid-cols-2",
            content.gridClassName,
          )
        : cn(
            "mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-2 lg:grid-cols-3",
            content.gridClassName,
          );

  return (
    <section
      id="features"
      data-variant={variant}
      className={cn(
        "text-[var(--text)]",
        content.sectionClassName ?? sectionShellByVariant[variant],
      )}
    >
      <div className="mx-auto max-w-6xl px-4">
        <h2 className={headingByVariant[variant]}>{content.heading}</h2>
        <div className={itemsClass}>
          {content.items.map((feature, index) => {
            if (variant === "list") {
              return (
                <FeatureListItem key={feature.title} feature={feature} />
              );
            }
            if (variant === "grid") {
              return (
                <FeatureGridItem
                  key={feature.title}
                  feature={feature}
                  index={index}
                />
              );
            }
            return <FeatureCardItem key={feature.title} feature={feature} />;
          })}
        </div>
      </div>
    </section>
  );
}
