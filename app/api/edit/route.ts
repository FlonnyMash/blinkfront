import { z } from "zod";

import { editWebsiteData } from "@/lib/ai/edit-site";
import { SeoAuditSchema } from "@/lib/validations/seo-audit";
import { WebsiteSchema } from "@/lib/validations/website";

export const maxDuration = 60;

const EditRequestSchema = z
  .object({
    currentData: WebsiteSchema,
    userPrompt: z.string().min(1),
    seoInsights: SeoAuditSchema,
  })
  .strict();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = EditRequestSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message ?? "Invalid request body",
        },
        { status: 400 },
      );
    }

    const result = await editWebsiteData(
      parsed.data.currentData,
      parsed.data.userPrompt,
      parsed.data.seoInsights,
    );

    return Response.json(result, { status: 200 });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to edit website",
      },
      { status: 500 },
    );
  }
}
