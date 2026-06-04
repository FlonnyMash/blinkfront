import { z } from "zod";

import { generateWebsiteData } from "@/lib/ai/generate-site";
import { ensureGuestIdCookie, getGuestIdFromRequest } from "@/lib/auth/guest";
import { getSessionFromRequest } from "@/lib/auth/session";
import { createDraftSite, updateSiteLayout } from "@/lib/sites";
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

    const session = getSessionFromRequest(request);
    const isGuest = !session;

    let guestId: string | undefined;
    if (isGuest) {
      guestId = await ensureGuestIdCookie(getGuestIdFromRequest(request));
    }

    const result = await generateWebsiteData(
      parsed.data.scrapedContent,
      parsed.data.seoAudit,
      {
        siteTitle: parsed.data.siteTitle,
        sourceUrl: parsed.data.sourceUrl,
      },
    );

    if (!result.success) {
      return Response.json(result, { status: 200 });
    }

    const draft = await createDraftSite({
      userId: session?.id ?? null,
      guestId: isGuest ? guestId ?? null : null,
    });

    if (draft) {
      await updateSiteLayout(draft.id, result.data, {
        userId: session?.id ?? null,
        guestId: isGuest ? guestId ?? null : null,
      });
    }

    return Response.json(
      draft
        ? {
            ...result,
            siteId: draft.id,
            guest: isGuest,
            ...(isGuest && guestId ? { guestId } : {}),
          }
        : { ...result, guest: isGuest },
      { status: 200 },
    );
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
