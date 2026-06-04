import { z } from "zod";

import { generateWebsiteData } from "@/lib/ai/generate-site";
import { SeoAuditResultSchema } from "@/lib/validations/seo-audit-result";

export const maxDuration = 60;

const GenerateRequestSchema = z
  .object({
    scrapedContent: z.string().min(1),
    seoAudit: SeoAuditResultSchema.optional(),
    siteTitle: z.string().nullable().optional(),
    sourceUrl: z.string().url().optional(),
  })
  .strict();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = GenerateRequestSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message ?? "Invalid request body",
        },
        { status: 400 },
      );
    }

    const result = await generateWebsiteData(
      parsed.data.scrapedContent,
      parsed.data.seoAudit,
      {
        siteTitle: parsed.data.siteTitle,
        sourceUrl: parsed.data.sourceUrl,
      },
    );

    return Response.json(result, { status: 200 });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to generate website",
      },
      { status: 500 },
    );
  }
}
