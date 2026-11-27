import { createOpenAI } from "@ai-sdk/openai";

const GATEWAY = "https://ai.gateway.lovable.dev/v1";
export const MODEL = "openai/gpt-6.1-sol";
const RUN_ID = "X-Lovable-AIG-Run-ID";

export function createGateway(initialRunId?: string) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured");
  let runId = initialRunId?.trim() || undefined;
  const provider = createOpenAI({
    baseURL: GATEWAY,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: async (input, init) => {
      const headers = new Headers(init?.headers);
      if (runId && !headers.has(RUN_ID)) headers.set(RUN_ID, runId);
      const res = await fetch(input, { ...init, headers });
      runId ??= res.headers.get(RUN_ID)?.trim() || undefined;
      return res;
    },
  });
  return { model: provider.responses(MODEL), getRunId: () => runId };
}

export const reasoningOptions = {
  openai: {
    forceReasoning: true,
    reasoningEffort: "low",
    reasoningSummary: "auto",
    store: false,
    include: ["reasoning.encrypted_content"],
  },
} as const;

export function friendlyAiError(e: unknown): { status: number; message: string } {
  const status = (e as { statusCode?: number })?.statusCode ?? 500;
  if (status === 429) return { status, message: "Nico is a little busy right now. Please try again in a minute." };
  if (status === 402) return { status, message: "AI credits have run out for this app. Add credits to keep using Nico." };
  if (status === 403) return { status, message: "AI access is blocked for this workspace." };
  return { status: 500, message: "Something went wrong talking to Nico. Please try again." };
}
