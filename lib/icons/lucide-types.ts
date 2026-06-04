export type LucideSvgElement =
  | "circle"
  | "ellipse"
  | "g"
  | "line"
  | "path"
  | "polygon"
  | "polyline"
  | "rect";

export type LucideIconNode = [LucideSvgElement, Record<string, string>][];
