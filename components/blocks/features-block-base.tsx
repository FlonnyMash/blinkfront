import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { FeaturesContent, FeaturesVariant } from "@/types/layout";
import type { ReactNode } from "react";
import { Fragment } from "react";

type FeatureItem = FeaturesContent["items"][number];

export type FeaturesBlockBaseProps = {
  content: FeaturesContent;
  renderFeatureIcon: (feature: FeatureItem) => ReactNode;
  wrapFeatureItem?: (item: ReactNode, index: number) => ReactNode;
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

function FeatureGridItem({
  feature,
  index,
  icon,
}: {
  feature: FeatureItem;
  index: number;
  icon: ReactNode;
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
        {hasIcon ? icon : index + 1}
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

function FeatureListItem({
  feature,
  icon,
}: {
  feature: FeatureItem;
  icon: ReactNode;
}) {
  return (
    <div className="flex gap-5 border-l-4 border-[var(--primary)] py-2 pl-8">
      {icon}
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

function FeatureCardItem({
  feature,
  icon,
}: {
  feature: FeatureItem;
  icon: ReactNode;
}) {
  return (
    <Card className="h-full border-[var(--primary)]/25 bg-[var(--background)] shadow-lg transition-shadow hover:shadow-xl">
      <CardHeader className="gap-4">
        <div className="flex items-center gap-3">
          <div className="h-1 w-12 rounded-full bg-[var(--primary)]" />
          {icon}
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

export function FeaturesBlockBase({
  content,
  renderFeatureIcon,
  wrapFeatureItem,
}: FeaturesBlockBaseProps) {
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

  const renderIcon = (feature: FeatureItem) =>
    renderFeatureIcon(feature) ?? null;

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
            const icon = feature.icon?.trim() ? renderIcon(feature) : null;

            let item: ReactNode;
            if (variant === "list") {
              item = (
                <FeatureListItem key={feature.title} feature={feature} icon={icon} />
              );
            } else if (variant === "grid") {
              item = (
                <FeatureGridItem
                  key={feature.title}
                  feature={feature}
                  index={index}
                  icon={icon}
                />
              );
            } else {
              item = (
                <FeatureCardItem key={feature.title} feature={feature} icon={icon} />
              );
            }

            return wrapFeatureItem ? (
              <Fragment key={feature.title}>
                {wrapFeatureItem(item, index)}
              </Fragment>
            ) : (
              item
            );
          })}
        </div>
      </div>
    </section>
  );
}
