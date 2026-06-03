import fs from "node:fs";
import path from "node:path";

import { CtaSection } from "@/components/blocks/cta-section";
import { FaqStatic } from "@/components/blocks/faq-static";
import { Features } from "@/components/blocks/features";
import { Footer } from "@/components/blocks/footer";
import { Header } from "@/components/blocks/header";
import { Hero } from "@/components/blocks/hero";
import { Testimonials } from "@/components/blocks/testimonials";
import { getPresetClasses, getThemeStyles } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { Website } from "@/lib/validations/website";

function PublishWebsiteRenderer({ data }: { data: Website }) {
  const { theme } = data;

  return (
    <div
      className={cn("flex min-h-screen flex-col", getPresetClasses(theme.stylePreset))}
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
        <FaqStatic faq={data.faq} theme={theme} />
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

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function loadPublishCss(): string {
  const cssPath = path.join(process.cwd(), "lib/deploy/site.css");

  if (!fs.existsSync(cssPath)) {
    throw new Error(
      "Missing lib/deploy/site.css. Run `npm run build:publish-css` first.",
    );
  }

  return fs.readFileSync(cssPath, "utf8");
}

export async function renderWebsiteHtml(
  data: Website,
): Promise<{ html: string; css: string }> {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const body = renderToStaticMarkup(<PublishWebsiteRenderer data={data} />);
  const title = escapeHtml(data.header.logoText);
  const css = loadPublishCss();

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <link rel="stylesheet" href="/style.css" />
</head>
<body>
${body}
</body>
</html>`;

  return { html, css };
}
