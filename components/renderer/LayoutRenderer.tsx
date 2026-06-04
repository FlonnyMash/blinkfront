import type { CSSProperties } from "react";

import { HeaderBlock } from "@/components/blocks/HeaderBlock";
import { CtaBlock } from "@/components/blocks/CtaBlock";
import { FaqBlock } from "@/components/blocks/FaqBlock";
import { FeaturesBlock } from "@/components/blocks/FeaturesBlock";
import { FooterBlock } from "@/components/blocks/FooterBlock";
import { HeroBlock } from "@/components/blocks/HeroBlock";
import { TestimonialsBlock } from "@/components/blocks/TestimonialsBlock";
import { cn } from "@/lib/utils";
import { ensureHeaderBlock, type LayoutBlock, type Website } from "@/types/layout";

type LayoutRendererProps = {
  data: Website;
  className?: string;
};

function getThemeStyle(theme: Website["theme"]): CSSProperties {
  return {
    "--primary": theme.colors.primary,
    "--secondary": theme.colors.secondary,
    "--background": theme.colors.background,
    "--text": theme.colors.text,
    fontFamily: theme.typography.fontFamily,
  } as CSSProperties;
}

function renderBlock(block: LayoutBlock, index: number) {
  const key = `${block.type}-${index}`;

  switch (block.type) {
    case "Header":
      return <HeaderBlock key={key} content={block.content} />;
    case "Hero":
      return <HeroBlock key={key} content={block.content} />;
    case "Features":
      return <FeaturesBlock key={key} content={block.content} />;
    case "Testimonials":
      return <TestimonialsBlock key={key} content={block.content} />;
    case "FAQ":
      return <FaqBlock key={key} content={block.content} />;
    case "CTA":
      return <CtaBlock key={key} content={block.content} />;
    case "Footer":
      return <FooterBlock key={key} content={block.content} />;
    default:
      return null;
  }
}

export function LayoutRenderer({ data, className }: LayoutRendererProps) {
  const layout = ensureHeaderBlock(data.layout, getWebsiteTitle(data));

  return (
    <div
      className={cn(
        "flex min-h-screen flex-col bg-[var(--background)] text-[var(--text)] antialiased",
        className,
      )}
      style={getThemeStyle(data.theme)}
    >
      {layout.map((block, index) => renderBlock(block, index))}
    </div>
  );
}

export function getWebsiteTitle(data: Website): string {
  const hero = data.layout.find((block) => block.type === "Hero");
  return hero?.content.headline ?? "Website";
}
