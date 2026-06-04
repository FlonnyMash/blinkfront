import fs from "node:fs";
import path from "node:path";

import {
  getWebsiteTitle,
  LayoutRenderer,
} from "@/components/renderer/LayoutRenderer";
import type { Website } from "@/types/layout";

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function loadPublishCss(): string {
  const cssPath = path.join(process.cwd(), "lib/deploy/site.css");

  if (!fs.existsSync(cssPath)) {
    throw new Error(
      "Missing lib/deploy/site.css. Run `npm run build:publish-css` first.",
    );
  }

  return fs.readFileSync(cssPath, "utf8");
}

export async function renderWebsiteHtml(
  data: Website,
): Promise<{ html: string; css: string }> {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const body = renderToStaticMarkup(<LayoutRenderer data={data} />);
  const title = escapeHtml(getWebsiteTitle(data));
  const css = loadPublishCss();

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <link rel="stylesheet" href="/style.css" />
</head>
<body>
${body}
</body>
</html>`;

  return { html, css };
}
