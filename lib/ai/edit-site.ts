import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { ZodError } from "zod";

import { requireOpenAiKey } from "@/lib/ai/require-openai-key";
import {
  normalizeWebsite,
  stabilizeWebsiteInput,
  syncWebsiteHeaderNav,
  WebsiteGenerationSchema,
  WebsiteSchema,
  type Website,
} from "@/types/layout";

export type EditWebsiteSuccess = { success: true; data: Website };
export type EditWebsiteFailure = { success: false; error: string };
export type EditWebsiteResult = EditWebsiteSuccess | EditWebsiteFailure;

const CRO_CORE_INTELLIGENCE = `## Persona
You are a world-class Conversion Rate Optimization (CRO) expert, an elite SaaS copywriter, and a minimalist web designer.

You are NOT a passive JSON editor. You are a conversion strategist. Any copy you touch must sell: punchy UVPs, benefit outcomes, objection-aware FAQs, and corporate-grade theme tokens.

## Layout & structural rules (AIDA)
High-converting order: Header → Hero → Features → Testimonials → FAQ → CTA → Footer (exactly one block per type).
- Attention → Hero (UVP, transformation promise)
- Interest → Features (benefit outcomes, exactly 3 items)
- Desire → Testimonials (credible social proof)
- Action → FAQ (objections), then CTA (close)

## Component-specific copywriting
### Hero
headline = ultra-punchy benefit-driven UVP. NEVER "Welcome to X", "We offer services", or "Your trusted partner". State the exact transformation. subheadline sharpens the promise. ctaText = specific action.

### Features
Benefits only—translate specs into outcomes (e.g. "24/7 cloud sync" → "Access your files anywhere, instantly"). Exactly 3 items; title = benefit, description = tangible gain.
Each item MUST include a semantic \`icon\` — a real \`lucide-react\` name in PascalCase (e.g. Brain, Globe, Lock). Do not invent names; match icon to benefit.

### Testimonials
Exactly 3 items; quotes cite concrete results aligned with the UVP.

### FAQ
Address conversion anxieties (pricing, migration, security, onboarding, ROI)—not boring generic Q&A. Direct, reassuring answers.

### CTA
headline restates value; buttonText = strong micro-commitment (not "Submit" or "Learn more").

### Header / Footer
Header logoText: 1–4 word brand only (never the hero UVP). Customize nav **labels** only; section hrefs (#features, #testimonials, #faq, #cta) are enforced from layout. Footer: concise copyright + useful links.

## Layout variants (strict enums)
You MUST choose a specific layout \`variant\` from the schema enums for each block. Analyze the copy: if it is short and punchy, pick \`centered\` for Hero; if it requires visual balance, pick \`split\`. NEVER pick the first option blindly or repeat the same token on Hero, Features, and CTA.
- Hero enum: \`default\` | \`centered\` | \`split\`
- Features enum: \`grid\` | \`list\` | \`cards\`
- CTA enum: \`default\` | \`minimal\` | \`split\`
- Header, Testimonials, FAQ, Footer: \`variant\` must be \`""\` unless unchanged from input.

## Visual rhythm
You are a master of visual rhythm. Create visual rhythm: alternate layouts so the page never feels monotonous. Example mix: Hero \`centered\`, Features \`grid\`, CTA \`split\`. Deliberately vary all three when updating variants.

## Art direction (mandatory)
You MUST tailor the \`theme\` tokens strictly to the business niche implied by the site copy and user request. A plumber needs different borders and colors than a high-end law firm or a crypto startup. Deliberately select \`fontFamily\` and \`borderRadius\` to match the brand's psychology when theme or visual identity is in scope.
- theme.fontFamily enum: \`sans\` | \`serif\` | \`mono\`
- theme.borderRadius enum: \`none\` | \`sm\` | \`lg\` | \`full\`

## Theme & color token engine
theme.colors: primary, secondary, background, text — clean professional hex values.
- Sophisticated palette matched to niche; avoid random bright neons or clashing pairs unless the brand demands it.
- Primary on background and text on background must pass WCAG AA (≥ 4.5:1). Harmonize primary/secondary in the same temperature family.

## Schema contract
- theme: colors (hex), fontFamily (sans | serif | mono), borderRadius (none | sm | lg | full).
- All content fields present; unused strings "", unused arrays [].
- Header: logoText, 3–4 links [{ label, href }], variant "".
- Hero: headline, subheadline, ctaText, variant (default | centered | split).
- Features: heading + exactly 3 items (title, description, icon), variant (grid | list | cards). Testimonials/FAQ items: \`icon\` "". Testimonials: heading + exactly 3 items. FAQ: heading + 3–5 items.
- CTA: variant (default | minimal | split).
- Hero & CTA use headline; Features, Testimonials, FAQ use heading.
- No markdown, HTML, or extra fields.`;

