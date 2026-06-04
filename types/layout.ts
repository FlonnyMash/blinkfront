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
  "Hero",
  "Features",
  "Testimonials",
  "FAQ",
  "CTA",
  "Footer",
]);

export type BlockType = z.infer<typeof BlockTypeSchema>;

export const HeroContentSchema = z
  .object({
    headline: z.string().min(1),
    subheadline: z.string().min(1),
    ctaText: z.string().min(1),
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
    sectionClassName: z.string().optional(),
    containerClassName: z.string().optional(),
  })
  .strict();

export const FooterLinkSchema = z
  .object({
    label: z.string().min(1),
    href: z.string().min(1),
  })
  .strict();

export const FooterContentSchema = z
  .object({
    copyrightText: z.string().min(1),
    links: z.array(FooterLinkSchema).min(1).max(6),
    sectionClassName: z.string().optional(),
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

export const LayoutBlockSchema = z.discriminatedUnion("type", [
  HeroBlockSchema,
  FeaturesBlockSchema,
  TestimonialsBlockSchema,
  FaqBlockSchema,
  CtaBlockSchema,
  FooterBlockSchema,
]);

export type LayoutBlock = z.infer<typeof LayoutBlockSchema>;
export type HeroContent = z.infer<typeof HeroContentSchema>;
export type FeaturesContent = z.infer<typeof FeaturesContentSchema>;
export type TestimonialsContent = z.infer<typeof TestimonialsContentSchema>;
export type FaqContent = z.infer<typeof FaqContentSchema>;
export type CtaContent = z.infer<typeof CtaContentSchema>;
export type FooterContent = z.infer<typeof FooterContentSchema>;

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
