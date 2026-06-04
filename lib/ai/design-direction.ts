import type {
  CtaVariant,
  FeaturesVariant,
  HeroVariant,
  Theme,
  ThemeBorderRadius,
  ThemeFontFamily,
  Website,
} from "@/types/layout";

export type DesignDirection = {
  id: string;
  label: string;
  heroVariant: HeroVariant;
  featuresVariant: FeaturesVariant;
  ctaVariant: CtaVariant;
  theme: {
    name: string;
    mood: string;
    colors: Theme["colors"];
    fontFamily: ThemeFontFamily;
    borderRadius: ThemeBorderRadius;
  };
};

const LAYOUT_PRESETS: Pick<
  DesignDirection,
  "id" | "label" | "heroVariant" | "featuresVariant" | "ctaVariant"
>[] = [
  {
    id: "editorial-contrast",
    label: "Editorial contrast",
    heroVariant: "split",
    featuresVariant: "grid",
    ctaVariant: "minimal",
  },
  {
    id: "story-driven",
    label: "Story-driven",
    heroVariant: "centered",
    featuresVariant: "list",
    ctaVariant: "split",
  },
  {
    id: "bold-product",
    label: "Bold product",
    heroVariant: "split",
    featuresVariant: "cards",
    ctaVariant: "split",
  },
  {
    id: "minimal-punch",
    label: "Minimal punch",
    heroVariant: "centered",
    featuresVariant: "grid",
    ctaVariant: "minimal",
  },
  {
    id: "long-form-trust",
    label: "Long-form trust",
    heroVariant: "default",
    featuresVariant: "list",
    ctaVariant: "split",
  },
  {
    id: "classic-elevated",
    label: "Classic elevated",
    heroVariant: "default",
    featuresVariant: "cards",
    ctaVariant: "default",
  },
  {
    id: "split-grid-close",
    label: "Split hero grid close",
    heroVariant: "split",
    featuresVariant: "grid",
    ctaVariant: "default",
  },
  {
    id: "centered-cards-minimal",
    label: "Centered cards minimal CTA",
    heroVariant: "centered",
    featuresVariant: "cards",
    ctaVariant: "minimal",
  },
  {
    id: "default-list-split",
    label: "Balanced narrative",
    heroVariant: "default",
    featuresVariant: "list",
    ctaVariant: "minimal",
  },
];

const THEME_PRESETS: DesignDirection["theme"][] = [
  {
    name: "Midnight tech",
    mood: "precise, technical, high-contrast",
    colors: {
      primary: "#22d3ee",
      secondary: "#64748b",
      background: "#0f172a",
      text: "#f1f5f9",
    },
    fontFamily: "mono",
    borderRadius: "sm",
  },
  {
    name: "Warm trust",
    mood: "approachable, human, grounded",
    colors: {
      primary: "#c2410c",
      secondary: "#78716c",
      background: "#fffbeb",
      text: "#292524",
    },
    fontFamily: "serif",
    borderRadius: "lg",
  },
  {
    name: "Violet venture",
    mood: "ambitious, modern, startup energy",
    colors: {
      primary: "#7c3aed",
      secondary: "#a78bfa",
      background: "#faf5ff",
      text: "#1e1b4b",
    },
    fontFamily: "sans",
    borderRadius: "lg",
  },
  {
    name: "Forest growth",
    mood: "sustainable, calm, confident",
    colors: {
      primary: "#15803d",
      secondary: "#4ade80",
      background: "#f0fdf4",
      text: "#14532d",
    },
    fontFamily: "sans",
    borderRadius: "lg",
  },
  {
    name: "Slate enterprise",
    mood: "credible, restrained, B2B",
    colors: {
      primary: "#0369a1",
      secondary: "#475569",
      background: "#f8fafc",
      text: "#0f172a",
    },
    fontFamily: "sans",
    borderRadius: "sm",
  },
  {
    name: "Luxury noir",
    mood: "premium, minimal, editorial",
    colors: {
      primary: "#d4af37",
      secondary: "#a8a29e",
      background: "#0c0a09",
      text: "#fafaf9",
    },
    fontFamily: "serif",
    borderRadius: "none",
  },
  {
    name: "Coral consumer",
    mood: "friendly, direct-to-consumer, energetic",
    colors: {
      primary: "#e11d48",
      secondary: "#fb7185",
      background: "#fff1f2",
      text: "#881337",
    },
    fontFamily: "sans",
    borderRadius: "full",
  },
  {
    name: "Ocean clarity",
    mood: "fresh, clear, service-focused",
    colors: {
      primary: "#0891b2",
      secondary: "#67e8f9",
      background: "#ecfeff",
      text: "#164e63",
    },
    fontFamily: "sans",
    borderRadius: "lg",
  },
];

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

/** Unique layout + theme seed for each generation request. */
export function pickDesignDirection(): DesignDirection {
  const layout = pickRandom(LAYOUT_PRESETS);
  const theme = pickRandom(THEME_PRESETS);

  return {
    ...layout,
    theme,
  };
}

export function buildDesignDirectionPrompt(direction: DesignDirection): string {
  const { theme } = direction;

  return `## Unique design brief (mandatory — this page only)
Design ID: ${direction.id} (${direction.label}). This site MUST feel visually distinct from every other website you generate—not a template reuse.

### Layout variants (use exactly these enum tokens)
- Hero \`variant\`: \`${direction.heroVariant}\`
- Features \`variant\`: \`${direction.featuresVariant}\`
- CTA \`variant\`: \`${direction.ctaVariant}\`

### Theme archetype: ${theme.name}
Mood: ${theme.mood}.
Seed palette (adapt hex to the scraped brand while keeping this personality; do NOT default to generic blue + white + Inter unless the source demands it):
- primary: ${theme.colors.primary}
- secondary: ${theme.colors.secondary}
- background: ${theme.colors.background}
- text: ${theme.colors.text}
- fontFamily: ${theme.fontFamily} (art direction enum: sans | serif | mono)
- borderRadius: ${theme.borderRadius} (art direction enum: none | sm | lg | full)`;
}

/** Ensures each generated site renders with the picked layout + typographic/color seed. */
export function applyDesignDirection(
  website: Website,
  direction: DesignDirection,
): Website {
  return {
    theme: {
      colors: { ...direction.theme.colors },
      fontFamily: direction.theme.fontFamily,
      borderRadius: direction.theme.borderRadius,
    },
    layout: website.layout.map((block) => {
      switch (block.type) {
        case "Hero":
          return {
            ...block,
            content: {
              ...block.content,
              variant: direction.heroVariant,
            },
          };
        case "Features":
          return {
            ...block,
            content: {
              ...block.content,
              variant: direction.featuresVariant,
            },
          };
        case "CTA":
          return {
            ...block,
            content: {
              ...block.content,
              variant: direction.ctaVariant,
            },
          };
        default:
          return block;
      }
    }),
  };
}
