"use server";

import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { ZodError } from "zod";

import type { SeoAuditInsights } from "@/lib/validations/seo-audit";
import { WebsiteSchema, type Website } from "@/lib/validations/website";

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

    const { object } = await generateObject({
      model: openai.chat("gpt-4o-mini"),
      schema: WebsiteSchema,
      schemaName: "Website",
      schemaDescription:
        "Full modular landing page with header, hero, features, testimonials, FAQ, CTA section, and footer",
      system: `You are a world-class Web Designer and Copywriter. You are editing an existing website layout. Here is the current JSON: ${JSON.stringify(currentData)}. You must strictly respect these SEO insights to maintain optimization: ${JSON.stringify(seoInsights)}. User request: ${userPrompt}. Return the complete, updated, and valid JSON object.

Visual and design changes MUST be applied via the theme object:
- theme.stylePreset: "default" | "apple" | "minimal" | "bold" — use "apple" for clean Apple-like aesthetics (generous whitespace, refined typography).
- theme.primaryColor: CSS hex for buttons and CTA section background.
- theme.textColor: CSS hex for headings and primary text — set to blue (e.g. #2563eb) when the user asks for blue text.
- theme.mutedTextColor: CSS hex for secondary/body text.
- theme.backgroundColor: CSS hex for page background.

Always update theme when the user requests color, style, or design changes. Also update copy blocks when relevant.`,
      prompt: userPrompt,
    });

    return { success: true, data: object };
  } catch (error) {
    return { success: false, error: formatError(error) };
  }
}
