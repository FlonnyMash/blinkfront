import { evaluateImages } from "@/lib/seo-audit/evaluators/images";
import { evaluateLinks } from "@/lib/seo-audit/evaluators/links";
import { evaluateMeta } from "@/lib/seo-audit/evaluators/meta";
import { evaluateStructure } from "@/lib/seo-audit/evaluators/structure";
import { extractDomSnapshotFromHtml } from "@/lib/seo-audit/dom-snapshot";
import { fetchPageHtml } from "@/lib/seo-audit/fetch-html";
import { calculateOverallScore } from "@/lib/seo-audit/score";
import { verifySameOriginLinks } from "@/lib/seo-audit/verify-links";
import {
  SeoAuditResultSchema,
  type SeoAuditResult,
} from "@/lib/validations/seo-audit-result";

export type RunSeoAuditResult =
  | { success: true; data: SeoAuditResult }
  | { success: false; error: string };

/**
 * Deterministic SEO audit via server-side HTML fetch (Cheerio).
 * No Playwright/Chromium — avoids OS firewall prompts and works on serverless.
 */
export async function runDeterministicSeoAudit(url: string): Promise<RunSeoAuditResult> {
  const fetched = await fetchPageHtml(url);
  if (!fetched.success) {
    return { success: false, error: fetched.error };
  }

  try {
    const snapshot = extractDomSnapshotFromHtml(fetched.html);
    const linkVerification = await verifySameOriginLinks(
      snapshot.links.entries,
      fetched.url,
    );

    const meta = evaluateMeta(snapshot);
    const structure = evaluateStructure(snapshot);
    const images = evaluateImages(snapshot);
    const links = evaluateLinks(snapshot, linkVerification);

    const categories = { meta, structure, images, links };
    const overallScore = calculateOverallScore(categories);

    const data = SeoAuditResultSchema.parse({
      url: fetched.url,
      overallScore,
      auditedAt: new Date().toISOString(),
      ...categories,
    });

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "SEO audit failed",
    };
  }
}
