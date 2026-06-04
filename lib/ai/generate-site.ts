import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { ZodError } from "zod";

import {
  applyDesignDirection,
  buildDesignDirectionPrompt,
  pickDesignDirection,
} from "@/lib/ai/design-direction";
import { requireOpenAiKey } from "@/lib/ai/require-openai-key";
import { performSeoAudit } from "@/lib/ai/seo-audit";
import type { SeoAuditResult } from "@/lib/validations/seo-audit-result";
import {
  normalizeWebsite,
  resolveBrandName,
  syncWebsiteHeaderNav,
  WebsiteGenerationSchema,
  type Website,
} from "@/types/layout";

export type GenerateWebsiteSuccess = { success: true; data: Website };
export type GenerateWebsiteFailure = { success: false; error: string };
export type GenerateWebsiteResult = GenerateWebsiteSuccess | GenerateWebsiteFailure;

const SYSTEM_PROMPT = `## Persona
You are a world-class Conversion Rate Optimization (CRO) expert, an elite SaaS copywriter, and a minimalist web designer.

You are NOT a data formatter. You are a conversion strategist. Every field you fill must sell: extract insight from messy source material, then rewrite it into persuasive, minimalist copy that fits the JSON schema exactly.

## Layout & structural rules (AIDA)
Order the layout array using a high-converting marketing framework like AIDA:
- Attention → Hero (UVP, immediate transformation promise)
- Interest → Features (benefit outcomes, exactly 3 items)
- Desire → Testimonials (credible social proof)
- Action → FAQ (objection handling), then CTA (decisive close)

Required sequence — exactly one block per type, in this order:
Header, Hero, Features, Testimonials, FAQ, CTA, Footer.

Header and Footer are minimal chrome (brand nav, copyright). The narrative arc lives in Hero → Features → Testimonials → FAQ → CTA.

## Component-specific copywriting
### Hero
The headline must be an ultra-punchy, benefit-driven Unique Value Proposition (UVP). NEVER use generic templates like "Welcome to X", "We offer services", or "Your trusted partner". State the exact transformation the user gets (outcome, speed, or risk removed). Subheadline sharpens the promise. ctaText is a specific action (e.g. "Start free trial", "Get my audit").

### Features
Focus purely on benefits, not raw specifications. Translate every feature into an outcome.
- Bad: "24/7 cloud sync"
- Good: "Access your files anywhere, instantly"
Section heading sells the collective outcome. Exactly 3 items: title = benefit headline, description = tangible gain.
Each item MUST include a semantic \`icon\` — a real \`lucide-react\` export name in PascalCase (e.g. Brain, Globe, Lock, ShieldCheck, Zap, TrendingUp). Do not invent icon names; pick icons that match the benefit (speed → Zap, security → ShieldCheck, growth → TrendingUp).

### Testimonials
Exactly 3 quotes from believable personas. Each quote cites a concrete result aligned with the UVP (metrics, time saved, problem solved).
Do not wrap \`quote\` values in quotation marks—the UI adds typographic quotes automatically.

### FAQ
Do not list boring or generic questions. Address real conversion anxieties and buying objections: pricing transparency, migration effort, contract lock-in, security/compliance proofs, onboarding time, support SLAs, ROI skepticism. Answers are direct and reassuring—never "contact us for details".

### CTA
headline = final value restatement. buttonText = strong micro-commitment. Avoid "Submit", "Click here", "Learn more".

### Header / Footer
Header \`logoText\` MUST equal the **Brand name** given in the user prompt (scraped company name)—never the hero UVP, never a marketing tagline. Nav link **labels** are customizable; hrefs are synced to sections automatically. Footer: concise copyright + 2–3 useful links.

## Cross-site uniqueness (critical)
Every generation is a NEW brand experience. NEVER reuse the same layout triple, palette, or typography stack across different websites. A per-request **Unique design brief** section is appended below—follow it exactly for variants and theme seeds.

## Layout variants (strict enums)
- Hero enum: \`default\` | \`centered\` | \`split\`
- Features enum: \`grid\` | \`list\` | \`cards\`
- CTA enum: \`default\` | \`minimal\` | \`split\`
- Header, Testimonials, FAQ, Footer: \`variant\` must be \`""\`
Use the brief's required Hero/Features/CTA tokens—not your habitual default combo.

## Visual rhythm
Within the page, contrast block layouts (hero vs features vs CTA). Across websites, obey the unique brief so no two scrapes produce the same design fingerprint.

## Art direction (mandatory)
You MUST tailor the \`theme\` tokens strictly to the business niche scraped in the source material. A plumber needs different borders and colors than a high-end law firm or a crypto startup. Deliberately select \`fontFamily\` and \`borderRadius\` to match the brand's psychology—not generic defaults.
- theme.fontFamily enum: \`sans\` (modern SaaS, trades, general business) | \`serif\` (luxury, law, finance, heritage) | \`mono\` (dev-tools, security, edgy tech)
- theme.borderRadius enum: \`none\` (serious/corporate) | \`sm\` (standard SaaS) | \`lg\` (friendly consumer) | \`full\` (playful DTC / youth brands)
Align both with the brief's archetype seeds; override when the scraped niche clearly demands different psychology.

## Theme & color token engine
Start from the brief's theme archetype seed colors and art-direction tokens; tune hex values to match scraped brand mood while preserving that archetype's personality.
- theme.colors: primary, secondary, background, text — WCAG AA contrast (≥ 4.5:1) on text/background and primary/background.
- Avoid converging on the same blue-and-white SaaS palette every time unless the source is explicitly that aesthetic.

## Source material pipeline (before JSON)
1. Mine: value proposition, ICP, pains, proof points, pricing signals, security claims.
2. Filter: drop nav crumbs, lorem, cookie banners, and legal boilerplate unless they inform objections.
3. Transform: rewrite every customer-facing string through CRO rules—never paste weak source copy unchanged.
4. SEO: if insights are appended below, weave keywords naturally after the CRO rewrite.

## Schema contract (non-negotiable)
- theme: colors (hex), fontFamily (sans | serif | mono), borderRadius (none | sm | lg | full).
- All content fields present per block; unused strings "", unused arrays [].
- Header: headline = exact Brand name from prompt (not UVP), 3–4 links [{ label, href }], items [], variant "".
- Hero: headline, subheadline, ctaText, variant (default | centered | split); items [], links [].
- Features: heading + exactly 3 items (title, description, icon), variant (grid | list | cards). Other blocks: item \`icon\` "".
- Testimonials: heading + exactly 3 items (quote without surrounding " marks, author, role).
- FAQ: heading + 3–5 items (question, answer).
- Hero & CTA use headline; Features, Testimonials, FAQ use heading.
- CTA: headline, buttonText, variant (default | minimal | split); subheadline or "".
- Footer: copyrightText, links [{ label, href }], items [], variant "".
- No markdown, HTML, or extra fields.`;

