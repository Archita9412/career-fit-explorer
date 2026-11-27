import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mic } from "lucide-react";
import { ChatPanel } from "@/components/ChatPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/interview-assistant")({
  head: () => ({ meta: [{ title: "AI interview assistant — NICO" }, { name: "description", content: "Mock interviews with spoken questions, live feedback and a score out of 10." }, { property: "og:title", content: "AI interview assistant — NICO" }, { property: "og:description", content: "Mock interviews with spoken questions, live feedback and a score out of 10." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Interview,
});

const PRESETS = [["Frontend Developer Intern", "Mixed"], ["Data Analyst Intern", "Technical"], ["Software Engineering Intern", "Behavioral"], ["Backend Engineer (Graduate)", "Technical"]];

function speak(t: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(t.replace(/[*#_]/g, "")));
}

function Interview() {
  const [role, setRole] = useState("Frontend Developer Intern");
  const [type, setType] = useState("Mixed");
  const [level, setLevel] = useState("Intern / Entry");
  const [voice, setVoice] = useState(true);
  const [session, setSession] = useState(0);
  const listen = (setInput: (s: string) => void) => {
    const W = window as unknown as { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any };
    const SR = W.SpeechRecognition ?? W.webkitSpeechRecognition;
    if (!SR) { alert("Voice input isn't supported in this browser. Please type your answer."); return; }
    const r = new SR(); r.lang = "en-IN";
    r.onresult = (e: any) => setInput(e.results[0][0].transcript);
    r.start();
  };
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-4xl font-bold tracking-tight">AI Interview Assistant</h1>
      <p className="mt-1 text-muted-foreground">Questions are read aloud; answer with the mic or by typing. You get feedback and a score out of 10 after each answer.</p>
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Input className="w-64 bg-card" value={role} onChange={(e) => setRole(e.target.value)} />
        {["Mixed", "Technical", "Behavioral"].map((t) => <Button key={t} size="sm" variant={type === t ? "default" : "outline"} onClick={() => setType(t)}>{t}</Button>)}
        {["Intern / Entry", "Graduate", "Experienced"].map((l) => <Button key={l} size="sm" variant={level === l ? "default" : "outline"} onClick={() => setLevel(l)}>{l}</Button>)}
        <Button size="sm" variant="ghost" onClick={() => setVoice(!voice)}>Voice {voice ? "on" : "off"}</Button>
        <Button size="sm" variant="lime" onClick={() => setSession((s) => s + 1)}>New interview</Button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">{PRESETS.map(([r, t]) => <button key={r} onClick={() => { setRole(r!); setType(t!); setSession((s) => s + 1); }} className="rounded-full border border-border bg-card px-3 py-1 text-xs hover:bg-secondary">{r} · {t}</button>)}</div>
      <div className="mt-6">
        {session === 0 ? <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">Pick a setup and press "New interview" to begin.</p> : (
          <ChatPanel key={session} autoStart="START" body={{ mode: "interview", setup: { role, type, level } }} placeholder="Type your answer, or use the mic…" onAssistantText={(t) => voice && speak(t)}
            extra={(setInput) => <Button type="button" variant="outline" size="icon" aria-label="Speak answer" onClick={() => listen(setInput)}><Mic /></Button>} />
        )}
      </div>
    </div>
  );
}
