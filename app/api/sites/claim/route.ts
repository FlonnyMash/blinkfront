import { z } from "zod";

import { getGuestIdFromRequest } from "@/lib/auth/guest";
import { getSessionFromRequest } from "@/lib/auth/session";
import { claimGuestSite } from "@/lib/sites";

export const runtime = "nodejs";

const ClaimSiteRequestSchema = z
  .object({
    siteId: z.string().min(1),
    guestId: z.string().min(1).optional(),
  })
  .strict();

export async function POST(request: Request) {
  try {
    const session = getSessionFromRequest(request);

    if (!session) {
      return Response.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const parsed = ClaimSiteRequestSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message ?? "Invalid request body",
        },
        { status: 400 },
      );
    }

    const guestId =
      parsed.data.guestId ?? getGuestIdFromRequest(request) ?? undefined;

    if (!guestId) {
      return Response.json(
        { success: false, error: "Guest session not found" },
        { status: 400 },
      );
    }

    const site = await claimGuestSite({
      siteId: parsed.data.siteId,
      guestId,
      userId: session.id,
    });

    if (!site) {
      return Response.json(
        { success: false, error: "Draft not found or already claimed" },
        { status: 404 },
      );
    }

    return Response.json(
      { success: true, siteId: site.id, userId: session.id },
      { status: 200 },
    );
  } catch {
    return Response.json(
      { success: false, error: "Failed to claim draft site" },
      { status: 500 },
    );
  }
}
