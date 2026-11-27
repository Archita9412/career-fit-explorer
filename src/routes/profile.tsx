import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Briefcase, GraduationCap, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { profileCompletion, useApplications, useProfile, useSaveProfile, useSavedJobs, useWithdraw, type Profile } from "@/hooks/useStudent";
import { SkillsEditor } from "@/components/SkillsEditor";
import { getJob } from "@/lib/jobs";
import { JobRow } from "@/components/JobBits";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Student profile — NICO career hub" },
      { name: "description", content: "Save your qualifications, skills and portfolio in one place." },
      { property: "og:title", content: "Student profile — NICO career hub" },
      { property: "og:description", content: "Save your qualifications, skills and portfolio in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

type Form = Pick<Profile, "full_name" | "university" | "degree" | "graduation_year" | "headline" | "bio" | "portfolio_url" | "linkedin_url" | "github_url" | "skills">;
const empty: Form = { full_name: "", university: "", degree: "", graduation_year: "", headline: "", bio: "", portfolio_url: "", linkedin_url: "", github_url: "", skills: [] };

function ProfilePage() {
  const { user, loading } = useAuth();
  if (loading) return <div className="mx-auto max-w-4xl px-4 py-16 text-muted-foreground">Loading…</div>;
  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <p className="text-sm text-muted-foreground">Your career, on record</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">Student profile</h1>
        <div className="mt-10 rounded-xl border border-border bg-card p-10 text-center">
          <GraduationCap className="mx-auto size-10 text-primary" />
          <h2 className="mt-4 text-xl font-semibold">Make your first impression count.</h2>
          <p className="mt-2 text-sm text-muted-foreground">Create a student account to save your qualifications and portfolio.</p>
          <Button className="mt-6" asChild><Link to="/auth" search={{ mode: "signup" }}>Create your account</Link></Button>
        </div>
      </div>
    );
  }
  return <ProfileEditor />;
}

function ProfileEditor() {
  const { data: profile, isLoading } = useProfile();
  const save = useSaveProfile();
  const { data: saved = [] } = useSavedJobs();
  const { data: apps = [] } = useApplications();
  const withdraw = useWithdraw();
  const [form, setForm] = useState<Form>(empty);
  useEffect(() => {
    if (profile) setForm({ ...empty, ...Object.fromEntries(Object.entries(profile).map(([k, v]) => [k, v ?? (k === "skills" ? [] : "")])) } as Form);
  }, [profile]);
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });
  const completion = profileCompletion({ ...(profile as Profile), ...form });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await save.mutateAsync(form);
    toast.success("Profile saved");
  };

  if (isLoading) return <div className="mx-auto max-w-4xl px-4 py-16 text-muted-foreground">Loading…</div>;

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[1fr_320px]">
      <form onSubmit={submit} className="space-y-8">
        <div>
          <p className="text-sm text-muted-foreground">Your career, on record</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">Student profile</h1>
          <div className="mt-5 max-w-sm"><div className="flex justify-between text-xs"><span>Profile completion</span><span className="font-semibold text-primary">{completion}%</span></div><Progress value={completion} className="mt-2 h-1.5" /></div>
        </div>
        <Section title="About you">
          <Field label="Full name"><Input value={form.full_name ?? ""} onChange={set("full_name")} /></Field>
          <Field label="Headline"><Input placeholder="2nd-year CS student who loves building web apps" value={form.headline ?? ""} onChange={set("headline")} /></Field>
          <Field label="Bio" wide><Textarea rows={4} value={form.bio ?? ""} onChange={set("bio")} /></Field>
        </Section>
        <Section title="Qualifications">
          <Field label="University"><Input value={form.university ?? ""} onChange={set("university")} /></Field>
          <Field label="Degree"><Input placeholder="B.Tech Computer Science" value={form.degree ?? ""} onChange={set("degree")} /></Field>
          <Field label="Graduation year"><Input placeholder="2027" value={form.graduation_year ?? ""} onChange={set("graduation_year")} /></Field>
        </Section>
        <Section title="Skills">
          <div className="md:col-span-2"><SkillsEditor skills={form.skills} onChange={(skills) => setForm({ ...form, skills })} /></div>
        </Section>
        <Section title="Portfolio & links">
          <Field label="Portfolio"><Input type="url" placeholder="https://" value={form.portfolio_url ?? ""} onChange={set("portfolio_url")} /></Field>
          <Field label="GitHub"><Input type="url" placeholder="https://github.com/" value={form.github_url ?? ""} onChange={set("github_url")} /></Field>
          <Field label="LinkedIn"><Input type="url" placeholder="https://linkedin.com/in/" value={form.linkedin_url ?? ""} onChange={set("linkedin_url")} /></Field>
        </Section>
        <Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save profile"}</Button>
      </form>

      <aside className="space-y-8">
        <div>
          <h2 className="flex items-center gap-2 font-semibold"><Briefcase className="size-4" /> My applications</h2>
          {apps.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No applications yet. <Link to="/jobs" className="text-primary">Browse jobs</Link></p> : (
            <ul className="mt-3 space-y-2">
              {apps.map((a) => { const j = getJob(a.job_slug); return (
                <li key={a.id} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card p-3">
                  <div className="min-w-0"><p className="truncate text-sm font-medium">{j?.title ?? a.job_slug}</p><p className="text-xs text-muted-foreground">{j?.company} · {a.status} · {new Date(a.created_at).toLocaleDateString("en-IN")}</p></div>
                  <Button variant="ghost" size="icon" aria-label="Withdraw" onClick={() => withdraw.mutate(a.id)}><Trash2 /></Button>
                </li>); })}
            </ul>
          )}
        </div>
        <div>
          <h2 className="font-semibold">Saved jobs</h2>
          {saved.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">Nothing saved yet.</p> : saved.map((s) => { const j = getJob(s); return j ? <JobRow key={s} job={j} /> : null; })}
        </div>
      </aside>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-xl border border-border bg-card p-6"><h2 className="font-semibold">{title}</h2><div className="mt-4 grid gap-4 md:grid-cols-2">{children}</div></section>;
}
function Field({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return <div className={wide ? "space-y-1.5 md:col-span-2" : "space-y-1.5"}><Label>{label}</Label>{children}</div>;
}
