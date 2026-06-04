import { z } from "zod";

import { getGuestIdFromRequest } from "@/lib/auth/guest";
import { getSessionFromRequest } from "@/lib/auth/session";
import {
  getSiteLayout,
  resolveSiteLayoutAccess,
  updateSiteLayout,
} from "@/lib/sites";
import { WebsiteSchema } from "@/types/layout";

export const runtime = "nodejs";

const SaveLayoutRequestSchema = z
  .object({
    siteId: z.string().min(1),
    website: WebsiteSchema,
  })
  .strict();

function layoutAccessFromRequest(request: Request) {
  const session = getSessionFromRequest(request);
  const guestId = getGuestIdFromRequest(request);

  return resolveSiteLayoutAccess({
    userId: session?.id ?? null,
    guestId: session ? null : guestId ?? null,
  });
}

export async function GET(request: Request) {
  try {
    const siteId = new URL(request.url).searchParams.get("siteId");

    if (!siteId) {
      return Response.json(
        { success: false, error: "siteId query parameter is required" },
        { status: 400 },
      );
    }

    const access = layoutAccessFromRequest(request);
    if (!access) {
      return Response.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const layout = await getSiteLayout(siteId, access);

    if (!layout) {
      return Response.json(
        { success: false, error: "Layout not found" },
        { status: 404 },
      );
    }

    return Response.json({ success: true, data: layout }, { status: 200 });
  } catch {
    return Response.json(
      { success: false, error: "Failed to load site layout" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = SaveLayoutRequestSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message ?? "Invalid request body",
        },
        { status: 400 },
      );
    }

    const access = layoutAccessFromRequest(request);
    if (!access) {
      return Response.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const site = await updateSiteLayout(
      parsed.data.siteId,
      parsed.data.website,
      access,
    );

    if (!site) {
      return Response.json(
        { success: false, error: "Site not found or access denied" },
        { status: 404 },
      );
    }

    return Response.json(
      { success: true, siteId: site.id },
      { status: 200 },
    );
  } catch {
    return Response.json(
      { success: false, error: "Failed to save site layout" },
      { status: 500 },
    );
  }
}
