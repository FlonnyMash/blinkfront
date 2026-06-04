import {
  buildStaticSiteDeploymentFiles,
  decodeStaticSiteFromBase64,
  type VercelDeploymentFile,
} from "@/lib/deploy/deployment-files";
import { renderWebsiteHtml } from "@/lib/deploy/render-html";
import type { Website } from "@/types/layout";

export type DeployWebsiteSuccess = {
  success: true;
  url: string;
  deploymentId: string;
  status: "READY" | "BUILDING";
};

export type DeployWebsiteFailure = { success: false; error: string };
export type DeployWebsiteResult = DeployWebsiteSuccess | DeployWebsiteFailure;

export type CreateDeploymentFromBase64Success = {
  success: true;
  url: string;
  deploymentId: string;
};

export type CreateDeploymentFromBase64Failure = { success: false; error: string };
export type CreateDeploymentFromBase64Result =
  | CreateDeploymentFromBase64Success
  | CreateDeploymentFromBase64Failure;

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
  error?: { message?: string; code?: string };
};

type VercelProjectResponse = {
  id: string;
  name: string;
  framework?: string | null;
  buildCommand?: string | null;
};

type VercelProjectDomainsResponse = {
  domains: Array<{ name: string; verified: boolean }>;
};

const STATIC_PUBLISH_PROJECT_ID = "prj_Qr16GHmiDeHN1vX7B6APCi8MhKKF";

const STATIC_PROJECT_SETTINGS = {
  framework: null,
  buildCommand: null,
  devCommand: null,
  installCommand: null,
  outputDirectory: null,
} as const;

