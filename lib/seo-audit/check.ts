import type { SeoAuditCheck } from "@/lib/validations/seo-audit-result";

export function binaryCheck(
  passed: boolean,
  value: string | null,
  remediation: string,
): SeoAuditCheck {
  return {
    passed,
    score: passed ? 100 : 0,
    value,
    remediation,
  };
}

export function metricCheck(
  passed: boolean,
  score: number,
  value: string | null,
  remediation: string,
): SeoAuditCheck {
  const clamped = Math.min(100, Math.max(0, Math.round(score)));
  return {
    passed,
    score: clamped,
    value,
    remediation,
  };
}

export function ratioScore(part: number, total: number): number {
  if (total <= 0) {
    return 100;
  }
  return Math.round((part / total) * 100);
}
