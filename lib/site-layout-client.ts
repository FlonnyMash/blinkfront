import type { Website } from "@/types/layout";

type SaveLayoutResponse =
  | { success: true; siteId: string }
  | { success: false; error: string };

type FetchLayoutResponse =
  | { success: true; data: Website }
  | { success: false; error: string };

export async function saveSiteLayout(
  siteId: string,
  website: Website,
): Promise<SaveLayoutResponse> {
  try {
    const response = await fetch("/api/sites/layout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ siteId, website }),
    });

    const result = (await response.json()) as SaveLayoutResponse;

    if (!response.ok || !result.success) {
      return {
        success: false,
        error:
          result.success === false
            ? result.error
            : `Save failed (HTTP ${response.status})`,
      };
    }

    return result;
  } catch {
    return { success: false, error: "Could not reach the server" };
  }
}

export async function fetchSiteLayout(
  siteId: string,
): Promise<FetchLayoutResponse> {
  try {
    const response = await fetch(
      `/api/sites/layout?siteId=${encodeURIComponent(siteId)}`,
      { credentials: "include" },
    );

    const result = (await response.json()) as FetchLayoutResponse;

    if (!response.ok || !result.success) {
      return {
        success: false,
        error:
          result.success === false
            ? result.error
            : `Load failed (HTTP ${response.status})`,
      };
    }

    return result;
  } catch {
    return { success: false, error: "Could not reach the server" };
  }
}
