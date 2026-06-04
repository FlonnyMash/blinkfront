import { z } from "zod";

/** CSS hex color token (#rgb or #rrggbb). */
export const ColorTokenSchema = z
  .string()
  .regex(
    /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/,
    "Must be a hex color (e.g. #0071e3 or #fff)",
  );

export const ThemeColorsSchema = z
  .object({
    primary: ColorTokenSchema,
    secondary: ColorTokenSchema,
    background: ColorTokenSchema,
    text: ColorTokenSchema,
  })
  .strict();

export const ThemeTypographySchema = z
  .object({
    fontFamily: z.string().min(1),
  })
  .strict();

export const ThemeSchema = z
  .object({
    colors: ThemeColorsSchema,
    typography: ThemeTypographySchema,
  })
  .strict();

export type Theme = z.infer<typeof ThemeSchema>;
export type ThemeColors = z.infer<typeof ThemeColorsSchema>;

export const BlockTypeSchema = z.enum([
  "Header",
  "Hero",
  "Features",
  "Testimonials",
  "FAQ",
  "CTA",
  "Footer",
]);

export type BlockType = z.infer<typeof BlockTypeSchema>;

export const HeroVariantSchema = z.enum(["default", "centered", "split"]);
export const FeaturesVariantSchema = z.enum(["grid", "list", "cards"]);
export const CtaVariantSchema = z.enum(["default", "minimal", "split"]);

export type HeroVariant = z.infer<typeof HeroVariantSchema>;
export type FeaturesVariant = z.infer<typeof FeaturesVariantSchema>;
export type CtaVariant = z.infer<typeof CtaVariantSchema>;

export const NavLinkSchema = z
  .object({
    label: z.string().min(1),
    href: z.string().min(1),
  })
  .strict();

export const HeaderContentSchema = z
  .object({
    logoText: z.string().min(1),
    links: z.array(NavLinkSchema).min(1).max(6),
    sectionClassName: z.string().optional(),
  })
  .strict();

export const HeroContentSchema = z
  .object({
    headline: z.string().min(1),
    subheadline: z.string().min(1),
    ctaText: z.string().min(1),
    variant: HeroVariantSchema.optional().default("default"),
    sectionClassName: z.string().optional(),
    containerClassName: z.string().optional(),
  })
  .strict();

export const FeatureItemSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1),
    iconClassName: z.string().optional(),
  })
  .strict();

export const FeaturesContentSchema = z
  .object({
    heading: z.string().min(1),
    items: z.array(FeatureItemSchema).length(3),
    variant: FeaturesVariantSchema.optional().default("cards"),
    sectionClassName: z.string().optional(),
    gridClassName: z.string().optional(),
  })
  .strict();

export const TestimonialItemSchema = z
  .object({
    quote: z.string().min(1),
    author: z.string().min(1),
    role: z.string().min(1),
  })
  .strict();

export const TestimonialsContentSchema = z
  .object({
    heading: z.string().min(1),
    items: z.array(TestimonialItemSchema).length(3),
    sectionClassName: z.string().optional(),
    gridClassName: z.string().optional(),
  })
  .strict();

export const FaqItemSchema = z
  .object({
    question: z.string().min(1),
    answer: z.string().min(1),
  })
  .strict();

export const FaqContentSchema = z
  .object({
    heading: z.string().min(1),
    items: z.array(FaqItemSchema).min(3).max(5),
    sectionClassName: z.string().optional(),
  })
  .strict();

export const CtaContentSchema = z
  .object({
    headline: z.string().min(1),
    subheadline: z.string().optional(),
    buttonText: z.string().min(1),
    variant: CtaVariantSchema.optional().default("default"),
    sectionClassName: z.string().optional(),
    containerClassName: z.string().optional(),
  })
  .strict();

export const FooterLinkSchema = NavLinkSchema;

export const FooterContentSchema = z
  .object({
    copyrightText: z.string().min(1),
    links: z.array(FooterLinkSchema).min(1).max(6),
    sectionClassName: z.string().optional(),
  })
  .strict();

