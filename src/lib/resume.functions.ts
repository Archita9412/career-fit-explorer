import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  score: z.number(),
  verdict: z.string(),
  sections: z.array(z.object({ name: z.string(), score: z.number(), feedback: z.string() })),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  missingSkills: z.array(z.string()),
  presentSkills: z.array(z.string()),
});
export type ResumeReport = z.infer<typeof schema>;

interface Input { text?: string; fileBase64?: string; mediaType?: string; role?: string }

export const analyzeResume = createServerFn({ method: "POST" })
  .inputValidator((d: Input) => {
    if (!d.text && !d.fileBase64) throw new Error("Add your resume first");
    if (d.text && d.text.length > 40_000) throw new Error("Resume text is too long");
    if (d.fileBase64 && d.fileBase64.length > 7_000_000) throw new Error("File is larger than 5 MB");
    return d;
  })
  .handler(async ({ data }): Promise<{ report: ResumeReport | null; error: string | null }> => {
    const { streamText, Output, NoObjectGeneratedError } = await import("ai");
    const { createGateway, friendlyAiError, reasoningOptions } = await import("./ai.server");
    const { RESUME_PROMPT } = await import("./prompts");
    const role = data.role?.trim() ? `Target role: ${data.role.trim().slice(0, 120)}.` : "No target role given — infer the most likely one.";
    const content: Array<{ type: "text"; text: string } | { type: "file"; data: string; mediaType: string; filename: string }> = [
      { type: "text", text: `${role}\nReview this resume.${data.text ? "\n\n" + data.text : ""}` },
    ];
    if (data.fileBase64) content.push({ type: "file", data: data.fileBase64, mediaType: data.mediaType || "application/pdf", filename: "resume.pdf" });
    try {
      const gw = createGateway();
      const result = streamText({
        model: gw.model,
        instructions: RESUME_PROMPT,
        messages: [{ role: "user", content }],
        output: Output.object({ schema }),
        providerOptions: reasoningOptions,
      });
      try {
        const report = await result.output;
        return { report: clamp(report), error: null };
      } catch (e) {
        if (NoObjectGeneratedError.isInstance(e) && e.text) {
          try { return { report: clamp(schema.parse(JSON.parse(e.text))), error: null }; } catch { /* fallthrough */ }
        }
        throw e;
      }
    } catch (e) {
      console.error("resume error", e);
      return { report: null, error: friendlyAiError(e).message };
    }
  });

function clamp(r: ResumeReport): ResumeReport {
  return {
    ...r,
    score: Math.max(0, Math.min(100, Math.round(r.score))),
    sections: r.sections.slice(0, 6).map((s) => ({ ...s, score: Math.max(0, Math.min(10, Math.round(s.score))) })),
    missingSkills: r.missingSkills.slice(0, 8),
    presentSkills: r.presentSkills.slice(0, 10),
  };
}
