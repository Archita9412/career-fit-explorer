import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createGateway, friendlyAiError, reasoningOptions } from "@/lib/ai.server";
import { ASSISTANT_PROMPT, interviewPrompt, type InterviewSetup } from "@/lib/prompts";

interface Body { messages: UIMessage[]; mode?: "assistant" | "interview"; setup?: InterviewSetup }

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: Body;
        try { body = (await request.json()) as Body; } catch { return Response.json({ error: "Invalid request" }, { status: 400 }); }
        if (!Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > 80) {
          return Response.json({ error: "Invalid conversation" }, { status: 400 });
        }
        const setup = body.setup;
        const instructions = body.mode === "interview" && setup
          ? interviewPrompt({ role: String(setup.role).slice(0, 120), type: String(setup.type).slice(0, 40), level: String(setup.level).slice(0, 40) })
          : ASSISTANT_PROMPT;
        try {
          const gw = createGateway(request.headers.get("X-Lovable-AIG-Run-ID") ?? undefined);
          const result = streamText({
            model: gw.model,
            instructions,
            messages: await convertToModelMessages(body.messages),
            abortSignal: request.signal,
            providerOptions: reasoningOptions,
          });
          return result.toUIMessageStreamResponse({
            onError: (e) => { console.error("chat error", e); return friendlyAiError(e).message; },
          });
        } catch (e) {
          console.error(e);
          const { status, message } = friendlyAiError(e);
          return Response.json({ error: message }, { status });
        }
      },
    },
  },
});