export const HeaderBlockSchema = z
  .object({
    type: z.literal("Header"),
    content: HeaderContentSchema,
  })
  .strict();

export const HeroBlockSchema = z
  .object({
    type: z.literal("Hero"),
    content: HeroContentSchema,
  })
  .strict();

export const FeaturesBlockSchema = z
  .object({
    type: z.literal("Features"),
    content: FeaturesContentSchema,
  })
  .strict();

export const TestimonialsBlockSchema = z
  .object({
    type: z.literal("Testimonials"),
    content: TestimonialsContentSchema,
  })
  .strict();

export const FaqBlockSchema = z
  .object({
    type: z.literal("FAQ"),
    content: FaqContentSchema,
  })
  .strict();

export const CtaBlockSchema = z
  .object({
    type: z.literal("CTA"),
    content: CtaContentSchema,
  })
  .strict();

export const FooterBlockSchema = z
  .object({
    type: z.literal("Footer"),
    content: FooterContentSchema,
  })
  .strict();

/** Guides the LLM on `content.variant`; paired with block `type` in LayoutBlockGenerationSchema. */
const VARIANT_GENERATION_DESCRIPTION =
  "CRITICAL: You MUST choose a variant that matches this block's `type`. For type Hero use exactly one of: 'default' | 'centered' | 'split'. For type Features use exactly one of: 'grid' | 'list' | 'cards'. For type CTA use exactly one of: 'default' | 'minimal' | 'split'. For Header, Testimonials, FAQ, Footer use empty string \"\". Do NOT invent values or default every block to 'default'.";

/** OpenAI strict structured output requires every property key to appear in `required`. */
const LayoutBlockItemGenerationSchema = z
  .object({
    title: z.string(),
    description: z.string(),
    iconClassName: z.string(),
    quote: z.string(),
    author: z.string(),
    role: z.string(),
    question: z.string(),
    answer: z.string(),
  })
  .strict();

export const BlockContentGenerationSchema = z
  .object({
    headline: z.string(),
    subheadline: z.string(),
    ctaText: z.string(),
    buttonText: z.string(),
    heading: z.string(),
    copyrightText: z.string(),
    sectionClassName: z.string(),
    containerClassName: z.string(),
    gridClassName: z.string(),
    variant: z.string().describe(VARIANT_GENERATION_DESCRIPTION),
    items: z.array(LayoutBlockItemGenerationSchema),
    links: z.array(FooterLinkSchema),
  })
  .strict();

export const LayoutBlockGenerationSchema = z
  .object({
    type: BlockTypeSchema,
    content: BlockContentGenerationSchema,
  })
  .strict();

export type LayoutBlockGeneration = z.infer<typeof LayoutBlockGenerationSchema>;
export type BlockContentGeneration = z.infer<typeof BlockContentGenerationSchema>;

export const LayoutBlockSchema = z.discriminatedUnion("type", [
  HeaderBlockSchema,
  HeroBlockSchema,
  FeaturesBlockSchema,
  TestimonialsBlockSchema,
  FaqBlockSchema,
  CtaBlockSchema,
  FooterBlockSchema,
]);

export type LayoutBlock = z.infer<typeof LayoutBlockSchema>;
export type HeaderContent = z.infer<typeof HeaderContentSchema>;
export type HeroContent = z.infer<typeof HeroContentSchema>;
export type FeaturesContent = z.infer<typeof FeaturesContentSchema>;
export type TestimonialsContent = z.infer<typeof TestimonialsContentSchema>;
export type FaqContent = z.infer<typeof FaqContentSchema>;
export type CtaContent = z.infer<typeof CtaContentSchema>;
export type FooterContent = z.infer<typeof FooterContentSchema>;

function optionalNonEmpty(value: string): string | undefined {
  return value.trim() ? value.trim() : undefined;
}

function trimRequired(value: string): string {
  return value.trim();
}

