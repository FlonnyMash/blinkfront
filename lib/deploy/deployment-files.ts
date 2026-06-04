import fs from "node:fs/promises";
import path from "node:path";

/** Maximum decoded size per deployment file (5 MiB). */
export const MAX_DEPLOYMENT_FILE_BYTES = 5 * 1024 * 1024;

export type VercelDeploymentFile = {
  file: string;
  /** File contents — must pair with `encoding`. */
  data: string;
  /** Required by the Vercel REST API so inlined files are decoded before serving. */
  encoding: "base64" | "utf-8";
};

export type StaticSiteContent = {
  indexHtml: string;
  styleCss: string;
};

export type DeploymentFileFailure = { success: false; error: string };

export type DeploymentFileSuccess<T> = { success: true } & T;

export type DeploymentFileResult<T> =
  | DeploymentFileSuccess<T>
  | DeploymentFileFailure;

const BASE64_PATTERN = /^[A-Za-z0-9+/]*={0,2}$/;
const SAFE_RELATIVE_PATH = /^[a-zA-Z0-9][a-zA-Z0-9._/-]*$/;
const DATA_URL_BASE64_PATTERN = /^data:[^;]+;base64,(.+)$/i;

function stripBase64Payload(encoded: string): string {
  const trimmed = encoded.trim();
  const dataUrlMatch = DATA_URL_BASE64_PATTERN.exec(trimmed);
  return dataUrlMatch ? dataUrlMatch[1] : trimmed;
}

/**
 * Decodes a Base64 string (or data URL) into UTF-8 text.
 * Use this when upstream steps emit encoded HTML/CSS instead of plain strings.
 */
export function decodeBase64ToUtf8(
  encoded: string,
): DeploymentFileResult<{ content: string }> {
  const payload = stripBase64Payload(encoded);

  if (!payload) {
    return { success: false, error: "Base64 content is empty" };
  }

  if (!BASE64_PATTERN.test(payload)) {
    return { success: false, error: "Invalid Base64 encoding" };
  }

  let buffer: Buffer;
  try {
    buffer = Buffer.from(payload, "base64");
  } catch {
    return { success: false, error: "Failed to decode Base64 content" };
  }

  if (buffer.length === 0) {
    return { success: false, error: "Decoded content is empty" };
  }

  if (buffer.length > MAX_DEPLOYMENT_FILE_BYTES) {
    return {
      success: false,
      error: `Decoded file exceeds ${MAX_DEPLOYMENT_FILE_BYTES} byte limit`,
    };
  }

  return { success: true, content: buffer.toString("utf8") };
}

/**
 * Encodes UTF-8 text into the Base64 format expected by the Vercel REST API.
 */
export function encodeUtf8ToBase64(
  content: string,
): DeploymentFileResult<{ encoded: string }> {
  if (!content.trim()) {
    return { success: false, error: "Content is empty" };
  }

  const buffer = Buffer.from(content, "utf8");

  if (buffer.length > MAX_DEPLOYMENT_FILE_BYTES) {
    return {
      success: false,
      error: `File exceeds ${MAX_DEPLOYMENT_FILE_BYTES} byte limit`,
    };
  }

  return { success: true, encoded: buffer.toString("base64") };
}

export function validateHtmlDocument(
  html: string,
): DeploymentFileResult<{ html: string }> {
  const trimmed = html.trim();

  if (!trimmed) {
    return { success: false, error: "HTML content is empty" };
  }

  const prefix = trimmed.slice(0, 512).toLowerCase();
  if (!prefix.includes("<html") && !prefix.startsWith("<!doctype")) {
    return {
      success: false,
      error: "Content does not look like a valid HTML document",
    };
  }

  return { success: true, html: trimmed };
}

