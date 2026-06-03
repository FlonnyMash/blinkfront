import type { CSSProperties } from "react";

import type { WebsiteTheme } from "@/lib/validations/website";

export function getPresetClasses(preset: WebsiteTheme["stylePreset"]): string {
  switch (preset) {
    case "apple":
      return "[&_h1]:font-semibold [&_h1]:tracking-tight [&_h2]:font-semibold [&_section]:py-20 antialiased";
    case "minimal":
      return "[&_h1]:font-normal [&_h1]:tracking-normal font-light";
    case "bold":
      return "[&_h1]:text-6xl [&_h1]:font-black [&_h2]:font-extrabold";
    default:
      return "";
  }
}

export function getThemeStyles(theme: WebsiteTheme): CSSProperties {
  return {
    color: theme.textColor,
    backgroundColor: theme.backgroundColor,
  };
}
