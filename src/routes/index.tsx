import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bell, Bookmark, Briefcase, ChevronRight, FileSearch, GraduationCap, MessagesSquare, Mic, Sparkles, TrendingUp, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import heroImg from "@/assets/campus-careers.png";
import { JOBS, daysLeft, formatDeadline, getJob } from "@/lib/jobs";
import { JobRow } from "@/components/JobBits";
import { useApplications, useProfile, useSavedJobs, profileCompletion } from "@/hooks/useStudent";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NICO career hub — Your future, a little closer" },
      { name: "description", content: "Find internships and graduate jobs, refine your resume and practise interviews with NICO AI." },
      { property: "og:title", content: "NICO career hub — Your future, a little closer" },
      { property: "og:description", content: "Find internships and graduate jobs, refine your resume and practise interviews with NICO AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const pad = (n: number) => String(n).padStart(2, "0");

function Index() {
  const { user } = useAuth();
  const { data: saved = [] } = useSavedJobs();
  const { data: apps = [] } = useApplications();
  const { data: profile } = useProfile();
  const completion = user ? profileCompletion(profile) : 0;
  const reminders = saved
    .map((s) => getJob(s))
    .filter((j): j is NonNullable<typeof j> => !!j && daysLeft(j) > 0 && daysLeft(j) <= 14)
    .sort((a, b) => daysLeft(a) - daysLeft(b));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm text-muted-foreground"><span className="size-2 rounded-full bg-primary" /> A little progress, every day</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">NICO career hub</h1>
        </div>
        <Button variant="outline" asChild><Link to="/profile"><GraduationCap /> My student profile</Link></Button>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_280px]">
        <div className="min-w-0">
          <section className="relative overflow-hidden rounded-xl">
            <img src={heroImg} alt="University students planning their careers together on campus" className="absolute inset-0 size-full object-cover" />
            <div className="absolute inset-0 bg-hero-overlay" />
            <div className="relative px-8 py-10 text-primary-foreground md:py-12">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide"><Sparkles className="size-4" /> Big ambitions. Real possibilities.</p>
              <h2 className="mt-5 text-4xl font-bold leading-tight md:text-5xl">Your future.<br />A little closer.</h2>
              <p className="mt-5 max-w-sm text-sm opacity-90">From your first project to your first offer.<br />Find the opportunity that feels like you.</p>
              <Button variant="lime" className="mt-6" asChild><Link to="/jobs">Explore opportunities <ArrowRight /></Link></Button>
            </div>
          </section>

          <div className="mt-6 grid grid-cols-3 divide-x divide-border border-y border-border py-5">
            <Stat icon={<Briefcase />} value={String(JOBS.length)} label="Open opportunities" />
            <Stat icon={<Bookmark />} value={pad(saved.length)} label="Saved jobs" />
            <Stat icon={<TrendingUp />} value={pad(apps.length)} label="Applications" />
          </div>

          <section className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your next move</h2>
              <span className="text-xs text-muted-foreground">Powered by NICO AI</span>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <MoveCard to="/resume-analyzer" icon={<FileSearch />} tone="bg-success text-success-foreground" title="Resume, refined." sub="AI resume analyzer" />
              <MoveCard to="/assistant" icon={<MessagesSquare />} tone="bg-warm text-warm-foreground" title="Find your direction." sub="Career assistant" />
              <MoveCard to="/interview-assistant" icon={<Mic />} tone="bg-success text-success-foreground" title="Walk in confident." sub="Interview assistant" />
            </div>
          </section>

          <section className="mt-10 border-t border-border pt-8">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-xl font-semibold">Fresh opportunities</h2>
                <p className="text-sm text-muted-foreground">Good things start with a first step.</p>
              </div>
              <Link to="/jobs" className="flex items-center gap-1 text-sm font-medium text-primary">View all jobs <ArrowRight className="size-4" /></Link>
            </div>
            <div className="mt-4">{JOBS.slice(0, 3).map((j) => <JobRow key={j.slug} job={j} />)}</div>
          </section>
        </div>

        <aside className="space-y-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-full bg-success text-success-foreground"><User /></span>
              <div>
                <p className="font-semibold">{profile?.full_name ? `Hi, ${profile.full_name.split(" ")[0]}` : "Your student profile"}</p>
                <p className="text-xs text-muted-foreground">A strong start to your next chapter</p>
              </div>
            </div>
            <div className="mt-5 flex justify-between text-xs"><span>Profile completion</span><span className="font-semibold text-primary">{completion}%</span></div>
            <Progress value={completion} className="mt-2 h-1.5" />
            <Button variant="outline" className="mt-5 w-full justify-between" asChild>
              <Link to="/profile"><span className="flex items-center gap-2"><GraduationCap /> {completion >= 100 ? "View your profile" : "Build your profile"}</span><ChevronRight /></Link>
            </Button>
          </div>

          <div className="border-t border-border pt-6">
            <p className="flex items-center gap-2 font-semibold"><Bell className="size-4" /> Deadline reminders</p>
            <p className="mt-1 text-xs text-muted-foreground">In-app reminders for your saved opportunities.</p>
            {reminders.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">{user ? "No upcoming deadlines. You're all caught up." : "Log in and save jobs to get deadline reminders."}</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {reminders.map((j) => (
                  <li key={j.slug}>
                    <Link to="/jobs/$slug" params={{ slug: j.slug }} className="block rounded-lg border border-border bg-card p-3 hover:border-primary">
                      <p className="text-sm font-medium">{j.title}</p>
                      <p className="text-xs text-muted-foreground">{j.company} · closes {formatDeadline(j)} · <span className="font-semibold text-warm-foreground">{daysLeft(j)} day{daysLeft(j) === 1 ? "" : "s"} left</span></p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-border pt-6">
            <span className="grid size-10 place-items-center rounded-lg bg-accent text-accent-foreground"><Mic className="size-5" /></span>
            <p className="mt-5 text-xs font-bold uppercase tracking-wide text-primary">A little practice. A lot of confidence.</p>
            <p className="mt-2 text-xl font-semibold">Ready for the real thing?</p>
            <p className="mt-2 text-sm text-muted-foreground">Make your next interview feel less like your first.</p>
            <Button className="mt-5 w-full" asChild><Link to="/interview-assistant">Practice an interview <ArrowRight /></Link></Button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-start gap-3 px-4 first:pl-0 [&_svg]:size-5 [&_svg]:text-primary">
      <span className="mt-1">{icon}</span>
      <div><p className="text-2xl font-bold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>
    </div>
  );
}

function MoveCard({ to, icon, tone, title, sub }: { to: "/resume-analyzer" | "/assistant" | "/interview-assistant"; icon: React.ReactNode; tone: string; title: string; sub: string }) {
  return (
    <Link to={to} className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-soft">
      <span className={`grid size-10 place-items-center rounded-lg [&_svg]:size-5 ${tone}`}>{icon}</span>
      <p className="mt-10 font-semibold">{title}</p>
      <p className="mt-2 flex items-center justify-between text-xs text-muted-foreground">{sub}<ArrowRight className="size-4 text-primary transition-transform group-hover:translate-x-1" /></p>
    </Link>
  );
}
