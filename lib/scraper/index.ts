"use server";

import * as cheerio from "cheerio";
import { ZodError } from "zod";

import { normalizeUrl } from "@/lib/utils";
import { SeoAuditSchema, type SeoAudit } from "@/lib/validations/seo";

export type ScrapeUrlSuccess = { success: true; data: SeoAudit };
export type ScrapeUrlFailure = { success: false; error: string };
export type ScrapeUrlResult = ScrapeUrlSuccess | ScrapeUrlFailure;

type CheerioLoaded = ReturnType<typeof cheerio.load>;

function extractHeadingTexts($: CheerioLoaded, tag: "h1" | "h2"): string[] {
  return $(tag)
    .map((_, element) => $(element).text().trim())
    .get()
    .filter(Boolean);
}

function extractRawContent($: CheerioLoaded): string {
  const body = $("body").clone();
  body.find("script, style, noscript").remove();

  return body.text().replace(/\s+/g, " ").trim();
}

function getErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  const err = error as { code?: string; cause?: unknown };
  if (typeof err.code === "string") {
    return err.code;
  }

  return getErrorCode(err.cause);
}

function formatFetchError(error: unknown): string {
  switch (getErrorCode(error)) {
    case "ENOTFOUND":
    case "EAI_AGAIN":
      return "This domain could not be found. Please check the URL and try again.";
    case "ECONNREFUSED":
      return "Could not connect to this website. It may be offline or blocking requests.";
    case "ETIMEDOUT":
    case "UND_ERR_CONNECT_TIMEOUT":
      return "The request timed out. The website took too long to respond.";
    case "CERT_HAS_EXPIRED":
    case "UNABLE_TO_VERIFY_LEAF_SIGNATURE":
      return "Could not establish a secure connection to this website.";
    default:
      if (error instanceof Error && error.message === "fetch failed") {
        return "Could not reach this website. Please check the URL and try again.";
      }

      return formatError(error);
  }
}

function formatError(error: unknown): string {
  if (error instanceof ZodError) {
    return `Validation failed: ${error.issues[0]?.message ?? "Invalid SEO audit data"}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unknown error occurred";
}

export async function scrapeUrl(url: string): Promise<ScrapeUrlResult> {
  try {
    const normalizedUrl = normalizeUrl(url);

    try {
      new URL(normalizedUrl);
    } catch {
      return { success: false, error: "Invalid URL" };
    }

    let response: Response;
    try {
      response = await fetch(normalizedUrl, {
        headers: { "User-Agent": "BlinkfrontSEOBot/1.0" },
        redirect: "follow",
      });
    } catch (error) {
      return { success: false, error: formatFetchError(error) };
    }

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to fetch URL (HTTP ${response.status})`,
      };
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const titleText = $("title").first().text().trim();
    const descriptionText = $('meta[name="description"]').attr("content")?.trim();

    const rawContent = extractRawContent($);
    const wordCount = rawContent.split(/\s+/).filter(Boolean).length;

    const data = SeoAuditSchema.parse({
      url: normalizedUrl,
      meta: {
        title: titleText || null,
        description: descriptionText || null,
      },
      headings: {
        h1: extractHeadingTexts($, "h1"),
        h2: extractHeadingTexts($, "h2"),
      },
      wordCount,
      rawContent,
    });

    return { success: true, data };
  } catch (error) {
    return { success: false, error: formatError(error) };
  }
}
