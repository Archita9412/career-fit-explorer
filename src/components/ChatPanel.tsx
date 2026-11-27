import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ChatPanel({ body, suggestions = [], onAssistantText, autoStart, placeholder = "Ask Nico…", extra }: {
  body?: Record<string, unknown>; suggestions?: string[]; onAssistantText?: (t: string) => void; autoStart?: string; placeholder?: string; extra?: (setInput: (s: string) => void) => React.ReactNode;
}) {
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat", body: body ?? {} }), [JSON.stringify(body)]);
  const { messages, sendMessage, status, error } = useChat({ transport });
  const [input, setInput] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  useEffect(() => { if (autoStart && !started.current) { started.current = true; sendMessage({ text: autoStart }); } }, [autoStart, sendMessage]);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  const textOf = (m: (typeof messages)[number]) => m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (status === "ready" && last?.role === "assistant") onAssistantText?.(textOf(last));
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps
  const busy = status === "submitted" || status === "streaming";
  const send = (t: string) => { if (!t.trim() || busy) return; sendMessage({ text: t }); setInput(""); };
  const visible = messages.filter((m) => !(m.role === "user" && textOf(m) === autoStart));
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card">
      <div className="min-h-[360px] flex-1 space-y-4 overflow-y-auto p-5">
        {visible.length === 0 && suggestions.length > 0 && (
          <div className="grid gap-2 md:grid-cols-2">{suggestions.map((s) => <button key={s} onClick={() => send(s)} className="rounded-lg border border-border p-3 text-left text-sm hover:bg-secondary">{s}</button>)}</div>
        )}
        {visible.map((m) => m.role === "user"
          ? <div key={m.id} className="ml-auto max-w-[80%] rounded-2xl bg-primary px-4 py-2 text-sm text-primary-foreground">{textOf(m)}</div>
          : <div key={m.id} className="prose prose-sm max-w-none text-sm leading-relaxed [&_li]:ml-4 [&_ol]:list-decimal [&_p]:my-2 [&_ul]:list-disc"><ReactMarkdown>{textOf(m)}</ReactMarkdown></div>)}
        {status === "submitted" && <p className="text-sm text-muted-foreground">Nico is thinking…</p>}
        {error && <p className="text-sm text-destructive">{error.message || "Something went wrong. Please try again."}</p>}
        <div ref={end} />
      </div>
      <form className="flex items-end gap-2 border-t border-border p-3" onSubmit={(e) => { e.preventDefault(); send(input); }}>
        {extra?.(setInput)}
        <Textarea rows={2} value={input} placeholder={placeholder} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }} />
        <Button type="submit" size="icon" disabled={busy || !input.trim()} aria-label="Send"><Send /></Button>
      </form>
    </div>
  );
}