function pickOptional(
  fields: Record<string, string | undefined>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(fields).filter(
      ([, value]) => value !== undefined && value.trim() !== "",
    ),
  ) as Record<string, string>;
}

/** Fallback only when the model omits, blanks, or hallucinates an invalid variant. */
function coerceVariant<T extends string>(
  raw: string | undefined,
  schema: z.ZodType<T>,
  fallback: T,
): T {
  const trimmed = raw?.trim();
  if (!trimmed) {
    return fallback;
  }
  const result = schema.safeParse(trimmed);
  return result.success ? result.data : fallback;
}

function filterFeatureItems(items: BlockContentGeneration["items"]) {
  return items
    .filter((item) => item.title.trim() && item.description.trim())
    .map((item) => ({
      title: item.title.trim(),
      description: item.description.trim(),
      ...pickOptional({
        iconClassName: optionalNonEmpty(item.iconClassName),
      }),
    }));
}

function filterTestimonialItems(items: BlockContentGeneration["items"]) {
  return items
    .filter(
      (item) =>
        item.quote.trim() && item.author.trim() && item.role.trim(),
    )
    .map((item) => ({
      quote: item.quote.trim(),
      author: item.author.trim(),
      role: item.role.trim(),
    }));
}

function filterFaqItems(items: BlockContentGeneration["items"]) {
  return items
    .map((item) => ({
      question: (item.question.trim() || item.title.trim()),
      answer: (item.answer.trim() || item.description.trim()),
    }))
    .filter((item) => item.question && item.answer)
    .map((item) => ({
      question: item.question,
      answer: item.answer,
    }));
}

function ensureItemCount<T>(
  items: T[],
  min: number,
  placeholders: T[],
  max?: number,
): T[] {
  const result = [...items];
  for (let i = result.length; i < min; i++) {
    result.push(placeholders[i % placeholders.length]!);
  }
  return max === undefined ? result : result.slice(0, max);
}

const FEATURE_ITEM_PLACEHOLDERS: z.infer<typeof FeatureItemSchema>[] = [
  {
    title: "Ship faster",
    description: "Launch workflows in minutes instead of weeks of setup.",
  },
  {
    title: "Stay in control",
    description: "One dashboard for visibility across every customer touchpoint.",
  },
  {
    title: "Prove ROI",
    description: "Track outcomes that matter to your team and your buyers.",
  },
];

const TESTIMONIAL_ITEM_PLACEHOLDERS: z.infer<typeof TestimonialItemSchema>[] = [
  {
    quote: "We cut onboarding time in half within the first month.",
    author: "Alex Rivera",
    role: "Head of Operations",
  },
  {
    quote: "The team finally has one source of truth for every launch.",
    author: "Jordan Lee",
    role: "Product Lead",
  },
  {
    quote: "Our conversion rate climbed after we rewrote the story around outcomes.",
    author: "Sam Patel",
    role: "Growth Manager",
  },
];

const FAQ_ITEM_PLACEHOLDERS: z.infer<typeof FaqItemSchema>[] = [
  {
    question: "How long does setup take?",
    answer:
      "Most teams are live in under a day with guided onboarding and import tools.",
  },
  {
    question: "Can we cancel anytime?",
    answer:
      "Yes—plans are flexible with no long-term lock-in on standard tiers.",
  },
  {
    question: "Is our data secure?",
    answer:
      "We use industry-standard encryption, access controls, and regular audits.",
  },
];

function filterNavLinks(links: BlockContentGeneration["links"]) {
  return links.filter((link) => link.label.trim() && link.href.trim());
}

const DEFAULT_HEADER_LINKS: HeaderContent["links"] = [
  { label: "Features", href: "#features" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#cta" },
];

const MAX_HEADER_LOGO_LENGTH = 28;

/** Short brand label for the nav bar — never the full hero headline. */
export function normalizeHeaderLogoText(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) {
    return "Home";
  }

  const beforeColon = trimmed.split(":")[0]?.trim() ?? trimmed;
  const candidate =
    beforeColon.length < trimmed.length ? beforeColon : trimmed;

  if (candidate.length <= MAX_HEADER_LOGO_LENGTH) {
    return candidate;
  }

  const words = candidate.split(/\s+/).filter(Boolean);
  let result = "";
  for (const word of words) {
    const next = result ? `${result} ${word}` : word;
    if (next.length > MAX_HEADER_LOGO_LENGTH) {
      break;
    }
    result = next;
  }

  return result || candidate.slice(0, MAX_HEADER_LOGO_LENGTH).trim();
}

