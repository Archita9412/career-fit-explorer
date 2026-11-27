import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarClock, MapPin, Sparkles, Wallet } from "lucide-react";
import { DOMAINS, JOBS, daysLeft, formatDeadline, matchScore, type Job } from "@/lib/jobs";
import { CompanyBadge, SaveButton, TypePill } from "@/components/JobBits";
import { SkillsEditor } from "@/components/SkillsEditor";
import { useMySkills } from "@/hooks/useMySkills";
import { useSavedJobs } from "@/hooks/useStudent";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/jobs/")({
  head: () => ({
    meta: [
      { title: "Job portal — internships & graduate roles | NICO" },
      { name: "description", content: "Browse internships and full-time roles, filter by domain and work mode, and see how well you match." },
      { property: "og:title", content: "Job portal — internships & graduate roles | NICO" },
      { property: "og:description", content: "Browse internships and full-time roles, filter by domain and work mode, and see how well you match." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: JobsPage,
});

type Tab = "all" | "Internship" | "Full-time";

function JobsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("all");
  const [domain, setDomain] = useState("any");
  const [mode, setMode] = useState("any");
  const [type, setType] = useState("any");
  const [sort, setSort] = useState<"newest" | "match">("newest");
  const [savedOnly, setSavedOnly] = useState(false);
  const [closing, setClosing] = useState(false);
  const [skills, setSkills] = useMySkills();
  const { data: saved = [] } = useSavedJobs();

  const list = useMemo(() => {
    let l = JOBS.filter((j) => daysLeft(j) > 0);
    if (tab !== "all") l = l.filter((j) => j.type === tab);
    if (domain !== "any") l = l.filter((j) => j.domain === domain);
    if (mode !== "any") l = l.filter((j) => j.mode === mode);
    if (type !== "any") l = l.filter((j) => j.type === type);
    if (savedOnly) l = l.filter((j) => saved.includes(j.slug));
    if (closing) l = l.filter((j) => daysLeft(j) <= 7);
    return [...l].sort((a, b) => sort === "match" ? matchScore(b, skills) - matchScore(a, skills) : b.posted.localeCompare(a.posted));
  }, [tab, domain, mode, type, savedOnly, closing, sort, skills, saved]);

  const shortlist = useMemo(() => skills.length ? [...JOBS].filter((j) => daysLeft(j) > 0).sort((a, b) => matchScore(b, skills) - matchScore(a, skills)).filter((j) => matchScore(j, skills) > 0).slice(0, 3) : [], [skills]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-sm text-muted-foreground">Job portal</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">Find your next opportunity.</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {([["all", "All opportunities"], ["Internship", "Internships"], ["Full-time", "Full-time roles"]] as const).map(([v, l]) => (
          <button key={v} onClick={() => setTab(v)} className={cn("rounded-full border px-4 py-1.5 text-sm transition-colors", tab === v ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-secondary")}>{l}</button>
        ))}
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="mr-auto text-sm font-semibold">{list.length} open role{list.length === 1 ? "" : "s"}</p>
            <Filter value={domain} onChange={setDomain} any="Any domain" options={DOMAINS} />
            <Filter value={mode} onChange={setMode} any="Any work mode" options={["Remote", "Hybrid", "On-site"]} />
            <Filter value={type} onChange={setType} any="Any type" options={["Internship", "Full-time", "Part-time"]} />
            <Select value={sort} onValueChange={(v) => setSort(v as "newest" | "match")}>
              <SelectTrigger className="h-9 w-[130px] bg-card"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="newest">Newest</SelectItem><SelectItem value="match">Best match</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Chip on={savedOnly} onClick={() => setSavedOnly(!savedOnly)}>Saved jobs</Chip>
            <Chip on={closing} onClick={() => setClosing(!closing)}>Closing within 7 days</Chip>
          </div>

          <div className="mt-6 space-y-3">
            {list.length === 0 && <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">No roles match these filters.{savedOnly && !user ? " Log in to see saved jobs." : ""}</p>}
            {list.map((j) => <JobCard key={j.slug} job={j} skills={skills} />)}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="flex items-center gap-2 font-semibold"><Sparkles className="size-4 text-primary" /> Your AI shortlist</h2>
            <p className="mt-1 text-xs text-muted-foreground">A few great opportunities, picked around your skills and ambitions.</p>
            {shortlist.length === 0 ? (
              user ? <p className="mt-4 text-sm text-muted-foreground">Add your skills below to get recommendations.</p>
                : <Button variant="outline" size="sm" className="mt-4" asChild><Link to="/auth" search={{ mode: "login" }}>Sign in for recommendations</Link></Button>
            ) : (
              <ul className="mt-4 space-y-2">
                {shortlist.map((j) => (
                  <li key={j.slug}><Link to="/jobs/$slug" params={{ slug: j.slug }} className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2 text-sm hover:bg-success"><span className="truncate">{j.title}</span><span className="font-semibold text-primary">{matchScore(j, skills)}%</span></Link></li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold">Your skills</h2>
            <p className="mb-3 mt-1 text-xs text-muted-foreground">Add them to see how well you match each role.</p>
            <SkillsEditor skills={skills} onChange={setSkills} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function Filter({ value, onChange, any, options }: { value: string; onChange: (v: string) => void; any: string; options: readonly string[] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-[150px] bg-card"><SelectValue /></SelectTrigger>
      <SelectContent><SelectItem value="any">{any}</SelectItem>{options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
    </Select>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className={cn("rounded-full border px-3 py-1 text-xs font-medium transition-colors", on ? "border-primary bg-success text-success-foreground" : "border-border bg-card text-muted-foreground hover:bg-secondary")}>{children}</button>;
}

function JobCard({ job, skills }: { job: Job; skills: string[] }) {
  const score = matchScore(job, skills);
  const left = daysLeft(job);
  return (
    <div className="flex gap-4 rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-soft">
      <CompanyBadge job={job} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold"><Link to="/jobs/$slug" params={{ slug: job.slug }} className="hover:text-primary">{job.title}</Link></h3>
            <p className="text-sm text-muted-foreground">{job.company}</p>
          </div>
          <div className="flex items-center gap-2">
            {skills.length > 0 && <span className={cn("rounded-md px-2 py-1 text-xs font-semibold", score >= 67 ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground")}>{score}% match</span>}
            <SaveButton job={job} />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin className="size-3.5" />{job.city}</span>
          <span className="flex items-center gap-1"><Wallet className="size-3.5" />{job.pay}</span>
          <span className={cn("flex items-center gap-1", left <= 7 && "font-semibold text-warm-foreground")}><CalendarClock className="size-3.5" />Apply by {formatDeadline(job)}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <TypePill type={job.type} />
          <span className="rounded-md bg-muted px-2 py-1 text-xs">{job.mode}</span>
          {job.skills.map((s) => <span key={s} className={cn("rounded-md border px-2 py-1 text-xs", skills.some((m) => m.toLowerCase() === s.toLowerCase()) ? "border-primary text-primary" : "border-border")}>{s}</span>)}
        </div>
      </div>
    </div>
  );
}
