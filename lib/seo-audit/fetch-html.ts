import { normalizeUrl } from "@/lib/utils";

const FETCH_TIMEOUT_MS = 45_000;
const USER_AGENT = "BlinkfrontSEOBot/1.0";

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
      return error instanceof Error ? error.message : "Failed to fetch page";
  }
}

export type FetchHtmlResult =
  | { success: true; url: string; html: string }
  | { success: false; error: string };

/** Fetches rendered HTML from the server — no local browser, no OS firewall prompts. */
export async function fetchPageHtml(url: string): Promise<FetchHtmlResult> {
  const normalizedUrl = normalizeUrl(url);

  try {
    new URL(normalizedUrl);
  } catch {
    return { success: false, error: "Invalid URL" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(normalizedUrl, {
      headers: { "User-Agent": USER_AGENT },
      redirect: "follow",
      signal: controller.signal,
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to fetch URL (HTTP ${response.status})`,
      };
    }

    const html = await response.text();
    return { success: true, url: normalizedUrl, html };
  } catch (error) {
    return { success: false, error: formatFetchError(error) };
  } finally {
    clearTimeout(timeout);
  }
}
