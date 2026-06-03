import { z } from "zod";

export const SeoAuditSchema = z.object({
  score: z.number().int().min(0).max(100),
  primaryKeywords: z.array(z.string()),
  targetAudience: z.string(),
  contentGap: z.string(),
  seoAdvice: z.string(),
});

export type SeoAuditInsights = z.infer<typeof SeoAuditSchema>;
