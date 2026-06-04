import * as cheerio from "cheerio";

/** Raw DOM facts from HTML — no scoring (keeps audits deterministic). */
export type DomSnapshot = {
  meta: {
    title: string | null;
    description: string | null;
    ogTitle: string | null;
    ogDescription: string | null;
    ogImage: string | null;
    canonical: string | null;
  };
  structure: {
    h1Count: number;
    headingLevels: number[];
    semanticTagsPresent: string[];
  };
  images: {
    total: number;
    missingAlt: number;
    withAlt: number;
  };
  links: {
    total: number;
    entries: { href: string; text: string }[];
  };
};

const GENERIC_LINK_TEXT = new Set([
  "click here",
  "read more",
  "here",
  "link",
  "more",
  "learn more",
]);

type CheerioLoaded = ReturnType<typeof cheerio.load>;

function metaContent($: CheerioLoaded, name: string): string | null {
  const el = $(`meta[name="${name}"], meta[property="${name}"]`).first();
  const content = el.attr("content")?.trim();
  return content || null;
}

function isHeadingOrderValid(levels: number[]): boolean {
  if (levels.length === 0) {
    return true;
  }

  let previous = levels[0];
  for (let index = 1; index < levels.length; index++) {
    const current = levels[index];
    if (current > previous + 1) {
      return false;
    }
    previous = current;
  }

  return true;
}

export function extractDomSnapshotFromHtml(html: string): DomSnapshot {
  const $ = cheerio.load(html);

  const title =
    $("title").first().text().trim() || metaContent($, "og:title") || null;

  const description = metaContent($, "description");
  const ogTitle = metaContent($, "og:title");
  const ogDescription = metaContent($, "og:description");
  const ogImage = metaContent($, "og:image");
  const canonical = $('link[rel="canonical"]').first().attr("href")?.trim() || null;

  const headingLevels: number[] = [];
  $("h1, h2, h3, h4, h5, h6").each((_, element) => {
    const tag = "name" in element ? String(element.name).toLowerCase() : "";
    const level = Number.parseInt(tag.slice(1), 10);
    if (!Number.isNaN(level)) {
      headingLevels.push(level);
    }
  });

  const semanticCandidates = [
    "main",
    "header",
    "footer",
    "nav",
    "article",
    "section",
    "aside",
  ];
  const semanticTagsPresent = semanticCandidates.filter((tag) => $(tag).length > 0);

  let missingAlt = 0;
  let withAlt = 0;
  $("img").each((_, element) => {
    const alt = $(element).attr("alt");
    if (alt === undefined || alt.trim() === "") {
      missingAlt += 1;
    } else {
      withAlt += 1;
    }
  });
  const totalImages = missingAlt + withAlt;

  const linkEntries: { href: string; text: string }[] = [];
  $("a[href]").each((_, element) => {
    const href = $(element).attr("href")?.trim();
    if (!href || href.startsWith("#") || href.startsWith("javascript:")) {
      return;
    }
    linkEntries.push({
      href,
      text: $(element).text().replace(/\s+/g, " ").trim(),
    });
  });

  return {
    meta: {
      title,
      description,
      ogTitle,
      ogDescription,
      ogImage,
      canonical,
    },
    structure: {
      h1Count: $("h1").length,
      headingLevels,
      semanticTagsPresent,
    },
    images: {
      total: totalImages,
      missingAlt,
      withAlt,
    },
    links: {
      total: linkEntries.length,
      entries: linkEntries,
    },
  };
}

export function isDescriptiveLinkText(text: string): boolean {
  const normalized = text.toLowerCase().trim();
  if (normalized.length < 3) {
    return false;
  }
  return !GENERIC_LINK_TEXT.has(normalized);
}

export function isHeadingOrderValidFromLevels(levels: number[]): boolean {
  return isHeadingOrderValid(levels);
}
