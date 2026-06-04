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

const THEME_FONT_FAMILY_VALUES = ["sans", "serif", "mono"] as const;
const THEME_BORDER_RADIUS_VALUES = ["none", "sm", "lg", "full"] as const;

/** Required for OpenAI strict JSON schema (no `.default()` — defaults applied in `normalizeThemeInput`). */
export const ThemeFontFamilySchema = z
  .enum(THEME_FONT_FAMILY_VALUES)
  .describe(
    "Choose 'serif' for luxury, law, or traditional brands. Choose 'mono' for dev-tools or edgy tech. Choose 'sans' for modern SaaS or generic businesses.",
  );

/** Required for OpenAI strict JSON schema (no `.default()` — defaults applied in `normalizeThemeInput`). */
export const ThemeBorderRadiusSchema = z
  .enum(THEME_BORDER_RADIUS_VALUES)
  .describe(
    "Choose 'none' for serious/corporate, 'sm' for standard SaaS, 'lg' for friendly/consumer, and 'full' for playful brands.",
  );

export type ThemeFontFamily = z.infer<typeof ThemeFontFamilySchema>;
export type ThemeBorderRadius = z.infer<typeof ThemeBorderRadiusSchema>;

const DEFAULT_THEME_FONT_FAMILY = "sans" satisfies ThemeFontFamily;
const DEFAULT_THEME_BORDER_RADIUS = "lg" satisfies ThemeBorderRadius;

function coerceThemeFontFamily(raw: unknown): ThemeFontFamily {
  const parsed = ThemeFontFamilySchema.safeParse(raw);
  return parsed.success ? parsed.data : DEFAULT_THEME_FONT_FAMILY;
}

function coerceThemeBorderRadius(raw: unknown): ThemeBorderRadius {
  const parsed = ThemeBorderRadiusSchema.safeParse(raw);
  return parsed.success ? parsed.data : DEFAULT_THEME_BORDER_RADIUS;
}

/** Base `--radius` for shadcn/ui (buttons, inputs) on the site wrapper. */
export const THEME_BORDER_RADIUS_CSS: Record<ThemeBorderRadius, string> = {
  none: "0",
  sm: "0.375rem",
  lg: "0.625rem",
  full: "1.5rem",
};

export const THEME_FONT_FAMILY_CLASS: Record<ThemeFontFamily, string> = {
  sans: "font-sans",
  serif: "font-serif",
  mono: "font-mono",
};

const ThemeSchemaInner = z
  .object({
    colors: ThemeColorsSchema,
    fontFamily: ThemeFontFamilySchema,
    borderRadius: ThemeBorderRadiusSchema,
  })
  .strict();

/** Maps legacy theme JSON and fills art-direction defaults before strict parse. */
function normalizeThemeInput(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") {
    return raw;
  }

  let record = { ...(raw as Record<string, unknown>) };

  if ("typography" in record && typeof record.typography === "object") {
    const typography = record.typography as { fontFamily?: string };
    const stack = (typography.fontFamily ?? "").toLowerCase();
    let legacyFontFamily: ThemeFontFamily = DEFAULT_THEME_FONT_FAMILY;

    if (
      stack.includes("mono") ||
      stack.includes("plex mono") ||
      stack.includes("jetbrains")
    ) {
      legacyFontFamily = "mono";
    } else if (
      stack.includes("serif") ||
      stack.includes("playfair") ||
      stack.includes("georgia")
    ) {
      legacyFontFamily = "serif";
    }

    delete record.typography;
    record = { ...record, fontFamily: legacyFontFamily };
  }

  return {
    ...record,
    fontFamily: coerceThemeFontFamily(record.fontFamily),
    borderRadius: coerceThemeBorderRadius(record.borderRadius),
  };
}

/** Strict theme shape for LLM `generateObject` (no preprocess). */
export const ThemeGenerationSchema = ThemeSchemaInner;

export const ThemeSchema = z.preprocess(normalizeThemeInput, ThemeSchemaInner);

export type Theme = z.infer<typeof ThemeSchemaInner>;
export type ThemeColors = z.infer<typeof ThemeColorsSchema>;

export function parseTheme(theme: unknown): Theme {
  return ThemeSchema.parse(theme);
}

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

/** All variant tokens the generation schema may emit (block-type-specific subset required per block). */
export const LayoutVariantGenerationSchema = z.enum([
  "",
  "default",
  "centered",
  "split",
  "grid",
  "list",
  "cards",
  "minimal",
]);

export type HeroVariant = z.infer<typeof HeroVariantSchema>;
export type FeaturesVariant = z.infer<typeof FeaturesVariantSchema>;
export type CtaVariant = z.infer<typeof CtaVariantSchema>;
export type LayoutVariantGeneration = z.infer<typeof LayoutVariantGenerationSchema>;

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
    variant: HeroVariantSchema.default("centered"),
    sectionClassName: z.string().optional(),
    containerClassName: z.string().optional(),
  })
  .strict();

export const FeatureItemSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1),
    icon: z
      .string()
      .optional()
      .describe(
        "A valid lucide-react icon name in PascalCase (e.g. Rocket, ShieldCheck, Zap, TrendingUp). Choose a semantically appropriate icon.",
      ),
    iconClassName: z.string().optional(),
  })
  .strict();

