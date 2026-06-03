import { z } from "zod";

export const SeoAuditSchema = z
  .object({
    url: z.string().url(),
    meta: z
      .object({
        title: z.string().nullable(),
        description: z.string().nullable(),
      })
      .strict(),
    headings: z
      .object({
        h1: z.array(z.string()),
        h2: z.array(z.string()),
      })
      .strict(),
    wordCount: z.number().int().nonnegative(),
    rawContent: z.string(),
  })
  .strict();

export type SeoAudit = z.infer<typeof SeoAuditSchema>;
