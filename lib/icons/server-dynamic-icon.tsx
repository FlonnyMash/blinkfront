import "server-only";

import { createRequire } from "node:module";
import path from "node:path";
import type { SVGProps } from "react";

import {
  FALLBACK_ICON_NODES,
  type DynamicIconFallback,
} from "@/lib/icons/fallback-icon-nodes";
import { renderLucideSvg } from "@/lib/icons/lucide-svg";
import type { LucideIconNode } from "@/lib/icons/lucide-types";

const require = createRequire(import.meta.url);

const lucidePackageRoot = path.dirname(
  require.resolve("lucide-react/package.json"),
);
const iconsDir = path.join(lucidePackageRoot, "dist/esm/icons");

const iconNodeCache = new Map<string, LucideIconNode | null>();

/** Legacy / common LLM names → lucide file kebab-case. */
const ICON_ALIASES: Record<string, string> = {
  CheckCircle: "circle-check",
  CheckCircle2: "circle-check",
  XCircle: "circle-x",
  AlertCircle: "circle-alert",
  HelpCircle: "circle-question-mark",
  TrendingUp: "trending-up",
};

function toKebabCase(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

function pascalCaseFromKebab(kebab: string): string {
  return kebab
    .split("-")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join("");
}

function buildKebabCandidates(raw: string): string[] {
  const trimmed = raw.trim();
  if (!trimmed) {
    return [];
  }

  const candidates = new Set<string>();

  if (trimmed.includes("-")) {
    candidates.add(trimmed.toLowerCase());
    candidates.add(toKebabCase(pascalCaseFromKebab(trimmed)));
  } else {
    candidates.add(toKebabCase(trimmed));
    candidates.add(trimmed);
  }

  const alias =
    ICON_ALIASES[trimmed] ??
    ICON_ALIASES[pascalCaseFromKebab(trimmed.toLowerCase())];
  if (alias) {
    candidates.add(alias);
  }

  return [...candidates];
}

function loadIconNodeByKebab(kebab: string): LucideIconNode | null {
  const cached = iconNodeCache.get(kebab);
  if (cached !== undefined) {
    return cached;
  }

  try {
    const mod = require(path.join(iconsDir, `${kebab}.mjs`)) as {
      __iconNode?: LucideIconNode;
    };
    const node = mod.__iconNode ?? null;
    iconNodeCache.set(kebab, node);
    return node;
  } catch {
    iconNodeCache.set(kebab, null);
    return null;
  }
}

function resolveLucideIconNode(
  name: string | undefined | null,
): LucideIconNode | null {
  if (!name?.trim()) {
    return null;
  }

  for (const kebab of buildKebabCandidates(name)) {
    const node = loadIconNodeByKebab(kebab);
    if (node) {
      return node;
    }
  }

  return null;
}

export type ServerDynamicIconProps = SVGProps<SVGSVGElement> & {
  name?: string | null;
  fallback?: DynamicIconFallback;
};

/** Lucide icon by name — inline SVG for static publish (no client lucide components). */
export function ServerDynamicIcon({
  name,
  fallback = "circle-check",
  className,
  ...props
}: ServerDynamicIconProps) {
  const iconNode =
    resolveLucideIconNode(name) ??
    (fallback === "none" ? null : FALLBACK_ICON_NODES[fallback]);

  if (!iconNode) {
    return null;
  }

  return renderLucideSvg({ iconNode, className, ...props });
}
