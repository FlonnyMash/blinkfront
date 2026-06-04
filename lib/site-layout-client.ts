import {
  clearGuestDraft,
  loadGuestDraft,
  saveGuestDraft,
  type GuestDraft,
} from "@/lib/guest-draft";
import type { SeoAuditResult } from "@/lib/validations/seo-audit-result";
import type { Website } from "@/types/layout";

const PENDING_DRAFT_STORAGE_KEY = "blinkfront:pendingDraft";
const VOLATILE_DRAFT_STORAGE_KEY = "blinkfront:volatileDraft";
/** In-tab flag while generation / ready is uncommitted. */
export const VOLATILE_SESSION_KEY = "blinkfront:volatileSession";
const SKIP_SITE_ID_HYDRATION_KEY = "blinkfront:skipSiteIdHydration";

export type VolatileBuilderStep = "generating" | "ready";

export type VolatileBuilderDraft = {
  step: VolatileBuilderStep;
  sourceUrl: string;
  seoData: SeoAuditResult | null;
  scrapeAudit?: {
    url: string;
    meta: { title: string | null; description: string | null };
    headings: { h1: string[]; h2: string[] };
    wordCount: number;
    rawContent: string;
  } | null;
  website?: Website;
  siteId?: string | null;
  guestId?: string;
  updatedAt: string;
};

export type PendingDraft = GuestDraft;

export function isCommittedDraft(
  draft: PendingDraft | null | undefined,
): draft is PendingDraft & { workspaceCommitted: true } {
  return Boolean(draft?.workspaceCommitted);
}

export function loadCommittedPendingDraft(): PendingDraft | null {
  const draft = loadPendingDraft() ?? loadGuestDraft();
  return isCommittedDraft(draft) ? draft : null;
}

export function clearUncommittedDrafts(): void {
  const pending = loadPendingDraft();
  if (pending && !pending.workspaceCommitted) {
    clearPendingDraft();
  }
  const guest = loadGuestDraft();
  if (guest && !guest.workspaceCommitted) {
    clearGuestDraft();
  }
}

export function setVolatileBuilderSession(): void {
  try {
    sessionStorage.setItem(VOLATILE_SESSION_KEY, "1");
  } catch {
    // sessionStorage unavailable
  }
}

export function clearVolatileBuilderSession(): void {
  try {
    sessionStorage.removeItem(VOLATILE_SESSION_KEY);
    sessionStorage.removeItem("blinkfront:volatileGeneration");
  } catch {
    // ignore
  }
}

export function hasVolatileBuilderSession(): boolean {
  try {
    return sessionStorage.getItem(VOLATILE_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function saveVolatileDraft(
  draft: Omit<VolatileBuilderDraft, "updatedAt">,
): void {
  try {
    const payload: VolatileBuilderDraft = {
      ...draft,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(VOLATILE_DRAFT_STORAGE_KEY, JSON.stringify(payload));
    setVolatileBuilderSession();
  } catch {
    // localStorage unavailable
  }
}

export function loadVolatileDraft(): VolatileBuilderDraft | null {
  try {
    const raw = localStorage.getItem(VOLATILE_DRAFT_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as VolatileBuilderDraft;
  } catch {
    return null;
  }
}

export function clearVolatileDraft(): void {
  try {
    localStorage.removeItem(VOLATILE_DRAFT_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function hasResumableVolatileSession(): boolean {
  const draft = loadVolatileDraft();
  if (!draft) {
    return false;
  }
  if (draft.step === "ready") {
    return Boolean(draft.website);
  }
  return Boolean(draft.seoData && draft.scrapeAudit);
}

/** Returns the stored volatile draft for resume (does not clear storage). */
export function hydrateVolatileSession(): VolatileBuilderDraft | null {
  return loadVolatileDraft();
}

/** Clears in-progress generation state after the user declines resume or starts over. */
export function discardVolatileBuilderSession(): void {
  clearVolatileDraft();
  clearUncommittedDrafts();
  clearVolatileBuilderSession();
  try {
    sessionStorage.setItem(SKIP_SITE_ID_HYDRATION_KEY, "1");
  } catch {
    // sessionStorage unavailable
  }
}

export function consumeSkipSiteIdHydration(): boolean {
  try {
    if (sessionStorage.getItem(SKIP_SITE_ID_HYDRATION_KEY) === "1") {
      sessionStorage.removeItem(SKIP_SITE_ID_HYDRATION_KEY);
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}

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
    return loadCommittedPendingDraft();
  }

  if (!isCommittedDraft(guestDraft)) {
    return loadCommittedPendingDraft();
  }

  savePendingDraft({
    siteId: guestDraft.siteId,
    guestId: guestDraft.guestId,
    website: guestDraft.website,
    seoData: guestDraft.seoData,
    sourceUrl: guestDraft.sourceUrl,
    workspaceCommitted: true,
  });

  return loadPendingDraft();
}

/** Persists draft to local storage only after the user enters the AI Editor. */
export function commitPendingDraftFromBuilder(input: {
  siteId: string;
  website: Website;
  seoData?: SeoAuditResult | null;
  sourceUrl?: string;
  guestId?: string;
}): void {
  const draft = {
    siteId: input.siteId,
    guestId: input.guestId,
    website: input.website,
    seoData: input.seoData,
    sourceUrl: input.sourceUrl,
    workspaceCommitted: true as const,
  };

  clearVolatileDraft();
  clearVolatileBuilderSession();

  saveGuestDraft(draft);
  savePendingDraft(draft);
}

export function savePendingDraftFromBuilder(input: {
  siteId: string | null;
  website: Website | null;
}): void {
  if (!input.siteId || !input.website) {
    bridgeGuestDraftToPending();
    return;
  }

  const existing = loadCommittedPendingDraft();
  if (!existing) {
    return;
  }

  const draft = {
    siteId: input.siteId,
    guestId: existing.guestId,
    website: input.website,
    seoData: existing.seoData,
    sourceUrl: existing.sourceUrl,
    workspaceCommitted: true as const,
  };

  saveGuestDraft(draft);
  savePendingDraft(draft);
}

export async function syncPendingDraftAfterAuth(options?: {
  claimedSiteId?: string;
}): Promise<SyncPendingDraftResult> {
  const pendingDraft = loadCommittedPendingDraft();
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