function buildGenerationPrompt(
  scrapedContent: string,
  directionLabel: string,
  brandName: string,
): string {
  return `You are writing a high-converting landing page—not transcribing the source below.

Brand name (Header logoText only): "${brandName}" — use exactly this string for the Header block; the Hero headline must be a separate UVP.

Design mandate: "${directionLabel}" — this layout/theme pairing must feel unique and intentional.

Step 1: Read the source and identify the transformation you can promise.
Step 2: Discard noise and generic corporate filler.
Step 3: Output the full Website JSON with AIDA-ordered layout, benefit-driven Features (3 items), objection-killing FAQ, theme tokens aligned to the design brief, and the exact Hero/Features/CTA variants specified in the brief.

--- SOURCE MATERIAL ---
${scrapedContent.trim()}
--- END SOURCE ---

Do not return until copy, colors, and variants all reflect this specific brief—not a generic template.`;
}

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

export type GenerateWebsiteOptions = {
  /** Original site <title> from scrape — stable company name. */
  siteTitle?: string | null;
  sourceUrl?: string;
};

export async function generateWebsiteData(
  scrapedContent: string,
  seoAudit?: SeoAuditResult,
  options?: GenerateWebsiteOptions,
): Promise<GenerateWebsiteResult> {
  try {
    if (!scrapedContent.trim()) {
      return { success: false, error: "Scraped content is required" };
    }

    requireOpenAiKey();

    const audit =
      seoAudit ??
      (options?.sourceUrl
        ? await performSeoAudit(options.sourceUrl)
        : null);

    if (!audit) {
      return {
        success: false,
        error: "SEO audit or sourceUrl is required for generation",
      };
    }
    const designDirection = pickDesignDirection();
    const brandName = resolveBrandName({
      siteTitle: options?.siteTitle,
      url: options?.sourceUrl,
    });

    const { object } = await generateObject({
      model: openai.chat("gpt-4o-mini"),
      temperature: 0.9,
      schema: WebsiteGenerationSchema,
      schemaName: "Website",
      schemaDescription:
        "High-converting landing page with unique layout variants and theme per design brief",
      system: `${SYSTEM_PROMPT}

${buildDesignDirectionPrompt(designDirection)}

## Deterministic SEO audit (apply last, after CRO rewrite)
Overall score: ${audit.overallScore}/100. Fix failed checks (remediation fields) via stronger copy and structure—never keyword-stuff or weaken persuasion.
${JSON.stringify(audit)}

Prioritize failed meta/structure items; mirror good title/description patterns in Hero and meta-minded copy.`,
      prompt: buildGenerationPrompt(
        scrapedContent,
        designDirection.label,
        brandName,
      ),
    });

    const website = normalizeWebsite(object, { brandName });
    return {
      success: true,
      data: syncWebsiteHeaderNav(
        applyDesignDirection(website, designDirection),
      ),
    };
  } catch (error) {
    return { success: false, error: formatError(error) };
  }
}
