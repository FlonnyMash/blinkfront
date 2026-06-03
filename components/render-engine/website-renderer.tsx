import { CtaSection } from "@/components/blocks/cta-section";
import { Faq } from "@/components/blocks/faq";
import { Features } from "@/components/blocks/features";
import { Footer } from "@/components/blocks/footer";
import { Header } from "@/components/blocks/header";
import { Hero } from "@/components/blocks/hero";
import { Testimonials } from "@/components/blocks/testimonials";
import { getPresetClasses, getThemeStyles } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { Website } from "@/lib/validations/website";

type WebsiteRendererProps = {
  data: Website;
};

export function WebsiteRenderer({ data }: WebsiteRendererProps) {
  const { theme } = data;

  return (
    <div
      className={cn("flex flex-col", getPresetClasses(theme.stylePreset))}
      style={getThemeStyles(theme)}
    >
      <Header
        logoText={data.header.logoText}
        navLinks={data.header.navLinks}
        theme={theme}
      />
      <div className="flex flex-col gap-12 py-12">
        <Hero
          headline={data.hero.headline}
          subheadline={data.hero.subheadline}
          ctaText={data.hero.ctaText}
          theme={theme}
        />
        <Features features={data.features} theme={theme} />
        <Testimonials testimonials={data.testimonials} theme={theme} />
        <Faq faq={data.faq} theme={theme} />
        <CtaSection
          headline={data.ctaSection.headline}
          buttonText={data.ctaSection.buttonText}
          theme={theme}
        />
      </div>
      <Footer
        copyrightText={data.footer.copyrightText}
        bottomLinks={data.footer.bottomLinks}
        theme={theme}
      />
    </div>
  );
}
