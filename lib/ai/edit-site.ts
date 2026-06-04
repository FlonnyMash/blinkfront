import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { ZodError } from "zod";

import { requireOpenAiKey } from "@/lib/ai/require-openai-key";
import type { SeoAuditInsights } from "@/lib/validations/seo-audit";
import { WebsiteSchema, type Website } from "@/types/layout";

export type EditWebsiteSuccess = { success: true; data: Website };
export type EditWebsiteFailure = { success: false; error: string };
export type EditWebsiteResult = EditWebsiteSuccess | EditWebsiteFailure;

function formatError(error: unknown): string {
  if (error instanceof ZodError) {
    return `Validation failed: ${error.issues[0]?.message ?? "Invalid website data"}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unknown error occurred";
}

export async function editWebsiteData(
  currentData: Website,
  userPrompt: string,
  seoInsights: SeoAuditInsights,
): Promise<EditWebsiteResult> {
  try {
    if (!userPrompt.trim()) {
      return { success: false, error: "Edit prompt is required" };
    }

    requireOpenAiKey();

    const { object } = await generateObject({
      model: openai.chat("gpt-4o-mini"),
      schema: WebsiteSchema,
      schemaName: "Website",
      schemaDescription:
        "Component-driven landing page with theme tokens and ordered layout blocks",
      system: `You are a world-class Web Designer and Copywriter. You are editing an existing website layout. Here is the current JSON: ${JSON.stringify(currentData)}. You must strictly respect these SEO insights to maintain optimization: ${JSON.stringify(seoInsights)}. User request: ${userPrompt}. Return the complete, updated, and valid JSON object.

Visual and design changes MUST be applied via theme:
- theme.colors.primary, secondary, background, text — valid CSS hex colors.
- theme.typography.fontFamily — CSS font stack.

Layout blocks use type + content. Preserve block order unless the user asks to reorder. Update block content when the user requests copy or section changes.`,
      prompt: userPrompt,
    });

    return { success: true, data: object };
  } catch (error) {
    return { success: false, error: formatError(error) };
  }
}
