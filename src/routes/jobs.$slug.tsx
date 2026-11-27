import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, CalendarClock, CheckCircle2, MapPin, Wallet } from "lucide-react";
import { daysLeft, formatDeadline, getJob, matchScore } from "@/lib/jobs";
import { CompanyBadge, SaveButton, TypePill } from "@/components/JobBits";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useApplications, useApply } from "@/hooks/useStudent";
import { useMySkills } from "@/hooks/useMySkills";

export const Route = createFileRoute("/jobs/$slug")({
  loader: ({ params }) => {
    const job = getJob(params.slug);
    if (!job) throw notFound();
    return { job };
  },
  head: ({ loaderData }) => {
    const j = loaderData?.job;
    const title = j ? `${j.title} at ${j.company} — NICO` : "Job unavailable — NICO";
    const desc = j ? `${j.type} · ${j.mode} · ${j.city} · ${j.pay}. ${j.about}` : "This job is no longer available.";
    return { meta: [
      { title }, { name: "description", content: desc },
      { property: "og:title", content: title }, { property: "og:description", content: desc },
      { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary" },
      ...(j ? [] : [{ name: "robots", content: "noindex" }]),
    ] };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-16"><h1 className="text-2xl font-bold">This job isn't available</h1><Link to="/jobs" className="mt-4 inline-block text-primary">Back to all jobs</Link></div>
  ),
  component: JobDetail,
});

function JobDetail() {
  const { job } = Route.useLoaderData();
  const { user } = useAuth();
  const { data: apps = [] } = useApplications();
  const apply = useApply();
  const [skills] = useMySkills();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const applied = apps.find((a) => a.job_slug === job.slug);
  const left = daysLeft(job);
  const closed = left <= 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link to="/jobs" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> All jobs</Link>
      <div className="mt-6 flex flex-wrap items-start gap-4">
        <CompanyBadge job={job} className="size-14 text-xl" />
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
          <p className="text-muted-foreground">{job.company}</p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="size-4" />{job.city} · {job.mode}</span>
            <span className="flex items-center gap-1"><Wallet className="size-4" />{job.pay}</span>
            <span className="flex items-center gap-1"><CalendarClock className="size-4" />Apply by {formatDeadline(job)}{!closed && ` · ${left} day${left === 1 ? "" : "s"} left`}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SaveButton job={job} />
          {applied ? (
            <Button variant="secondary" disabled><CheckCircle2 /> Applied</Button>
          ) : user ? (
            <Button disabled={closed} onClick={() => setOpen(true)}>{closed ? "Closed" : "Apply now"}</Button>
          ) : (
            <Button asChild><Link to="/auth" search={{ mode: "login" }}>Log in to apply</Link></Button>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <TypePill type={job.type} />
        {job.skills.map((s) => <span key={s} className="rounded-md border border-border px-2 py-1 text-xs">{s}</span>)}
        {skills.length > 0 && <span className="rounded-md bg-success px-2 py-1 text-xs font-semibold text-success-foreground">{matchScore(job, skills)}% skill match</span>}
      </div>

      <div className="mt-8 space-y-8 rounded-xl border border-border bg-card p-6">
        <Block title="About the role"><p className="text-sm leading-relaxed">{job.about}</p></Block>
        <Block title="What you'll do"><List items={job.responsibilities} /></Block>
        <Block title="What we're looking for"><List items={job.requirements} /></Block>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply to {job.company}</DialogTitle>
            <DialogDescription>Your NICO profile is shared with this application. Add a short note to stand out.</DialogDescription>
          </DialogHeader>
          <Textarea rows={5} placeholder="Why you're excited about this role…" value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button disabled={apply.isPending} onClick={async () => { await apply.mutateAsync({ slug: job.slug, cover_note: note }); setOpen(false); }}>{apply.isPending ? "Sending…" : "Send application"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const Block = ({ title, children }: { title: string; children: React.ReactNode }) => <section><h2 className="mb-2 font-semibold">{title}</h2>{children}</section>;
const List = ({ items }: { items: string[] }) => <ul className="list-disc space-y-1 pl-5 text-sm">{items.map((i) => <li key={i}>{i}</li>)}</ul>;