export function createDefaultHeaderBlock(logoText: string): LayoutBlock {
  return {
    type: "Header",
    content: {
      logoText: normalizeHeaderLogoText(logoText),
      links: DEFAULT_HEADER_LINKS,
    },
  };
}

function normalizeHeaderBlock(block: LayoutBlock): LayoutBlock {
  if (block.type !== "Header") {
    return block;
  }

  return {
    type: "Header",
    content: {
      ...block.content,
      logoText: normalizeHeaderLogoText(block.content.logoText),
    },
  };
}

export function ensureHeaderBlock(
  layout: LayoutBlock[],
  fallbackLogo: string,
): LayoutBlock[] {
  const hasHeader = layout.some((block) => block.type === "Header");

  if (hasHeader) {
    return layout.map(normalizeHeaderBlock);
  }

  return [createDefaultHeaderBlock(fallbackLogo), ...layout];
}

const SECTION_HEADING_DEFAULTS = {
  Features: "Why choose us",
  Testimonials: "What our customers say",
  FAQ: "Frequently asked questions",
} as const;

function resolveSectionHeading(
  content: BlockContentGeneration,
  fallback: string,
): string {
  return content.heading.trim() || content.headline.trim() || fallback;
}

function parseLayoutBlock(block: LayoutBlockGeneration): LayoutBlock {
  const { type, content } = block;
  const sectionClassName = optionalNonEmpty(content.sectionClassName);
  const containerClassName = optionalNonEmpty(content.containerClassName);
  const gridClassName = optionalNonEmpty(content.gridClassName);

  switch (type) {
    case "Header": {
      const links = filterNavLinks(content.links);
      return {
        type,
        content: HeaderContentSchema.parse({
          logoText: normalizeHeaderLogoText(
            trimRequired(content.headline || content.heading),
          ),
          links: links.length > 0 ? links : DEFAULT_HEADER_LINKS,
          ...pickOptional({ sectionClassName }),
        }),
      };
    }
    case "Hero":
      return {
        type,
        content: HeroContentSchema.parse({
          headline: trimRequired(content.headline || content.heading),
          subheadline: trimRequired(content.subheadline),
          ctaText: trimRequired(content.ctaText || content.buttonText),
          variant: coerceVariant(content.variant, HeroVariantSchema, "default"),
          ...pickOptional({ sectionClassName, containerClassName }),
        }),
      };
    case "Features":
      return {
        type,
        content: FeaturesContentSchema.parse({
          heading: resolveSectionHeading(
            content,
            SECTION_HEADING_DEFAULTS.Features,
          ),
          variant: coerceVariant(content.variant, FeaturesVariantSchema, "cards"),
          ...pickOptional({ sectionClassName, gridClassName }),
          items: ensureItemCount(
            filterFeatureItems(content.items),
            3,
            FEATURE_ITEM_PLACEHOLDERS,
            3,
          ),
        }),
      };
    case "Testimonials":
      return {
        type,
        content: TestimonialsContentSchema.parse({
          heading: resolveSectionHeading(
            content,
            SECTION_HEADING_DEFAULTS.Testimonials,
          ),
          ...pickOptional({ sectionClassName, gridClassName }),
          items: ensureItemCount(
            filterTestimonialItems(content.items),
            3,
            TESTIMONIAL_ITEM_PLACEHOLDERS,
            3,
          ),
        }),
      };
    case "FAQ":
      return {
        type,
        content: FaqContentSchema.parse({
          heading: resolveSectionHeading(content, SECTION_HEADING_DEFAULTS.FAQ),
          ...pickOptional({ sectionClassName }),
          items: ensureItemCount(
            filterFaqItems(content.items),
            3,
            FAQ_ITEM_PLACEHOLDERS,
            5,
          ),
        }),
      };
    case "CTA":
      return {
        type,
        content: CtaContentSchema.parse({
          headline: trimRequired(content.headline || content.heading),
          buttonText: trimRequired(content.buttonText || content.ctaText),
          variant: coerceVariant(content.variant, CtaVariantSchema, "default"),
          ...pickOptional({
            subheadline: optionalNonEmpty(content.subheadline),
            sectionClassName,
            containerClassName,
          }),
        }),
      };
    case "Footer":
      return {
        type,
        content: FooterContentSchema.parse({
          copyrightText: trimRequired(content.copyrightText),
          ...pickOptional({ sectionClassName }),
          links: filterNavLinks(content.links),
        }),
      };
    default: {
      const exhaustiveCheck: never = type;
      throw new Error(`Unknown block type: ${exhaustiveCheck}`);
    }
  }
}

