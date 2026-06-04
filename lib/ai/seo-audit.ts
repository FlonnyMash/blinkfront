import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";

import { requireOpenAiKey } from "@/lib/ai/require-openai-key";
import { SeoAuditSchema, type SeoAuditInsights } from "@/lib/validations/seo-audit";

const SYSTEM_PROMPT = `You are an expert SEO strategist and content optimizer.

Analyze the raw website content provided by the user. Identify search intent, keyword opportunities, audience fit, and content weaknesses. Return high-level SEO strategy and optimization advice that can guide landing-page copywriting.

Rules:
- score: integer 0–100 rating the page's current SEO health (keyword coverage, content depth, intent match, and on-page clarity). Be realistic—most average pages score 40–70.
- primaryKeywords: 3–8 relevant search terms or phrases the page should target, ordered by importance.
- targetAudience: one concise paragraph describing who the content serves and their primary needs.
- contentGap: describe what important topics, keywords, or user intents the current content misses or under-serves.
- seoAdvice: actionable recommendations for improving rankings, on-page SEO, and conversion-focused copy.
- Base all insights strictly on the provided content; do not invent facts about the business.
- Do not include markdown or fields outside the schema.`;

export async function performSeoAudit(rawContent: string): Promise<SeoAuditInsights> {
  requireOpenAiKey();

  const { object } = await generateObject({
    model: openai.chat("gpt-4o-mini"),
    schema: SeoAuditSchema,
    schemaName: "SeoAudit",
    schemaDescription:
      "High-level SEO strategy with keywords, audience, content gaps, and optimization advice",
    system: SYSTEM_PROMPT,
    prompt: rawContent,
  });

  return object;
}
