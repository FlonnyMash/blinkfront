import { z } from "zod";

export const ThemeSchema = z
  .object({
    stylePreset: z.enum(["default", "apple", "minimal", "bold"]),
    primaryColor: z.string(),
    textColor: z.string(),
    mutedTextColor: z.string(),
    backgroundColor: z.string(),
  })
  .strict();

export type WebsiteTheme = z.infer<typeof ThemeSchema>;

export const WebsiteSchema = z
  .object({
    theme: ThemeSchema,
    header: z
      .object({
        logoText: z.string(),
        navLinks: z.array(z.string()).max(4),
      })
      .strict(),
    hero: z
      .object({
        headline: z.string(),
        subheadline: z.string(),
        ctaText: z.string(),
      })
      .strict(),
    features: z
      .array(
        z
          .object({
            title: z.string(),
            description: z.string(),
          })
          .strict(),
      )
      .length(3),
    testimonials: z
      .array(
        z
          .object({
            quote: z.string(),
            author: z.string(),
            role: z.string(),
          })
          .strict(),
      )
      .length(3),
    faq: z
      .array(
        z
          .object({
            question: z.string(),
            answer: z.string(),
          })
          .strict(),
      )
      .min(3)
      .max(5),
    ctaSection: z
      .object({
        headline: z.string(),
        buttonText: z.string(),
      })
      .strict(),
    footer: z
      .object({
        copyrightText: z.string(),
        bottomLinks: z.array(z.string()),
      })
      .strict(),
  })
  .strict();

export type Website = z.infer<typeof WebsiteSchema>;
