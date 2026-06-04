import { z } from "zod";

import { createLead } from "@/lib/leads";

export const runtime = "nodejs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const LeadRequestSchema = z
  .object({
    email: z.email(),
    siteId: z.string().min(1),
  })
  .strict();

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = LeadRequestSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message ?? "Invalid request body",
        },
        { status: 400, headers: corsHeaders },
      );
    }

    const result = await createLead({
      email: parsed.data.email,
      siteId: parsed.data.siteId,
    });

    if (!result.success) {
      if (result.error === "database_not_configured") {
        return Response.json(
          { success: false, error: "Lead capture is not configured" },
          { status: 503, headers: corsHeaders },
        );
      }

      return Response.json(
        { success: false, error: "Site not found" },
        { status: 404, headers: corsHeaders },
      );
    }

    return Response.json({ success: true }, { status: 200, headers: corsHeaders });
  } catch {
    return Response.json(
      { success: false, error: "Failed to save lead" },
      { status: 500, headers: corsHeaders },
    );
  }
}
