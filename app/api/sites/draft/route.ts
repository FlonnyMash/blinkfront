import { createDraftSite } from "@/lib/sites";

export const runtime = "nodejs";

export async function POST() {
  try {
    const site = await createDraftSite();

    if (!site) {
      return Response.json(
        {
          success: false,
          error: "Lead capture requires DATABASE_URL to be configured",
        },
        { status: 503 },
      );
    }

    return Response.json({ success: true, siteId: site.id }, { status: 200 });
  } catch {
    return Response.json(
      { success: false, error: "Failed to create draft site" },
      { status: 500 },
    );
  }
}
