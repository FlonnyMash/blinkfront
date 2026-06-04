const MAX_LINKS_TO_VERIFY = 25;
const LINK_CHECK_TIMEOUT_MS = 6_000;

export type LinkVerificationSummary = {
  brokenCount: number;
  verifiedCount: number;
  skippedExternalCount: number;
};

function resolveHref(href: string, baseUrl: string): string | null {
  try {
    return new URL(href, baseUrl).href;
  } catch {
    return null;
  }
}

function isSameOrigin(absoluteUrl: string, pageUrl: string): boolean {
  try {
    return new URL(absoluteUrl).origin === new URL(pageUrl).origin;
  } catch {
    return false;
  }
}

function isDefiniteBrokenStatus(status: number): boolean {
  return status === 404 || status === 410;
}

function isInconclusiveStatus(status: number): boolean {
  return (
    status === 401 ||
    status === 403 ||
    status === 405 ||
    status === 429 ||
    status >= 500
  );
}

async function fetchStatus(absoluteUrl: string, method: "HEAD" | "GET"): Promise<number | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), LINK_CHECK_TIMEOUT_MS);

  try {
    const response = await fetch(absoluteUrl, {
      method,
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "BlinkfrontSEOAudit/1.0" },
    });
    return response.status;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function isLinkBroken(absoluteUrl: string): Promise<boolean> {
  const headStatus = await fetchStatus(absoluteUrl, "HEAD");

  if (headStatus !== null) {
    if (isDefiniteBrokenStatus(headStatus)) {
      return true;
    }
    if (!isInconclusiveStatus(headStatus) && headStatus < 400) {
      return false;
    }
  }

  const getStatus = await fetchStatus(absoluteUrl, "GET");
  if (getStatus === null) {
    return false;
  }
  if (isDefiniteBrokenStatus(getStatus)) {
    return true;
  }
  if (isInconclusiveStatus(getStatus)) {
    return false;
  }

  return getStatus >= 400;
}

/**
 * Checks same-origin links only. External URLs and bot-blocked responses are not
 * counted as broken (avoids false positives that tank the overall score).
 */
export async function verifySameOriginLinks(
  entries: { href: string; text: string }[],
  pageUrl: string,
): Promise<LinkVerificationSummary> {
  const resolved = new Map<string, true>();
  let skippedExternalCount = 0;

  for (const entry of entries) {
    const absolute = resolveHref(entry.href, pageUrl);
    if (
      !absolute ||
      absolute.startsWith("mailto:") ||
      absolute.startsWith("tel:") ||
      !isSameOrigin(absolute, pageUrl)
    ) {
      skippedExternalCount += 1;
      continue;
    }
    resolved.set(absolute, true);
  }
  const sortedUrls = [...resolved.keys()].sort().slice(0, MAX_LINKS_TO_VERIFY);

  let brokenCount = 0;
  for (const url of sortedUrls) {
    if (await isLinkBroken(url)) {
      brokenCount += 1;
    }
  }

  return {
    brokenCount,
    verifiedCount: sortedUrls.length,
    skippedExternalCount,
  };
}
