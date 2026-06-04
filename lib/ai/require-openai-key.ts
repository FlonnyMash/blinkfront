export function requireOpenAiKey(): void {
  if (!process.env.OPENAI_API_KEY?.trim()) {
    throw new Error(
      "OPENAI_API_KEY is not configured. Add it in Vercel → Project Settings → Environment Variables, then redeploy.",
    );
  }
}
