import { z } from "zod";

import { generateWebsiteData } from "@/lib/ai/generate-site";
import { SeoAuditSchema } from "@/lib/validations/seo-audit";

export const maxDuration = 60;

const GenerateRequestSchema = z
  .object({
    scrapedContent: z.string().min(1),
    seoAudit: SeoAuditSchema.optional(),
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
