import { z } from "zod";

/** Single deterministic SEO check — binary outcome plus optional metric value. */
export const SeoAuditCheckSchema = z
  .object({
    passed: z.boolean(),
    score: z.number().min(0).max(100),
    value: z.string().nullable(),
    remediation: z.string(),
  })
  .strict();

export type SeoAuditCheck = z.infer<typeof SeoAuditCheckSchema>;

export const SeoAuditResultSchema = z
  .object({
    url: z.string().url(),
    overallScore: z.number().min(0).max(100),
    auditedAt: z.string().datetime(),
    meta: z
      .object({
        title: SeoAuditCheckSchema,
        description: SeoAuditCheckSchema,
        openGraph: SeoAuditCheckSchema,
        canonical: SeoAuditCheckSchema,
      })
      .strict(),
    structure: z
      .object({
        h1Count: SeoAuditCheckSchema,
        headingOrderValid: SeoAuditCheckSchema,
        semanticTagsUsed: SeoAuditCheckSchema,
      })
      .strict(),
    images: z
      .object({
        totalImages: SeoAuditCheckSchema,
        missingAltCount: SeoAuditCheckSchema,
        imagesWithAlt: SeoAuditCheckSchema,
      })
      .strict(),
    links: z
      .object({
        totalLinks: SeoAuditCheckSchema,
        descriptiveTextCount: SeoAuditCheckSchema,
        brokenLinksCount: SeoAuditCheckSchema,
      })
      .strict(),
  })
  .strict();

export type SeoAuditResult = z.infer<typeof SeoAuditResultSchema>;
