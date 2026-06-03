import { renderWebsiteHtml } from "@/lib/deploy/render-html";
import type { Website } from "@/lib/validations/website";

export type DeployWebsiteSuccess = {
  success: true;
  url: string;
  deploymentId: string;
  status: "READY" | "BUILDING";
};

export type DeployWebsiteFailure = { success: false; error: string };
export type DeployWebsiteResult = DeployWebsiteSuccess | DeployWebsiteFailure;

export type DeploymentStatusResult =
  | { success: true; status: "READY" | "BUILDING" | "ERROR"; url?: string }
  | { success: false; error: string };

const SLUG_PATTERN = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;

type VercelEnv = {
  token: string;
  projectId: string;
  teamId?: string;
  deploymentDomain: string;
};

type VercelDeploymentResponse = {
  id: string;
  url?: string;
  readyState?: string;
  alias?: string[];
  aliasAssigned?: boolean;
  error?: { message?: string };
};

function getVercelEnv(): VercelEnv | DeployWebsiteFailure {
  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const deploymentDomain = process.env.DEPLOYMENT_DOMAIN;

  if (!token) {
    return { success: false, error: "VERCEL_TOKEN is not configured" };
  }

  if (!projectId) {
    return { success: false, error: "VERCEL_PROJECT_ID is not configured" };
  }

  if (!deploymentDomain) {
    return { success: false, error: "DEPLOYMENT_DOMAIN is not configured" };
  }

  return {
    token,
    projectId,
    teamId: process.env.VERCEL_TEAM_ID,
    deploymentDomain,
  };
}

function buildApiUrl(path: string, teamId?: string): string {
  const url = new URL(`https://api.vercel.com${path}`);
  if (teamId) {
    url.searchParams.set("teamId", teamId);
  }
  return url.toString();
}

async function vercelFetch<T>(
  env: VercelEnv,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(buildApiUrl(path, env.teamId), {
    ...init,
    headers: {
      Authorization: `Bearer ${env.token}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const payload = (await response.json().catch(() => null)) as
    | (T & { error?: { message?: string; code?: string } })
    | null;

  if (!response.ok) {
    const message =
      payload &&
      typeof payload === "object" &&
      "error" in payload &&
      payload.error?.message
        ? payload.error.message
        : `Vercel API request failed (${response.status})`;
    throw new Error(message);
  }

  return payload as T;
}

export function normalizeSubdomain(
  subdomain: string,
  deploymentDomain: string,
): string | null {
  const trimmed = subdomain.trim().toLowerCase();
  const suffix = `.${deploymentDomain.toLowerCase()}`;
  const slug = trimmed.endsWith(suffix)
    ? trimmed.slice(0, -suffix.length)
    : trimmed;

  return SLUG_PATTERN.test(slug) ? slug : null;
}

export function buildDeploymentUrl(
  slug: string,
  deploymentDomain: string,
): string {
  return `https://${slug}.${deploymentDomain}`;
}

export async function getDeploymentStatus(
  deploymentId: string,
): Promise<DeploymentStatusResult> {
  const envResult = getVercelEnv();
  if ("success" in envResult && envResult.success === false) {
    return envResult;
  }

  const env = envResult as VercelEnv;

  try {
    const deployment = await vercelFetch<VercelDeploymentResponse>(
      env,
      `/v13/deployments/${encodeURIComponent(deploymentId)}`,
    );

    const readyState = deployment.readyState ?? "BUILDING";

    if (readyState === "READY") {
      const alias = deployment.alias?.[0];
      return {
        success: true,
        status: "READY",
        url: alias ? `https://${alias}` : undefined,
      };
    }

    if (readyState === "ERROR" || readyState === "CANCELED") {
      return {
        success: true,
        status: "ERROR",
      };
    }

    return { success: true, status: "BUILDING" };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch deployment status",
    };
  }
}

export async function deployWebsite(
  data: Website,
  subdomain: string,
): Promise<DeployWebsiteResult> {
  const envResult = getVercelEnv();
  if ("success" in envResult && envResult.success === false) {
    return envResult;
  }

  const env = envResult as VercelEnv;
  const slug = normalizeSubdomain(subdomain, env.deploymentDomain);

  if (!slug) {
    return {
      success: false,
      error:
        "Invalid subdomain. Use lowercase letters, numbers, and hyphens (2–63 characters).",
    };
  }

  const alias = `${slug}.${env.deploymentDomain}`;
  const fallbackUrl = buildDeploymentUrl(slug, env.deploymentDomain);

  try {
    const { html, css } = await renderWebsiteHtml(data);

    const deployment = await vercelFetch<VercelDeploymentResponse>(
      env,
      "/v13/deployments",
      {
        method: "POST",
        body: JSON.stringify({
          name: slug,
          project: env.projectId,
          target: "production",
          alias: [alias],
          files: [
            {
              file: "index.html",
              data: Buffer.from(html, "utf8").toString("base64"),
            },
            {
              file: "style.css",
              data: Buffer.from(css, "utf8").toString("base64"),
            },
          ],
        }),
      },
    );

    return {
      success: true,
      url: fallbackUrl,
      deploymentId: deployment.id,
      status: "BUILDING",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Deployment failed",
    };
  }
}
