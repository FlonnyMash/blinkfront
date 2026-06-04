"use client";

import { useState } from "react";
import { toast } from "sonner";

import { DashboardHeader } from "@/components/dashboard/header";
import { UrlInputForm } from "@/components/dashboard/url-input-form";
import type { Website } from "@/types/layout";

type PublishSuccessResponse = {
  success: true;
  url: string;
  deploymentId: string;
  status: "READY" | "BUILDING";
};

type PublishFailureResponse = {
  success: false;
  error: string;
};

type PublishResponse = PublishSuccessResponse | PublishFailureResponse;

type DeploymentStatusResponse =
  | { success: true; status: "READY" | "BUILDING" | "ERROR"; url?: string }
  | { success: false; error: string };

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 60_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function pollDeploymentUntilReady(
  deploymentId: string,
  fallbackUrl: string,
  toastId: string | number,
): Promise<string> {
  const deadline = Date.now() + POLL_TIMEOUT_MS;

  while (Date.now() < deadline) {
    await sleep(POLL_INTERVAL_MS);

    const response = await fetch(
      `/api/publish?deploymentId=${encodeURIComponent(deploymentId)}`,
    );

    if (!response.ok) {
      throw new Error(`Status check failed (HTTP ${response.status})`);
    }

    const result = (await response.json()) as DeploymentStatusResponse;

    if (!result.success) {
      throw new Error(result.error);
    }

    if (result.status === "READY") {
      return result.url ?? fallbackUrl;
    }

    if (result.status === "ERROR") {
      throw new Error("Deployment failed on Vercel");
    }

    toast.loading("Deploying to Global CDN...", { id: toastId });
  }

  return fallbackUrl;
}

export function DashboardShell() {
  const [websiteData, setWebsiteData] = useState<Website | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  async function handlePublish(subdomain: string) {
    if (!websiteData) {
      return;
    }

    setIsPublishing(true);
    const toastId = toast.loading("Deploying to Global CDN...");

    try {
      const response = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ website: websiteData, subdomain }),
      });

      if (!response.ok) {
        throw new Error(`Publish request failed (HTTP ${response.status})`);
      }

      const result = (await response.json()) as PublishResponse;

      if (!result.success) {
        toast.error(result.error, { id: toastId });
        return;
      }

      const liveUrl = await pollDeploymentUntilReady(
        result.deploymentId,
        result.url,
        toastId,
      );

      toast.success("Your site is live!", {
        id: toastId,
        description: liveUrl,
        action: {
          label: "Open",
          onClick: () => window.open(liveUrl, "_blank", "noopener,noreferrer"),
        },
      });
    } catch (error) {
      const message =
        error instanceof TypeError
          ? "Could not reach the publish server. Check that the app is running and try again."
          : error instanceof Error
            ? error.message
            : "Failed to publish site";

      toast.error(message, { id: toastId });
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <div className="w-full space-y-6">
      <DashboardHeader
        websiteData={websiteData}
        isPublishing={isPublishing}
        onPublish={handlePublish}
      />
      <UrlInputForm
        websiteData={websiteData}
        onWebsiteDataChange={setWebsiteData}
      />
    </div>
  );
}
