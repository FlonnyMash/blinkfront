import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { ZodError } from "zod";

import { requireOpenAiKey } from "@/lib/ai/require-openai-key";
import { performSeoAudit } from "@/lib/ai/seo-audit";
import type { SeoAuditInsights } from "@/lib/validations/seo-audit";
import { WebsiteSchema, type Website } from "@/types/layout";

export type GenerateWebsiteSuccess = { success: true; data: Website };
export type GenerateWebsiteFailure = { success: false; error: string };
export type GenerateWebsiteResult = GenerateWebsiteSuccess | GenerateWebsiteFailure;

const SYSTEM_PROMPT = `You are an expert direct-response copywriter and web designer.

Analyze the scraped website content provided by the user. Extract the core value proposition, audience pain points, and key differentiators. Write high-converting copy that fits exactly into the required JSON schema.

Rules:
- theme.colors: hex tokens for primary, secondary, background, and text (e.g. #0071e3, #5856d6, #ffffff, #1d1d1f).
- theme.typography.fontFamily: a CSS font stack (e.g. "Inter, ui-sans-serif, system-ui, sans-serif").
- layout: ordered array of blocks. Include exactly one of each type in this order: Hero, Features, Testimonials, FAQ, CTA, Footer.
- Each block has type (Hero | Features | Testimonials | FAQ | CTA | Footer) and a content object matching that type.
- Hero content: headline, subheadline, ctaText. Optional Tailwind sectionClassName/containerClassName.
- Features content: heading, exactly 3 items (title, description). Optional gridClassName/sectionClassName.
- Testimonials content: heading, exactly 3 items (quote, author, role).
- FAQ content: heading, 3–5 items (question, answer).
- CTA content: headline, buttonText, optional subheadline.
- Footer content: copyrightText with brand name, links array of { label, href } (e.g. Privacy, Terms, Contact).
- Use clear, action-oriented language. No markdown, HTML, or fields outside the schema.
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
        "Component-driven landing page with theme tokens and ordered layout blocks",
      system: `${SYSTEM_PROMPT}

SEO Insights: ${JSON.stringify(audit)}

Use these SEO insights to optimize the copy for all layout blocks to maximize search engine ranking and user conversion.`,
      prompt: scrapedContent,
    });

    return { success: true, data: object };
  } catch (error) {
    return { success: false, error: formatError(error) };
  }
}
