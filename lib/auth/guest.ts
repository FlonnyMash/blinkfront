import { cookies } from "next/headers";

import {
  GUEST_ID_COOKIE,
  GUEST_ID_MAX_AGE_SECONDS,
} from "@/lib/auth/constants";

function readGuestIdFromCookieHeader(cookieHeader: string | null): string | undefined {
  if (!cookieHeader) {
    return undefined;
  }

  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${GUEST_ID_COOKIE}=([^;]*)`),
  );
  const value = match?.[1]?.trim();
  return value || undefined;
}

export function createGuestId(): string {
  return crypto.randomUUID();
}

export async function getGuestIdFromCookies(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(GUEST_ID_COOKIE)?.value;
}

export function getGuestIdFromRequest(request: Request): string | undefined {
  return readGuestIdFromCookieHeader(request.headers.get("cookie"));
}

export async function ensureGuestIdCookie(
  existingGuestId?: string,
): Promise<string> {
  const guestId = existingGuestId ?? createGuestId();
  const cookieStore = await cookies();
  cookieStore.set(GUEST_ID_COOKIE, guestId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: GUEST_ID_MAX_AGE_SECONDS,
  });
  return guestId;
}

export async function clearGuestIdCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(GUEST_ID_COOKIE);
}
