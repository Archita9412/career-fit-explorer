import { Link } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useSavedJobs, useToggleSave } from "@/hooks/useStudent";
import { toast } from "sonner";
import type { Job } from "@/lib/jobs";
import { cn } from "@/lib/utils";

export function CompanyBadge({ job, className }: { job: Job; className?: string }) {
  return (
    <span className={cn("grid size-11 shrink-0 place-items-center rounded-lg bg-secondary text-base font-bold text-secondary-foreground", className)}>
      {job.company[0]}
    </span>
  );
}

export function TypePill({ type }: { type: Job["type"] }) {
  const tone = type === "Internship" ? "bg-success text-success-foreground" : type === "Full-time" ? "bg-secondary text-secondary-foreground" : "bg-warm text-warm-foreground";
  return <span className={cn("rounded-md px-2 py-1 text-xs font-medium", tone)}>{type}</span>;
}

export function SaveButton({ job }: { job: Job }) {
  const { user } = useAuth();
  const { data: saved = [] } = useSavedJobs();
  const toggle = useToggleSave();
  const isSaved = saved.includes(job.slug);
  return (
    <Button
      variant="outline" size="icon" aria-label={isSaved ? "Remove from saved" : "Save job"}
      disabled={toggle.isPending}
      onClick={(e) => {
        e.preventDefault();
        if (!user) { toast("Log in to save jobs", { action: { label: "Log in", onClick: () => (window.location.href = "/auth") } }); return; }
        toggle.mutate({ slug: job.slug, saved: isSaved });
      }}
    >
      {isSaved ? <BookmarkCheck className="text-primary" /> : <Bookmark />}
    </Button>
  );
}

export function JobRow({ job }: { job: Job }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-transparent py-3 transition-colors hover:border-border hover:bg-card">
      <Link to="/jobs/$slug" params={{ slug: job.slug }} className="flex min-w-0 flex-1 items-center gap-4 px-1">
        <CompanyBadge job={job} />
        <div className="min-w-0">
          <p className="truncate font-semibold">{job.title}</p>
          <p className="truncate text-sm text-muted-foreground">{job.company} · {job.mode} · {job.pay}</p>
        </div>
      </Link>
      <TypePill type={job.type} />
      <SaveButton job={job} />
    </div>
  );
}