function getVercelEnv(): VercelEnv | DeployWebsiteFailure {
  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.PUBLISH_VERCEL_PROJECT_ID;
  const deploymentDomain = process.env.DEPLOYMENT_DOMAIN;

  if (!token) {
    return { success: false, error: "VERCEL_TOKEN is not configured" };
  }

  if (!projectId) {
    return {
      success: false,
      error:
        "PUBLISH_VERCEL_PROJECT_ID is not configured. Set it to your static publish project ID (not the builder app project).",
    };
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

async function verifyPublishProject(env: VercelEnv): Promise<DeployWebsiteFailure | null> {
  try {
    const project = await vercelFetch<VercelProjectResponse>(
      env,
      `/v9/projects/${encodeURIComponent(env.projectId)}`,
    );

    if (project.framework && project.framework !== "null") {
      return {
        success: false,
        error: `PUBLISH_VERCEL_PROJECT_ID is set to "${project.name}" (${project.framework}). Published sites must use the static project "blinkfront-published-sites" (${STATIC_PUBLISH_PROJECT_ID}). Update PUBLISH_VERCEL_PROJECT_ID in .env.local (or Vercel project env vars), then restart the dev server.`,
      };
    }

    return null;
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Could not verify the Vercel publish project",
    };
  }
}

async function getDeploymentErrorMessage(
  env: VercelEnv,
  deploymentId: string,
  deployment: VercelDeploymentResponse,
): Promise<string> {
  if (deployment.error?.message) {
    return deployment.error.message;
  }

  try {
    const list = await vercelFetch<{ deployments: Array<{ uid: string; errorMessage?: string }> }>(
      env,
      `/v6/deployments?projectId=${encodeURIComponent(env.projectId)}&limit=20`,
    );
    const match = list.deployments.find((item) => item.uid === deploymentId);
    if (match?.errorMessage) {
      return match.errorMessage;
    }
  } catch {
    // Fall through to generic guidance below.
  }

  return "Deployment failed on Vercel. Ensure PUBLISH_VERCEL_PROJECT_ID points to the static project blinkfront-published-sites, not your Next.js builder project.";
}

async function getVerifiedProjectDomains(env: VercelEnv): Promise<Set<string>> {
  const response = await vercelFetch<VercelProjectDomainsResponse>(
    env,
    `/v9/projects/${encodeURIComponent(env.projectId)}/domains`,
  );

  return new Set(
    response.domains
      .filter((domain) => domain.verified)
      .map((domain) => domain.name.toLowerCase()),
  );
}

function canAssignCustomAlias(
  deploymentDomain: string,
  verifiedDomains: Set<string>,
): boolean {
  const domain = deploymentDomain.toLowerCase();

  // Default *.vercel.app URLs cannot serve arbitrary slug subdomains with valid SSL.
  if (domain.endsWith(".vercel.app")) {
    return verifiedDomains.has(domain);
  }

  return verifiedDomains.has(domain);
}

function resolvePublicUrl(
  deployment: VercelDeploymentResponse,
  deploymentDomain: string,
): string | undefined {
  const deploymentUrl = deployment.url
    ? `https://${deployment.url}`
    : undefined;

  if (!deployment.aliasAssigned || !deployment.alias?.length) {
    return deploymentUrl;
  }

  const domain = deploymentDomain.toLowerCase();

  // Default *.vercel.app project URLs cannot serve per-site slug subdomains.
  if (domain.endsWith(".vercel.app")) {
    return deploymentUrl;
  }

  const customAlias = deployment.alias.find((host) => {
    const normalized = host.toLowerCase();
    return normalized.endsWith(`.${domain}`) && normalized !== domain;
  });

  return customAlias ? `https://${customAlias}` : deploymentUrl;
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
      return {
        success: true,
        status: "READY",
        url: resolvePublicUrl(deployment, env.deploymentDomain),
      };
    }

    if (readyState === "ERROR" || readyState === "CANCELED") {
      const errorMessage = await getDeploymentErrorMessage(
        env,
        deploymentId,
        deployment,
      );
      return {
        success: false,
        error: errorMessage,
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

async function uploadStaticSiteFiles(
  env: VercelEnv,
  slug: string,
  files: VercelDeploymentFile[],
): Promise<CreateDeploymentFromBase64Result> {
  const alias = `${slug}.${env.deploymentDomain}`;
  let verifiedDomains: Set<string>;

  try {
    verifiedDomains = await getVerifiedProjectDomains(env);
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Could not verify publish project domains",
    };
  }

  const useCustomAlias = canAssignCustomAlias(env.deploymentDomain, verifiedDomains);

  try {
    const deployment = await vercelFetch<VercelDeploymentResponse>(
      env,
      "/v13/deployments",
      {
        method: "POST",
        body: JSON.stringify({
          name: slug,
          project: env.projectId,
          target: "production",
          public: true,
          ...(useCustomAlias ? { alias: [alias] } : {}),
          projectSettings: STATIC_PROJECT_SETTINGS,
          files,
        }),
      },
    );

    const publicUrl = resolvePublicUrl(deployment, env.deploymentDomain);

    if (!publicUrl) {
      return {
        success: false,
        error: "Deployment succeeded but no public URL was returned by Vercel",
      };
    }

    return {
      success: true,
      url: publicUrl,
      deploymentId: deployment.id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Deployment failed",
    };
  }
}

async function prepareStaticSiteDeployment(
  subdomain: string,
): Promise<
  | { success: false; error: string }
  | { success: true; env: VercelEnv; slug: string }
> {
  const envResult = getVercelEnv();
  if ("success" in envResult && envResult.success === false) {
    return envResult;
  }

  const env = envResult as VercelEnv;
  const projectError = await verifyPublishProject(env);
  if (projectError) {
    return projectError;
  }

  const slug = normalizeSubdomain(subdomain, env.deploymentDomain);
  if (!slug) {
    return {
      success: false,
      error:
        "Invalid subdomain. Use lowercase letters, numbers, and hyphens (2–63 characters).",
    };
  }

  return { success: true, env, slug };
}

/**
 * Decodes Base64 site assets, uploads them to Vercel, and returns only the live URL
 * and deployment ID — never the raw HTML/CSS payload.
 */
export async function createDeploymentFromBase64(
  encodedHtml: string,
  encodedCss: string,
  subdomain: string,
): Promise<CreateDeploymentFromBase64Result> {
  const prepared = await prepareStaticSiteDeployment(subdomain);
  if (!prepared.success) {
    return prepared;
  }

  const decoded = decodeStaticSiteFromBase64(encodedHtml, encodedCss);
  if (!decoded.success) {
    return decoded;
  }

  const filesResult = buildStaticSiteDeploymentFiles(
    decoded.indexHtml,
    decoded.styleCss,
  );
  if (!filesResult.success) {
    return filesResult;
  }

  return uploadStaticSiteFiles(prepared.env, prepared.slug, filesResult.files);
}

export async function deployWebsite(
  data: Website,
  subdomain: string,
): Promise<DeployWebsiteResult> {
  const prepared = await prepareStaticSiteDeployment(subdomain);
  if (!prepared.success) {
    return prepared;
  }

  try {
    const { html, css } = await renderWebsiteHtml(data);
    const filesResult = buildStaticSiteDeploymentFiles(html, css);

    if (!filesResult.success) {
      return { success: false, error: filesResult.error };
    }

    const deployment = await uploadStaticSiteFiles(
      prepared.env,
      prepared.slug,
      filesResult.files,
    );

    if (!deployment.success) {
      return deployment;
    }

    return {
      ...deployment,
      status: "BUILDING",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Deployment failed",
    };
  }
}
