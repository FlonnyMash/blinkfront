"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type DeploymentUiStatus = "IDLE" | "BUILDING" | "SUCCESS" | "ERROR";

type DeploymentStatusResponse =
  | { success: true; status: "READY" | "BUILDING" | "ERROR"; url?: string }
  | { success: false; error: string };

const POLL_INTERVAL_MS = 2500;
const POLL_TIMEOUT_MS = 60_000;

export function useDeploymentPolling() {
  const [status, setStatus] = useState<DeploymentUiStatus>("IDLE");
  const [liveUrl, setLiveUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef(false);
  const pollingActiveRef = useRef(false);

  const clearPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    clearPolling();
    pollingActiveRef.current = false;
    setStatus("IDLE");
    setLiveUrl(null);
    setError(null);
  }, [clearPolling]);

  const finishWithError = useCallback(
    (message: string) => {
      clearPolling();
      pollingActiveRef.current = false;
      setStatus("ERROR");
      setError(message);
    },
    [clearPolling],
  );

  const finishWithSuccess = useCallback(
    (url: string) => {
      clearPolling();
      pollingActiveRef.current = false;
      setLiveUrl(url);
      setStatus("SUCCESS");
      setError(null);
    },
    [clearPolling],
  );

  const completeImmediately = useCallback(
    (url: string) => {
      finishWithSuccess(url);
    },
    [finishWithSuccess],
  );

  const markBuilding = useCallback(() => {
    clearPolling();
    pollingActiveRef.current = false;
    setStatus("BUILDING");
    setLiveUrl(null);
    setError(null);
  }, [clearPolling]);

  const failImmediately = useCallback(
    (message: string) => {
      finishWithError(message);
    },
    [finishWithError],
  );

  const startPolling = useCallback(
    (deploymentId: string, fallbackUrl: string) => {
      clearPolling();
      pollingActiveRef.current = true;
      setStatus("BUILDING");
      setLiveUrl(null);
      setError(null);

      const pollOnce = async () => {
        if (inFlightRef.current) {
          return;
        }
        inFlightRef.current = true;

        try {
          const response = await fetch(
            `/api/publish?deploymentId=${encodeURIComponent(deploymentId)}`,
          );

          if (!response.ok) {
            throw new Error(`Status check failed (HTTP ${response.status})`);
          }

          const result = (await response.json()) as DeploymentStatusResponse;

          if (!result.success) {
            finishWithError(result.error);
            return;
          }

          if (result.status === "READY") {
            finishWithSuccess(result.url ?? fallbackUrl);
            return;
          }

          if (result.status === "ERROR") {
            finishWithError("Deployment failed on Vercel. Check the project logs and try again.");
          }
        } catch (pollError) {
          const message =
            pollError instanceof Error
              ? pollError.message
              : "Failed to check deployment status";
          finishWithError(message);
        } finally {
          inFlightRef.current = false;
        }
      };

      void pollOnce();

      intervalRef.current = setInterval(() => {
        void pollOnce();
      }, POLL_INTERVAL_MS);

      timeoutRef.current = setTimeout(() => {
        if (pollingActiveRef.current) {
          finishWithSuccess(fallbackUrl);
        }
      }, POLL_TIMEOUT_MS);
    },
    [clearPolling, finishWithError, finishWithSuccess],
  );

  useEffect(() => {
    return () => clearPolling();
  }, [clearPolling]);

  const isPublishing = status === "BUILDING";

  return {
    status,
    liveUrl,
    error,
    isPublishing,
    startPolling,
    completeImmediately,
    markBuilding,
    failImmediately,
    reset,
  };
}