export const FeaturesContentSchema = z
  .object({
    heading: z.string().min(1),
    items: z.array(FeatureItemSchema).length(3),
    variant: FeaturesVariantSchema.default("cards"),
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
    variant: CtaVariantSchema.default("split"),
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
  "CRITICAL: Pick exactly one enum token matching this block's `type`. Hero: default | centered | split. Features: grid | list | cards. CTA: default | minimal | split. Header, Testimonials, FAQ, Footer: \"\" only. Analyze copy before choosing—never blindly reuse the same token across blocks.";

/** OpenAI strict structured output requires every property key to appear in `required`. */
const LayoutBlockItemGenerationSchema = z
  .object({
    title: z.string(),
    description: z.string(),
    icon: z.string(),
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
    variant: LayoutVariantGenerationSchema.describe(VARIANT_GENERATION_DESCRIPTION),
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
  raw: LayoutVariantGeneration | string | undefined,
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
        icon: optionalNonEmpty(item.icon),
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
    icon: "Zap",
  },
  {
    title: "Stay in control",
    description: "One dashboard for visibility across every customer touchpoint.",
    icon: "LayoutDashboard",
  },
  {
    title: "Prove ROI",
    description: "Track outcomes that matter to your team and your buyers.",
    icon: "TrendingUp",
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

/** Section `id` attributes rendered on page blocks — nav hrefs must target these. */
export const LAYOUT_SECTION_ANCHORS = [
  { blockType: "Features" as const, id: "features", defaultLabel: "Features" },
  {
    blockType: "Testimonials" as const,
    id: "testimonials",
    defaultLabel: "Testimonials",
  },
  { blockType: "FAQ" as const, id: "faq", defaultLabel: "FAQ" },
  { blockType: "CTA" as const, id: "cta", defaultLabel: "Contact" },
] as const;

/** Builds nav links from blocks present in the layout (href = `#${sectionId}`). */
export function deriveNavLinksFromLayout(
  layout: LayoutBlock[],
): HeaderContent["links"] {
  return LAYOUT_SECTION_ANCHORS.filter(({ blockType }) =>
    layout.some((block) => block.type === blockType),
  ).map(({ id, defaultLabel }) => ({
    label: defaultLabel,
    href: `#${id}`,
  }));
}

function normalizeNavHref(href: string): string {
  const trimmed = href.trim();
  if (!trimmed) {
    return "";
  }
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}

/** Keeps AI-written labels when they target a real section; hrefs always match layout. */
function mergeNavLinkLabels(
  aiLinks: HeaderContent["links"],
  derived: HeaderContent["links"],
): HeaderContent["links"] {
  return derived.map((link) => {
    const match = aiLinks.find(
      (candidate) => normalizeNavHref(candidate.href) === link.href,
    );
    return {
      href: link.href,
      label: match?.label.trim() || link.label,
    };
  });
}

/** Syncs header nav hrefs (and labels) with sections actually on the page. */
export function syncHeaderNavLinks(layout: LayoutBlock[]): LayoutBlock[] {
  const derived = deriveNavLinksFromLayout(layout);
  if (derived.length === 0) {
    return layout;
  }

  return layout.map((block) => {
    if (block.type !== "Header") {
      return block;
    }

    return {
      type: "Header",
      content: {
        ...block.content,
        links: mergeNavLinkLabels(block.content.links, derived),
      },
    };
  });
}

export function syncWebsiteHeaderNav(website: Website): Website {
  return {
    ...website,
    layout: syncHeaderNavLinks(website.layout),
  };
}

const DEFAULT_HEADER_LINKS: HeaderContent["links"] = LAYOUT_SECTION_ANCHORS.map(
  ({ id, defaultLabel }) => ({
    label: defaultLabel,
    href: `#${id}`,
  }),
);

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

/** Stable company name from scrape metadata or URL (not the hero UVP). */
export function resolveBrandName(input: {
  siteTitle?: string | null;
  url?: string;
  fallback?: string;
}): string {
  const fromTitle = input.siteTitle?.trim();
  if (fromTitle) {
    return normalizeHeaderLogoText(fromTitle);
  }

  if (input.url?.trim()) {
    try {
      const host = new URL(input.url).hostname.replace(/^www\./i, "");
      const segment = host.split(".")[0] ?? "";
      if (segment) {
        const words = segment.replace(/[-_]+/g, " ");
        return normalizeHeaderLogoText(words);
      }
    } catch {
      // invalid URL — use fallback below
    }
  }

  return normalizeHeaderLogoText(input.fallback ?? "Website");
}

/** Locks header logoText to the company brand (browser tab + nav). */
export function syncBrandIdentity(
  layout: LayoutBlock[],
  brandName: string,
): LayoutBlock[] {
  const logoText = normalizeHeaderLogoText(brandName);

  return layout.map((block) => {
    if (block.type !== "Header") {
      return block;
    }

    return {
      type: "Header",
      content: {
        ...block.content,
        logoText,
      },
    };
  });
}

/** Company name shown in the header and browser title — not the hero headline. */
export function getBrandName(data: Website): string {
  const header = data.layout.find((block) => block.type === "Header");
  return header?.content.logoText.trim() || "Website";
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

  const withHeader = hasHeader
    ? layout.map(normalizeHeaderBlock)
    : [createDefaultHeaderBlock(fallbackLogo), ...layout];

  return syncHeaderNavLinks(withHeader);
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
          variant: coerceVariant(content.variant, HeroVariantSchema, "centered"),
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
          variant: coerceVariant(content.variant, CtaVariantSchema, "split"),
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
    theme: ThemeGenerationSchema,
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

export type NormalizeWebsiteOptions = {
  /** Scraped `<title>` or other stable company name — not the hero UVP. */
  brandName?: string;
};

/** Normalizes LLM output into the strict Design Core website shape. */
export function normalizeWebsite(
  data: WebsiteGeneration,
  options?: NormalizeWebsiteOptions,
): Website {
  let layout = syncHeaderNavLinks(data.layout.map(parseLayoutBlock));

  if (options?.brandName?.trim()) {
    layout = syncBrandIdentity(layout, options.brandName);
  }

  return {
    theme: parseTheme(data.theme),
    layout,
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
