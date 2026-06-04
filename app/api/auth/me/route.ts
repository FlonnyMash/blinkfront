import { getSessionFromRequest } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = getSessionFromRequest(request);

  if (!user) {
    return Response.json({ authenticated: false, user: null }, { status: 200 });
  }

  return Response.json(
    { authenticated: true, user },
    { status: 200 },
  );
}