/**
 * OpenAI-compatible schema for `generateObject` (no discriminated unions / oneOf).
 * All content fields are required; use "" for unused strings and [] for unused arrays.
 */
export const WebsiteGenerationSchema = z
  .object({
    theme: ThemeSchema,
    layout: z.array(LayoutBlockGenerationSchema).min(1),
  })
  .strict();

export type WebsiteGeneration = z.infer<typeof WebsiteGenerationSchema>;

/** Pads list blocks so strict `WebsiteSchema` parse does not fail on short LLM arrays. */
export function stabilizeWebsiteInput(data: unknown): unknown {
  if (!data || typeof data !== "object" || !("layout" in data)) {
    return data;
  }

  const record = data as { theme?: unknown; layout?: unknown };
  if (!Array.isArray(record.layout)) {
    return data;
  }

  return {
    ...record,
    layout: record.layout.map((block) => {
      if (!block || typeof block !== "object") {
        return block;
      }

      const typed = block as { type?: string; content?: { items?: unknown[] } };
      const items = typed.content?.items;
      if (!Array.isArray(items)) {
        return block;
      }

      switch (typed.type) {
        case "Features":
          return {
            ...typed,
            content: {
              ...typed.content,
              items: ensureItemCount(
                items as z.infer<typeof FeatureItemSchema>[],
                3,
                FEATURE_ITEM_PLACEHOLDERS,
                3,
              ),
            },
          };
        case "Testimonials":
          return {
            ...typed,
            content: {
              ...typed.content,
              items: ensureItemCount(
                items as z.infer<typeof TestimonialItemSchema>[],
                3,
                TESTIMONIAL_ITEM_PLACEHOLDERS,
                3,
              ),
            },
          };
        case "FAQ":
          return {
            ...typed,
            content: {
              ...typed.content,
              items: ensureItemCount(
                items as z.infer<typeof FaqItemSchema>[],
                3,
                FAQ_ITEM_PLACEHOLDERS,
                5,
              ),
            },
          };
        default:
          return block;
      }
    }),
  };
}

/** Normalizes LLM output into the strict Design Core website shape. */
export function normalizeWebsite(data: WebsiteGeneration): Website {
  return {
    theme: data.theme,
    layout: data.layout.map(parseLayoutBlock),
  };
}

/**
 * Design Core website schema — component-driven layout consumed by the render
 * engine and Vercel AI SDK structured output (`generateObject` / `streamObject`).
 */
export const WebsiteSchema = z
  .object({
    theme: ThemeSchema,
    layout: z.array(LayoutBlockSchema).min(1),
  })
  .strict();

export type Website = z.infer<typeof WebsiteSchema>;

export function parseWebsite(data: unknown): Website {
  return WebsiteSchema.parse(data);
}

export function safeParseWebsite(
  data: unknown,
): z.ZodSafeParseResult<Website> {
  return WebsiteSchema.safeParse(data);
}
