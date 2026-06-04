import { createElement } from "react";
import {
  CircleCheck,
  icons,
  Zap,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";

const FALLBACK_ICONS = {
  "circle-check": CircleCheck,
  zap: Zap,
} as const satisfies Record<string, LucideIcon>;

export type DynamicIconFallback = keyof typeof FALLBACK_ICONS | "none";

/** Legacy / common LLM names → current lucide-react export keys (PascalCase). */
const ICON_ALIASES: Record<string, string> = {
  CheckCircle: "CircleCheck",
  CheckCircle2: "CircleCheck",
  XCircle: "CircleX",
  AlertCircle: "CircleAlert",
  HelpCircle: "CircleHelp",
  TrendingUp: "TrendingUp",
};

function pascalCaseFromKebab(kebab: string): string {
  return kebab
    .split("-")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join("");
}

function buildIconNameCandidates(raw: string): string[] {
  const trimmed = raw.trim();
  if (!trimmed) {
    return [];
  }

  const candidates = new Set<string>([trimmed]);

  if (trimmed.includes("-")) {
    candidates.add(pascalCaseFromKebab(trimmed));
  }

  if (trimmed.endsWith("Icon")) {
    candidates.add(trimmed.slice(0, -4));
  }

  const alias =
    ICON_ALIASES[trimmed] ??
    ICON_ALIASES[pascalCaseFromKebab(trimmed.toLowerCase())];
  if (alias) {
    candidates.add(alias);
  }

  return [...candidates];
}

function resolveLucideIcon(name: string | undefined | null): LucideIcon | null {
  if (!name?.trim()) {
    return null;
  }

  for (const candidate of buildIconNameCandidates(name)) {
    const icon = icons[candidate as keyof typeof icons];
    if (icon) {
      return icon;
    }
  }

  return null;
}

export type DynamicIconProps = LucideProps & {
  /** PascalCase lucide icon name (e.g. `Rocket`, `ShieldCheck`). Kebab-case is also accepted. */
  name?: string | null;
  /** Used when `name` is missing or does not match a lucide export. */
  fallback?: DynamicIconFallback;
};

/**
 * Renders a lucide icon by string name. Unknown names never throw; they fall back or render nothing.
 */
export function DynamicIcon({
  name,
  fallback = "circle-check",
  className,
  ...props
}: DynamicIconProps) {
  const Resolved = resolveLucideIcon(name);
  if (Resolved) {
    return createElement(Resolved, {
      className,
      "aria-hidden": true,
      ...props,
    });
  }

  if (fallback === "none") {
    return null;
  }

  const FallbackIcon = FALLBACK_ICONS[fallback];
  return createElement(FallbackIcon, {
    className,
    "aria-hidden": true,
    ...props,
  });
}
