import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LogOut, Menu, Sprout, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const NAV = [
  { to: "/profile", label: "Student profile" },
  { to: "/jobs", label: "Job portal" },
  { to: "/resume-analyzer", label: "Resume analyzer" },
  { to: "/assistant", label: "Career assistant" },
  { to: "/interview-assistant", label: "Interview assistant" },
] as const;

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="relative grid size-9 place-items-center rounded-full bg-primary text-primary-foreground">
        <Sprout className="size-4" />
        <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-accent ring-2 ring-background" />
      </span>
      <span className="text-base font-bold tracking-tight">NICO</span>
    </Link>
  );
}

export function SiteHeader() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const signOut = async () => { await supabase.auth.signOut(); navigate({ to: "/" }); };
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Logo />
        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="text-sm text-muted-foreground transition-colors hover:text-foreground" activeProps={{ className: "text-sm font-semibold text-primary" }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <>
              <span className="max-w-40 truncate text-sm text-muted-foreground">{user.email}</span>
              <Button variant="ghost" size="sm" onClick={signOut}><LogOut /> Log out</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild><Link to="/auth" search={{ mode: "login" }}>Log in</Link></Button>
              <Button className="rounded-full" asChild><Link to="/auth" search={{ mode: "signup" }}>Get started</Link></Button>
            </>
          )}
        </div>
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X /> : <Menu />}</Button>
      </div>
      {open && (
        <div className="border-t border-border px-4 py-3 lg:hidden">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="block py-2 text-sm">{n.label}</Link>
          ))}
          {user ? (
            <button onClick={signOut} className="block py-2 text-sm text-muted-foreground">Log out</button>
          ) : (
            <Link to="/auth" search={{ mode: "login" }} onClick={() => setOpen(false)} className="block py-2 text-sm font-semibold text-primary">Log in / Get started</Link>
          )}
        </div>
      )}
    </header>
  );
}
