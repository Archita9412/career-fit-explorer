import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { analyzeResume, type ResumeReport } from "@/lib/resume.functions";

export const Route = createFileRoute("/resume-analyzer")({
  head: () => ({ meta: [{ title: "AI resume analyzer — NICO" }, { name: "description", content: "Get a resume score, honest section feedback and the skills recruiters expect." }, { property: "og:title", content: "AI resume analyzer — NICO" }, { property: "og:description", content: "Get a resume score, honest section feedback and the skills recruiters expect." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Analyzer,
});

function Analyzer() {
  const run = useServerFn(analyzeResume);
  const [tab, setTab] = useState<"file" | "text">("file");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [role, setRole] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [report, setReport] = useState<ResumeReport | null>(null);
  const go = async () => {
    setBusy(true); setErr(null); setReport(null);
    try {
      let payload: { text?: string; fileBase64?: string; mediaType?: string; role?: string } = { role };
      if (tab === "text") payload.text = text;
      else if (file) {
        if (file.size > 5 * 1024 * 1024) throw new Error("File is larger than 5 MB");
        if (file.type === "text/plain") payload.text = await file.text();
        else { const b = new Uint8Array(await file.arrayBuffer()); let s = ""; b.forEach((x) => (s += String.fromCharCode(x))); payload = { ...payload, fileBase64: btoa(s), mediaType: "application/pdf" }; }
      }
      const r = await run({ data: payload });
      if (r.error) setErr(r.error); else { setReport(r.report); setTimeout(() => document.getElementById("report")?.scrollIntoView({ behavior: "smooth" }), 50); }
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  };
  const ready = tab === "text" ? text.trim().length > 20 : !!file;
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <p className="text-sm text-muted-foreground">AI resume analyzer</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">Is your resume ready to send?</h1>
      <p className="mt-2 text-muted-foreground">Get a score, honest section feedback and the skills recruiters expect — in under a minute.</p>
      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <div className="flex gap-2">{(["file", "text"] as const).map((t) => <Button key={t} size="sm" variant={tab === t ? "default" : "outline"} onClick={() => setTab(t)}>{t === "file" ? "Upload file" : "Paste text"}</Button>)}</div>
        {tab === "file" ? (
          <label className="mt-4 flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-border p-10 text-center hover:bg-secondary">
            <Upload className="size-6 text-primary" /><span className="mt-2 font-medium">{file ? file.name : "Drop your resume here"}</span>
            <span className="text-xs text-muted-foreground">PDF or .txt, up to 5 MB — or click to browse</span>
            <input type="file" accept=".pdf,.txt,application/pdf,text/plain" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>
        ) : <Textarea className="mt-4" rows={10} placeholder="Paste your resume text…" value={text} onChange={(e) => setText(e.target.value)} />}
        <Input className="mt-4" placeholder="Target role (optional)" value={role} onChange={(e) => setRole(e.target.value)} />
        <Button className="mt-4" disabled={!ready || busy} onClick={go}>{busy ? "Analyzing…" : "Analyze resume"}</Button>
        {busy && <p className="mt-3 text-sm text-muted-foreground">Reading your resume — this usually takes 15–30 seconds…</p>}
        {err && <p className="mt-3 text-sm text-destructive">{err}</p>}
      </div>
      {report && (
        <div id="report" className="mt-8 scroll-mt-20 space-y-6">
          <div className="rounded-xl border border-border bg-card p-6"><p className="text-5xl font-bold text-primary">{report.score}<span className="text-xl text-muted-foreground">/100</span></p><p className="mt-2">{report.verdict}</p></div>
          <div className="grid gap-4 md:grid-cols-2">{report.sections.map((s) => <div key={s.name} className="rounded-xl border border-border bg-card p-5"><div className="flex justify-between font-semibold"><span>{s.name}</span><span>{s.score}/10</span></div><Progress value={s.score * 10} className="mt-2 h-1.5" /><p className="mt-3 text-sm text-muted-foreground">{s.feedback}</p></div>)}</div>
          <div className="grid gap-4 md:grid-cols-2">
            <ListCard title="Strengths" items={report.strengths} /><ListCard title="Improvements" items={report.improvements} />
            <ListCard title="Skills found" items={report.presentSkills} /><ListCard title="Skills recruiters expect" items={report.missingSkills} />
          </div>
        </div>
      )}
    </div>
  );
}
const ListCard = ({ title, items }: { title: string; items: string[] }) => <div className="rounded-xl border border-border bg-card p-5"><h2 className="font-semibold">{title}</h2><ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{items.map((i) => <li key={i}>{i}</li>)}</ul></div>;
