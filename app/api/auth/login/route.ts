import { z } from "zod";

import { clearGuestIdCookie } from "@/lib/auth/guest";
import { clearSession, setSession } from "@/lib/auth/session";
import { claimGuestSite } from "@/lib/sites";

export const runtime = "nodejs";

const LoginRequestSchema = z
  .object({
    email: z.string().email(),
    siteId: z.string().min(1).optional(),
    guestId: z.string().min(1).optional(),
  })
  .strict();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = LoginRequestSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message ?? "Invalid request body",
        },
        { status: 400 },
      );
    }

    const user = {
      id: crypto.randomUUID(),
      email: parsed.data.email.trim().toLowerCase(),
    };

    await setSession(user);

    let claimedSiteId: string | undefined;

    if (parsed.data.siteId && parsed.data.guestId) {
      const site = await claimGuestSite({
        siteId: parsed.data.siteId,
        guestId: parsed.data.guestId,
        userId: user.id,
      });
      if (site) {
        claimedSiteId = site.id;
        await clearGuestIdCookie();
      }
    }

    return Response.json(
      {
        success: true,
        user,
        claimedSiteId,
      },
      { status: 200 },
    );
  } catch {
    return Response.json(
      { success: false, error: "Failed to sign in" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    await clearSession();
    return Response.json({ success: true }, { status: 200 });
  } catch {
    return Response.json(
      { success: false, error: "Failed to sign out" },
      { status: 500 },
    );
  }
}
