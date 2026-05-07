DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_status') THEN
    CREATE TYPE public.approval_status AS ENUM ('pending', 'approved', 'rejected');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  status public.approval_status NOT NULL DEFAULT 'pending',
  requested_role public.app_role NOT NULL DEFAULT 'user',
  approved_role public.app_role,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_admin_users_updated_at ON public.admin_users;
CREATE TRIGGER update_admin_users_updated_at
BEFORE UPDATE ON public.admin_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.current_user_email()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((auth.jwt() ->> 'email'), '')
$$;

CREATE OR REPLACE FUNCTION public.ensure_admin_access()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_email TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  current_email := lower(public.current_user_email());

  INSERT INTO public.admin_users (user_id, email, status, requested_role, approved_role)
  VALUES (
    auth.uid(),
    current_email,
    CASE WHEN current_email = 'irsf84@gmail.com' THEN 'approved'::public.approval_status ELSE 'pending'::public.approval_status END,
    CASE WHEN current_email = 'irsf84@gmail.com' THEN 'admin'::public.app_role ELSE 'user'::public.app_role END,
    CASE WHEN current_email = 'irsf84@gmail.com' THEN 'admin'::public.app_role ELSE NULL END
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    status = CASE WHEN EXCLUDED.email = 'irsf84@gmail.com' THEN 'approved'::public.approval_status ELSE public.admin_users.status END,
    requested_role = CASE WHEN EXCLUDED.email = 'irsf84@gmail.com' THEN 'admin'::public.app_role ELSE public.admin_users.requested_role END,
    approved_role = CASE WHEN EXCLUDED.email = 'irsf84@gmail.com' THEN 'admin'::public.app_role ELSE public.admin_users.approved_role END,
    updated_at = now();

  IF current_email = 'irsf84@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (auth.uid(), 'admin'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    RETURN TRUE;
  END IF;

  RETURN public.has_role(auth.uid(), 'admin'::public.app_role);
END;
$$;

CREATE OR REPLACE FUNCTION public.approve_admin_user(_user_id UUID, _role public.app_role)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  UPDATE public.admin_users
  SET status = 'approved'::public.approval_status,
      approved_role = _role,
      updated_at = now()
  WHERE user_id = _user_id;

  DELETE FROM public.user_roles WHERE user_id = _user_id;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_admin_user(_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  UPDATE public.admin_users
  SET status = 'rejected'::public.approval_status,
      approved_role = NULL,
      updated_at = now()
  WHERE user_id = _user_id;

  DELETE FROM public.user_roles WHERE user_id = _user_id;
END;
$$;

DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin_users;
CREATE POLICY "Admins can view admin users"
ON public.admin_users
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Users can view own admin request" ON public.admin_users;
CREATE POLICY "Users can view own admin request"
ON public.admin_users
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own admin request" ON public.admin_users;
CREATE POLICY "Users can create own admin request"
ON public.admin_users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND email = lower(public.current_user_email()));

DROP POLICY IF EXISTS "Admins can update admin users" ON public.admin_users;
CREATE POLICY "Admins can update admin users"
ON public.admin_users
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));