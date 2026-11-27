import { createFileRoute } from "@tanstack/react-router";
import { ChatPanel } from "@/components/ChatPanel";

export const Route = createFileRoute("/assistant")({
  head: () => ({ meta: [{ title: "Nico career assistant — NICO" }, { name: "description", content: "Ask Nico about roles, interview prep, cover notes or what to learn next." }, { property: "og:title", content: "Nico career assistant — NICO" }, { property: "og:description", content: "Ask Nico about roles, interview prep, cover notes or what to learn next." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl font-bold tracking-tight">Nico</h1>
      <p className="mb-6 mt-1 text-muted-foreground">Your career assistant. Ask about roles, interview prep, cover notes, or what to learn next.</p>
      <ChatPanel body={{ mode: "assistant" }} suggestions={["I'm a 2nd-year CS student. Which internships should I target this season?", "Help me prepare for a frontend developer intern interview.", "Write a short cold email asking a startup for an internship.", "What should I learn in the next 3 months to become a data analyst?"]} />
      <p className="mt-3 text-center text-xs text-muted-foreground">Nico can make mistakes. Double-check important details.</p>
    </div>
  ),
});
