import type { SeoAuditResult } from "@/lib/validations/seo-audit-result";
import type { Website } from "@/types/layout";

const GUEST_DRAFT_STORAGE_KEY = "blinkfront:guestDraft";

export type GuestDraft = {
  siteId: string;
  guestId?: string;
  website: Website;
  seoData?: SeoAuditResult | null;
  sourceUrl?: string;
  updatedAt: string;
};

export function saveGuestDraft(draft: Omit<GuestDraft, "updatedAt">): void {
  try {
    const payload: GuestDraft = {
      ...draft,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(GUEST_DRAFT_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // localStorage unavailable (private mode, quota, etc.)
  }
}

export function loadGuestDraft(): GuestDraft | null {
  try {
    const raw = localStorage.getItem(GUEST_DRAFT_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as GuestDraft;
  } catch {
    return null;
  }
}

export function clearGuestDraft(): void {
  try {
    localStorage.removeItem(GUEST_DRAFT_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function updateGuestDraftWebsite(website: Website): void {
  const existing = loadGuestDraft();
  if (!existing) {
    return;
  }
  saveGuestDraft({
    siteId: existing.siteId,
    guestId: existing.guestId,
    website,
    seoData: existing.seoData,
    sourceUrl: existing.sourceUrl,
  });
}