export function assertSafeRelativePath(
  relativePath: string,
): DeploymentFileResult<{ path: string }> {
  const normalized = relativePath.replace(/\\/g, "/").trim();

  if (
    !normalized ||
    normalized.startsWith("/") ||
    normalized.includes("..") ||
    normalized.includes("\0")
  ) {
    return { success: false, error: "Unsafe deployment file path" };
  }

  if (!SAFE_RELATIVE_PATH.test(normalized)) {
    return { success: false, error: "Invalid deployment file path" };
  }

  return { success: true, path: normalized };
}

export function buildVercelDeploymentFile(
  relativePath: string,
  content: string,
): DeploymentFileResult<VercelDeploymentFile> {
  const pathResult = assertSafeRelativePath(relativePath);
  if (!pathResult.success) {
    return pathResult;
  }

  const encodeResult = encodeUtf8ToBase64(content);
  if (!encodeResult.success) {
    return encodeResult;
  }

  return {
    success: true,
    file: pathResult.path,
    data: encodeResult.encoded,
    encoding: "base64",
  };
}

/**
 * Builds the Vercel deployment `files` payload from decoded HTML and CSS strings.
 */
export function buildStaticSiteDeploymentFiles(
  html: string,
  css: string,
): DeploymentFileResult<{ files: VercelDeploymentFile[] }> {
  const htmlResult = validateHtmlDocument(html);
  if (!htmlResult.success) {
    return htmlResult;
  }

  if (!css.trim()) {
    return { success: false, error: "CSS content is empty" };
  }

  const indexFile = buildVercelDeploymentFile("index.html", htmlResult.html);
  if (!indexFile.success) {
    return indexFile;
  }

  const cssFile = buildVercelDeploymentFile("style.css", css);
  if (!cssFile.success) {
    return cssFile;
  }

  return {
    success: true,
    files: [
      {
        file: indexFile.file,
        data: indexFile.data,
        encoding: indexFile.encoding,
      },
      {
        file: cssFile.file,
        data: cssFile.data,
        encoding: cssFile.encoding,
      },
    ],
  };
}

/**
 * Decodes Base64-encoded HTML and CSS into plain text ready for deployment.
 */
export function decodeStaticSiteFromBase64(
  encodedHtml: string,
  encodedCss: string,
): DeploymentFileResult<StaticSiteContent> {
  const htmlDecode = decodeBase64ToUtf8(encodedHtml);
  if (!htmlDecode.success) {
    return htmlDecode;
  }

  const cssDecode = decodeBase64ToUtf8(encodedCss);
  if (!cssDecode.success) {
    return cssDecode;
  }

  const htmlValidate = validateHtmlDocument(htmlDecode.content);
  if (!htmlValidate.success) {
    return htmlValidate;
  }

  if (!cssDecode.content.trim()) {
    return { success: false, error: "CSS content is empty" };
  }

  return {
    success: true,
    indexHtml: htmlValidate.html,
    styleCss: cssDecode.content,
  };
}

/**
 * Writes decoded static site files to a local directory (useful for local testing).
 * Paths are constrained to direct children of `targetDir`.
 */
export async function writeStaticSiteToDirectory(
  targetDir: string,
  content: StaticSiteContent,
): Promise<DeploymentFileResult<{ directory: string }>> {
  const htmlResult = validateHtmlDocument(content.indexHtml);
  if (!htmlResult.success) {
    return htmlResult;
  }

  if (!content.styleCss.trim()) {
    return { success: false, error: "CSS content is empty" };
  }

  const resolvedDir = path.resolve(targetDir);
  const indexPath = path.join(resolvedDir, "index.html");
  const cssPath = path.join(resolvedDir, "style.css");

  if (
    path.dirname(indexPath) !== resolvedDir ||
    path.dirname(cssPath) !== resolvedDir
  ) {
    return { success: false, error: "Unsafe target directory" };
  }

  try {
    await fs.mkdir(resolvedDir, { recursive: true });
    await fs.writeFile(indexPath, htmlResult.html, "utf8");
    await fs.writeFile(cssPath, content.styleCss, "utf8");

    return { success: true, directory: resolvedDir };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to write static site files",
    };
  }
}
