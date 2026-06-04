import type { CSSProperties } from "react";

import { HeaderBlock } from "@/components/blocks/HeaderBlock";
import { CtaBlock } from "@/components/blocks/CtaBlock";
import { FaqBlock } from "@/components/blocks/FaqBlock";
import { FeaturesBlock } from "@/components/blocks/FeaturesBlock";
import { FooterBlock } from "@/components/blocks/FooterBlock";
import { HeroBlock } from "@/components/blocks/HeroBlock";
import { TestimonialsBlock } from "@/components/blocks/TestimonialsBlock";
import { LeadCaptureScript } from "@/components/ui/lead-capture-script";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { cn } from "@/lib/utils";
import {
  ensureHeaderBlock,
  getBrandName,
  THEME_BORDER_RADIUS_CSS,
  THEME_FONT_FAMILY_CLASS,
  type LayoutBlock,
  type ThemeFontFamily,
  type Website,
} from "@/types/layout";

type LayoutRendererProps = {
  data: Website;
  siteId?: string;
  className?: string;
};

const THEME_FONT_HEADING_STACK: Record<ThemeFontFamily, string> = {
  sans: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
  serif: '"Source Serif 4", ui-serif, Georgia, serif',
  mono: "var(--font-geist-mono), ui-monospace, monospace",
};

function getThemeStyle(theme: Website["theme"]): CSSProperties {
  return {
    "--primary": theme.colors.primary,
    "--secondary": theme.colors.secondary,
    "--background": theme.colors.background,
    "--text": theme.colors.text,
    "--surface": `color-mix(in srgb, ${theme.colors.secondary} 18%, ${theme.colors.background})`,
    "--radius": THEME_BORDER_RADIUS_CSS[theme.borderRadius],
    "--font-heading": THEME_FONT_HEADING_STACK[theme.fontFamily],
  } as CSSProperties;
}

function getThemeWrapperClass(theme: Website["theme"]): string {
  return THEME_FONT_FAMILY_CLASS[theme.fontFamily];
}

function renderBlock(block: LayoutBlock, index: number, siteId?: string) {
  const key = `${block.type}-${index}`;

  switch (block.type) {
    case "Header":
      return <HeaderBlock key={key} content={block.content} />;
    case "Hero":
      return (
        <ScrollReveal key={key}>
          <HeroBlock content={block.content} siteId={siteId} />
        </ScrollReveal>
      );
    case "Features":
      return (
        <ScrollReveal key={key}>
          <FeaturesBlock content={block.content} />
        </ScrollReveal>
      );
    case "Testimonials":
      return (
        <ScrollReveal key={key}>
          <TestimonialsBlock content={block.content} />
        </ScrollReveal>
      );
    case "FAQ":
      return (
        <ScrollReveal key={key}>
          <FaqBlock content={block.content} />
        </ScrollReveal>
      );
    case "CTA":
      return (
        <ScrollReveal key={key}>
          <CtaBlock content={block.content} siteId={siteId} />
        </ScrollReveal>
      );
    case "Footer":
      return <FooterBlock key={key} content={block.content} />;
    default:
      return null;
  }
}

export function LayoutRenderer({ data, siteId, className }: LayoutRendererProps) {
  const layout = ensureHeaderBlock(data.layout, getBrandName(data));

  return (
    <div
      className={cn(
        "flex min-h-screen flex-col bg-[var(--background)] text-[var(--text)] antialiased",
        getThemeWrapperClass(data.theme),
        className,
      )}
      style={getThemeStyle(data.theme)}
    >
      {layout.map((block, index) => renderBlock(block, index, siteId))}
      <LeadCaptureScript />
    </div>
  );
}

/** Browser tab / publish title — the company brand, not the hero UVP. */
export function getWebsiteTitle(data: Website): string {
  return getBrandName(data);
}