const EDIT_GUARDRAILS = `## Edit mode (context-aware)
You receive a currentWebsite JSON and a userPrompt.
- ONLY modify fields and blocks relevant to the userPrompt. Leave all unrelated copy, structure, and theme values unchanged.
- Any new or rewritten text MUST follow the CRO copywriting rules above (UVP, spec-to-outcome features, conversion-anxiety FAQs).
- Preserve the AIDA block sequence (Header, Hero, Features, Testimonials, FAQ, CTA, Footer) unless the user explicitly asks to reorder, add, or remove blocks.
- Do not drop blocks or empty required fields to satisfy a partial edit—return a complete valid website.
- When the user prompt implies layout or visual structure changes, update \`variant\` on Hero, Features, or CTA alongside copy and apply visual-rhythm mixing (do not set all three to \`default\`); otherwise preserve existing variants.
- When editing Features copy or benefits, update each item's \`icon\` to stay semantically aligned; otherwise preserve existing icons.
- Theme changes go through theme.colors, theme.fontFamily, and theme.borderRadius.
- When the user asks for a more corporate, playful, luxury, or technical look, update fontFamily and/or borderRadius alongside colors.
- Color edits: new hex codes must stay clean, corporate, and WCAG AA compliant (≥ 4.5:1 for text on background and primary on background).`;

function formatError(error: unknown): string {
  if (error instanceof ZodError) {
    const detail = error.issues
      .map((issue) => {
        const path = issue.path.length ? issue.path.join(".") : "root";
        return `${path}: ${issue.message}`;
      })
      .join("; ");
    return `Validation failed: ${detail || "Invalid website data"}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unknown error occurred";
}

function buildSystemPrompt(seoInsights?: string): string {
  const seoSection = seoInsights?.trim()
    ? `

## SEO insights (apply after honoring the user request)
${seoInsights.trim()}

When editing copy, preserve or naturally reintegrate critical organic ranking keywords from these insights. Never keyword-stuff or sacrifice conversion clarity.`
    : "";

  return `${CRO_CORE_INTELLIGENCE}

${EDIT_GUARDRAILS}${seoSection}`;
}

function buildEditPrompt(currentWebsite: Website, userPrompt: string): string {
  return `Apply the user request to the current website. Change only what is necessary; keep everything else identical.

## Current website
${JSON.stringify(currentWebsite)}

## User request
${userPrompt.trim()}

Return the full updated Website JSON. Rewritten copy must meet CRO standards—not generic filler.`;
}

const SCHEMA_DESCRIPTION =
  "High-converting SaaS landing page: AIDA layout blocks, benefit copy, WCAG theme tokens";

export async function editWebsiteData(
  currentWebsite: Website,
  userPrompt: string,
  seoInsights?: string,
): Promise<EditWebsiteResult> {
  try {
    if (!userPrompt.trim()) {
      return { success: false, error: "Edit prompt is required" };
    }

    requireOpenAiKey();

    const system = buildSystemPrompt(seoInsights);
    const prompt = buildEditPrompt(currentWebsite, userPrompt);

    try {
      const { object } = await generateObject({
        model: openai.chat("gpt-4o-mini"),
        schema: WebsiteSchema,
        schemaName: "Website",
        schemaDescription: SCHEMA_DESCRIPTION,
        system,
        prompt,
      });

      return {
        success: true,
        data: syncWebsiteHeaderNav(
          WebsiteSchema.parse(stabilizeWebsiteInput(object)),
        ),
      };
    } catch {
      // WebsiteSchema uses discriminated unions; fall back to the OpenAI-compatible schema.
      const { object } = await generateObject({
        model: openai.chat("gpt-4o-mini"),
        schema: WebsiteGenerationSchema,
        schemaName: "Website",
        schemaDescription: SCHEMA_DESCRIPTION,
        system,
        prompt,
      });

      return {
        success: true,
        data: syncWebsiteHeaderNav(
          WebsiteSchema.parse(stabilizeWebsiteInput(normalizeWebsite(object))),
        ),
      };
    }
  } catch (error) {
    return { success: false, error: formatError(error) };
  }
}
