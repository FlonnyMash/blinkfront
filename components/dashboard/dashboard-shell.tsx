"use client";

import { useState } from "react";

import { DashboardHeader } from "@/components/dashboard/header";
import { DeploymentStatusCard } from "@/components/dashboard/deployment-status-card";
import { UrlInputForm } from "@/components/dashboard/url-input-form";
import { useDeploymentPolling } from "@/hooks/useDeploymentPolling";
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

export function DashboardShell() {
  const [websiteData, setWebsiteData] = useState<Website | null>(null);
  const {
    status: deploymentStatus,
    liveUrl,
    error: deploymentError,
    isPublishing,
    startPolling,
    completeImmediately,
    markBuilding,
    failImmediately,
    reset: resetDeployment,
  } = useDeploymentPolling();

  async function handlePublish(subdomain: string) {
    if (!websiteData) {
      return;
    }

    markBuilding();

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
        failImmediately(result.error);
        return;
      }

      if (result.status === "READY") {
        completeImmediately(result.url);
        return;
      }

      startPolling(result.deploymentId, result.url);
    } catch (error) {
      const message =
        error instanceof TypeError
          ? "Could not reach the publish server. Check that the app is running and try again."
          : error instanceof Error
            ? error.message
            : "Failed to publish site";

      failImmediately(message);
    }
  }

  return (
    <div className="w-full space-y-6">
      <DashboardHeader
        websiteData={websiteData}
        isPublishing={isPublishing}
        onPublish={handlePublish}
      />

      {deploymentStatus !== "IDLE" ? (
        <DeploymentStatusCard
          status={deploymentStatus}
          liveUrl={liveUrl}
          error={deploymentError}
          onDismiss={resetDeployment}
        />
      ) : null}

      <UrlInputForm
        websiteData={websiteData}
        onWebsiteDataChange={setWebsiteData}
      />
    </div>
  );
}
