import { z } from "zod";

import { editWebsiteData } from "@/lib/ai/edit-site";
import { WebsiteSchema } from "@/types/layout";

export const maxDuration = 60;

const EditRequestSchema = z
  .object({
    currentWebsite: WebsiteSchema,
    userPrompt: z.string().min(1),
    seoInsights: z.string().optional(),
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
      parsed.data.currentWebsite,
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
