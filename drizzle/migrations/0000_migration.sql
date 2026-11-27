CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  university text,
  degree text,
  graduation_year text,
  headline text,
  bio text,
  skills text[] NOT NULL DEFAULT '{}',
  portfolio_url text,
  linkedin_url text,
  github_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated USING ((select auth.uid()) = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING ((select auth.uid()) = id);

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name) VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'));
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.saved_jobs (
  user_id uuid NOT NULL,
  job_slug text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, job_slug)
);
GRANT SELECT, INSERT, DELETE ON public.saved_jobs TO authenticated;
GRANT ALL ON public.saved_jobs TO service_role;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own saved select" ON public.saved_jobs FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY "own saved insert" ON public.saved_jobs FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "own saved delete" ON public.saved_jobs FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

CREATE TABLE public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  job_slug text NOT NULL,
  cover_note text,
  status text NOT NULL DEFAULT 'Applied',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, job_slug)
);
GRANT SELECT, INSERT, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own app select" ON public.applications FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY "own app insert" ON public.applications FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "own app delete" ON public.applications FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);