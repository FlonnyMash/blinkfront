import { z } from "zod";

import { performSeoAudit } from "@/lib/ai/seo-audit";

export const maxDuration = 60;

const SeoAuditRequestSchema = z
  .object({ rawContent: z.string().min(1) })
  .strict();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = SeoAuditRequestSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message ?? "Invalid request body",
        },
        { status: 400 },
      );
    }

    const data = await performSeoAudit(parsed.data.rawContent);
    return Response.json({ success: true, data }, { status: 200 });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "SEO audit failed",
      },
      { status: 500 },
    );
  }
}
