"use server";

import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { ZodError } from "zod";

import { requireOpenAiKey } from "@/lib/ai/require-openai-key";
import { performSeoAudit } from "@/lib/ai/seo-audit";
import type { SeoAuditInsights } from "@/lib/validations/seo-audit";
import { WebsiteSchema, type Website } from "@/lib/validations/website";

export type GenerateWebsiteSuccess = { success: true; data: Website };
export type GenerateWebsiteFailure = { success: false; error: string };
export type GenerateWebsiteResult = GenerateWebsiteSuccess | GenerateWebsiteFailure;

const SYSTEM_PROMPT = `You are an expert direct-response copywriter.

Analyze the scraped website content provided by the user. Extract the core value proposition, audience pain points, and key differentiators. Write high-converting, concise copy that fits exactly into the required JSON schema.

Rules:
- Map output exactly to the schema fields: theme (stylePreset, primaryColor, textColor, mutedTextColor, backgroundColor), header (logoText, navLinks), hero (headline, subheadline, ctaText), features (exactly 3 items with title and description), testimonials (exactly 3 items with quote, author, role), faq (3–5 items with question and answer), ctaSection (headline, buttonText), footer (copyrightText, bottomLinks).
- theme.stylePreset: one of "default", "apple", "minimal", "bold". Use "default" unless the brand suggests otherwise.
- theme colors: valid CSS hex colors (e.g. #0071e3, #1d1d1f, #737373, #ffffff). primaryColor drives buttons and CTA backgrounds; textColor drives headings; mutedTextColor drives secondary text; backgroundColor drives page background.
- header.logoText: derive from the brand or site name in the scraped content.
- header.navLinks: provide 1–4 short navigation labels mapped to the main topics or sections of the site.
- testimonials: write exactly 3 realistic, context-aware quotes. Infer plausible customer personas, outcomes, and tone from the scraped content—never use generic lorem ipsum or filler.
- faq: provide 3–5 Q&A pairs that address real objections, pricing or process questions, or service details implied by the scraped content.
- footer.copyrightText: include the brand name and a copyright notice.
- footer.bottomLinks: provide standard footer links (e.g. Privacy, Terms, Contact) relevant to the business type.
- Provide exactly 3 feature items—no more, no fewer.
- Use clear, action-oriented language for headlines and CTAs.
- Do not include markdown, HTML, or any fields outside the schema.
- Prefer benefit-driven copy over generic filler.`;

function formatError(error: unknown): string {
  if (error instanceof ZodError) {
    return `Validation failed: ${error.issues[0]?.message ?? "Invalid website data"}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unknown error occurred";
}

export async function generateWebsiteData(
  scrapedContent: string,
  seoAudit?: SeoAuditInsights,
): Promise<GenerateWebsiteResult> {
  try {
    if (!scrapedContent.trim()) {
      return { success: false, error: "Scraped content is required" };
    }

    requireOpenAiKey();

    const audit = seoAudit ?? (await performSeoAudit(scrapedContent));

    const { object } = await generateObject({
      model: openai.chat("gpt-4o-mini"),
      schema: WebsiteSchema,
      schemaName: "Website",
      schemaDescription:
        "Full modular landing page with header, hero, features, testimonials, FAQ, CTA section, and footer",
      system: `${SYSTEM_PROMPT}

SEO Insights: ${JSON.stringify(audit)}

Use these SEO insights to optimize the copy for all website blocks to maximize search engine ranking and user conversion.`,
      prompt: scrapedContent,
    });

    return { success: true, data: object };
  } catch (error) {
    return { success: false, error: formatError(error) };
  }
}
