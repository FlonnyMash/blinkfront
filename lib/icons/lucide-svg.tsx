import { createElement, type SVGProps } from "react";

import defaultAttributes from "lucide-react/dist/esm/defaultAttributes.mjs";

import type { LucideIconNode } from "@/lib/icons/lucide-types";
import { cn } from "@/lib/utils";

export type RenderLucideSvgProps = SVGProps<SVGSVGElement> & {
  iconNode: LucideIconNode;
  size?: number | string;
  absoluteStrokeWidth?: boolean;
};

export function renderLucideSvg({
  iconNode,
  className,
  size = 24,
  strokeWidth = 2,
  absoluteStrokeWidth = false,
  color,
  ...rest
}: RenderLucideSvgProps) {
  const numericSize = Number(size);
  const calculatedStrokeWidth = absoluteStrokeWidth
    ? (Number(strokeWidth) * 24) / numericSize
    : strokeWidth;

  return createElement(
    "svg",
    {
      ...defaultAttributes,
      width: size,
      height: size,
      stroke: color ?? "currentColor",
      strokeWidth: calculatedStrokeWidth,
      className: cn("lucide", className),
      "aria-hidden": true,
      ...rest,
    },
    iconNode.map(([tag, attrs]) =>
      createElement(tag, { ...attrs, key: attrs.key }),
    ),
  );
}
