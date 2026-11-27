import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { useProfile, useSaveProfile } from "./useStudent";

const KEY = "nico-skills";

/** Skills from the profile when signed in, otherwise kept in this browser. */
export function useMySkills(): [string[], (s: string[]) => void] {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const save = useSaveProfile();
  const [local, setLocal] = useState<string[]>([]);
  useEffect(() => {
    try { setLocal(JSON.parse(localStorage.getItem(KEY) ?? "[]")); } catch { /* ignore */ }
  }, []);
  if (user) return [profile?.skills ?? [], (s) => save.mutate({ skills: s })];
  return [local, (s) => { setLocal(s); localStorage.setItem(KEY, JSON.stringify(s)); }];
}
