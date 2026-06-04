import { FeaturesBlockBase } from "@/components/blocks/features-block-base";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { ServerDynamicIcon } from "@/lib/icons/server-dynamic-icon";
import { cn } from "@/lib/utils";
import type { FeaturesContent } from "@/types/layout";

type FeaturesBlockPublishProps = {
  content: FeaturesContent;
};

const featureIconClassName =
  "h-6 w-6 shrink-0 text-[var(--primary)]";

export function FeaturesBlockPublish({ content }: FeaturesBlockPublishProps) {
  return (
    <FeaturesBlockBase
      content={content}
      renderFeatureIcon={(feature) =>
        feature.icon?.trim() ? (
          <ServerDynamicIcon
            name={feature.icon}
            className={cn(featureIconClassName, feature.iconClassName)}
            fallback="circle-check"
          />
        ) : null
      }
      wrapFeatureItem={(item, index) => (
        <ScrollReveal delay={index * 100}>{item}</ScrollReveal>
      )}
    />
  );
}
