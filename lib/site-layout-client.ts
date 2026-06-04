import {
  clearGuestDraft,
  loadGuestDraft,
  saveGuestDraft,
  type GuestDraft,
} from "@/lib/guest-draft";
import type { Website } from "@/types/layout";

const PENDING_DRAFT_STORAGE_KEY = "blinkfront:pendingDraft";

export type PendingDraft = GuestDraft;

type SaveLayoutResponse =
  | { success: true; siteId: string }
  | { success: false; error: string };

type FetchLayoutResponse =
  | { success: true; data: Website }
  | { success: false; error: string };

type SyncPendingDraftResult =
  | { success: true; siteId?: string }
  | { success: false; error: string };

export function savePendingDraft(
  draft: Omit<PendingDraft, "updatedAt">,
): void {
  try {
    const payload: PendingDraft = {
      ...draft,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(PENDING_DRAFT_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // localStorage unavailable (private mode, quota, etc.)
  }
}

export function loadPendingDraft(): PendingDraft | null {
  try {
    const raw = localStorage.getItem(PENDING_DRAFT_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as PendingDraft;
  } catch {
    return null;
  }
}

export function clearPendingDraft(): void {
  try {
    localStorage.removeItem(PENDING_DRAFT_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function bridgeGuestDraftToPending(): PendingDraft | null {
  const guestDraft = loadGuestDraft();
  if (!guestDraft) {
    return loadPendingDraft();
  }

  savePendingDraft({
    siteId: guestDraft.siteId,
    guestId: guestDraft.guestId,
    website: guestDraft.website,
    seoData: guestDraft.seoData,
    sourceUrl: guestDraft.sourceUrl,
  });

  return loadPendingDraft();
}

export function savePendingDraftFromBuilder(input: {
  siteId: string | null;
  website: Website | null;
}): void {
  if (!input.siteId || !input.website) {
    bridgeGuestDraftToPending();
    return;
  }

  const existing = loadGuestDraft();
  const draft = {
    siteId: input.siteId,
    guestId: existing?.guestId,
    website: input.website,
    seoData: existing?.seoData,
    sourceUrl: existing?.sourceUrl,
  };

  saveGuestDraft(draft);
  savePendingDraft(draft);
}

export async function syncPendingDraftAfterAuth(options?: {
  claimedSiteId?: string;
}): Promise<SyncPendingDraftResult> {
  const pendingDraft = loadPendingDraft() ?? loadGuestDraft();
  if (!pendingDraft) {
    return { success: true };
  }

  const siteId = options?.claimedSiteId ?? pendingDraft.siteId;

  if (pendingDraft.guestId && !options?.claimedSiteId) {
    try {
      await fetch("/api/sites/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          siteId: pendingDraft.siteId,
          guestId: pendingDraft.guestId,
        }),
      });
    } catch {
      // Claim may have already succeeded during login; layout sync is authoritative.
    }
  }

  const saved = await saveSiteLayout(siteId, pendingDraft.website);
  if (!saved.success) {
    return { success: false, error: saved.error };
  }

  clearPendingDraft();
  clearGuestDraft();
  return { success: true, siteId };
}

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
