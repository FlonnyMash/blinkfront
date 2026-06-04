import { z } from "zod";

import { scrapeUrl } from "@/lib/scraper";

export const maxDuration = 30;

const ScrapeRequestSchema = z.object({ url: z.string().min(1) }).strict();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = ScrapeRequestSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message ?? "Invalid request body",
        },
        { status: 400 },
      );
    }

    const result = await scrapeUrl(parsed.data.url);
    return Response.json(result, { status: 200 });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to scrape URL",
      },
      { status: 500 },
    );
  }
}
