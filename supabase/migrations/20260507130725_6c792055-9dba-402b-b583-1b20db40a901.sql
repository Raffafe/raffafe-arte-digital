DROP POLICY IF EXISTS "Users can create own admin request" ON public.admin_users;
CREATE POLICY "Users can create own admin request"
ON public.admin_users
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND lower(email) = lower(COALESCE(auth.jwt() ->> 'email', ''))
  AND (
    (
      lower(email) = 'irsf84@gmail.com'
      AND status = 'approved'::public.approval_status
      AND requested_role = 'admin'::public.app_role
      AND approved_role = 'admin'::public.app_role
    )
    OR
    (
      lower(email) <> 'irsf84@gmail.com'
      AND status = 'pending'::public.approval_status
      AND requested_role = 'user'::public.app_role
      AND approved_role IS NULL
    )
  )
);

DROP POLICY IF EXISTS "Admins can update admin users" ON public.admin_users;
CREATE POLICY "Admins can update admin users"
ON public.admin_users
FOR UPDATE
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Main admin can create own role" ON public.user_roles;
CREATE POLICY "Main admin can create own role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND role = 'admin'::public.app_role
  AND lower(COALESCE(auth.jwt() ->> 'email', '')) = 'irsf84@gmail.com'
);

DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role));