import type { SeoAuditCheck, SeoAuditResult } from "@/lib/validations/seo-audit-result";

import { SEO_AUDIT_CHECK_WEIGHTS } from "@/lib/seo-audit/weights";

type CategoryMap = {
  [key: string]: SeoAuditCheck | CategoryMap;
};

function collectLeafChecks(
  node: CategoryMap,
  prefix: string,
  out: { path: string; check: SeoAuditCheck }[],
): void {
  for (const [key, value] of Object.entries(node)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && "passed" in value && "score" in value) {
      out.push({ path, check: value as SeoAuditCheck });
    } else if (value && typeof value === "object") {
      collectLeafChecks(value as CategoryMap, path, out);
    }
  }
}

/** Weighted mean of per-check scores — deterministic, no LLM or timing noise. */
export function calculateOverallScore(
  categories: Pick<
    SeoAuditResult,
    "meta" | "structure" | "images" | "links"
  >,
): number {
  const leaves: { path: string; check: SeoAuditCheck }[] = [];
  collectLeafChecks(categories as CategoryMap, "", leaves);

  let weightedSum = 0;
  let weightTotal = 0;

  for (const { path, check } of leaves) {
    const weight = SEO_AUDIT_CHECK_WEIGHTS[path];
    if (weight === undefined) {
      continue;
    }
    weightedSum += check.score * weight;
    weightTotal += weight;
  }

  if (weightTotal <= 0) {
    return 0;
  }

  return Math.round(weightedSum / weightTotal);
}
