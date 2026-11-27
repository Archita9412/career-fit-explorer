import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Database } from "@/integrations/supabase/types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useSaveProfile() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<Profile>) => {
      const { error } = await supabase.from("profiles").upsert({ ...patch, id: user!.id, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSavedJobs() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["saved", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("saved_jobs").select("job_slug").order("created_at", { ascending: false }).limit(200);
      if (error) throw error;
      return data.map((r) => r.job_slug);
    },
  });
}

export function useToggleSave() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ slug, saved }: { slug: string; saved: boolean }) => {
      if (!user) throw new Error("Log in to save jobs");
      const q = saved
        ? supabase.from("saved_jobs").delete().eq("user_id", user.id).eq("job_slug", slug)
        : supabase.from("saved_jobs").insert({ user_id: user.id, job_slug: slug });
      const { error } = await q;
      if (error) throw error;
      return !saved;
    },
    onSuccess: (nowSaved) => {
      qc.invalidateQueries({ queryKey: ["saved"] });
      toast.success(nowSaved ? "Saved to your list" : "Removed from saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useApplications() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["applications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("applications").select("*").order("created_at", { ascending: false }).limit(200);
      if (error) throw error;
      return data;
    },
  });
}

export function useApply() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ slug, cover_note }: { slug: string; cover_note: string }) => {
      if (!user) throw new Error("Log in to apply");
      const { error } = await supabase.from("applications").insert({ user_id: user.id, job_slug: slug, cover_note });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applications"] });
      toast.success("Application sent! Good luck.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useWithdraw() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("applications").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["applications"] }); toast.success("Application withdrawn"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function profileCompletion(p: Profile | null | undefined): number {
  if (!p) return 0;
  const fields = [p.full_name, p.university, p.degree, p.graduation_year, p.headline, p.bio, p.portfolio_url || p.github_url || p.linkedin_url];
  const filled = fields.filter((f) => f && String(f).trim()).length + (p.skills.length > 0 ? 1 : 0);
  return Math.round((filled / (fields.length + 1)) * 100);
}
