import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const MAIN_ADMIN_EMAIL = "irsf84@gmail.com";

export type AccessStatus = "checking" | "admin" | "pending" | "rejected" | "none";

const ensureAccessRecord = async (currentUser: User): Promise<{ isAdmin: boolean; status: AccessStatus }> => {
  const email = currentUser.email?.toLowerCase() ?? "";
  const isMainAdmin = email === MAIN_ADMIN_EMAIL;

  if (isMainAdmin) {
    const { data: existingRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", currentUser.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!existingRole) {
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: currentUser.id, role: "admin" });

      if (roleError && roleError.code !== "23505") throw roleError;
    }
  }

  const { data: request } = await supabase
    .from("admin_users")
    .select("status, approved_role")
    .eq("user_id", currentUser.id)
    .maybeSingle();

  if (!request) {
    const { error } = await supabase.from("admin_users").insert({
      user_id: currentUser.id,
      email,
      status: isMainAdmin ? "approved" : "pending",
      requested_role: isMainAdmin ? "admin" : "user",
      approved_role: isMainAdmin ? "admin" : null,
    });

    if (error && error.code !== "23505") throw error;
  } else if (isMainAdmin && (request.status !== "approved" || request.approved_role !== "admin")) {
    const { error } = await supabase
      .from("admin_users")
      .update({ status: "approved", requested_role: "admin", approved_role: "admin" })
      .eq("user_id", currentUser.id);

    if (error) throw error;
  }

  const { data: adminRole } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", currentUser.id)
    .eq("role", "admin")
    .maybeSingle();

  if (adminRole || isMainAdmin) return { isAdmin: true, status: "admin" };
  if (request?.status === "rejected") return { isAdmin: false, status: "rejected" };
  if (request?.status === "pending" || !request) return { isAdmin: false, status: "pending" };
  return { isAdmin: false, status: "none" };
};

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [accessStatus, setAccessStatus] = useState<AccessStatus>("checking");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncUser = async (s: Session | null) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        try {
          const result = await ensureAccessRecord(s.user);
          setIsAdmin(result.isAdmin);
          setAccessStatus(result.status);
        } catch (error) {
          console.error("Erro ao verificar acesso administrativo", error);
          setIsAdmin(false);
          setAccessStatus("none");
        }
      } else {
        setIsAdmin(false);
        setAccessStatus("none");
      }
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      setTimeout(() => syncUser(s), 0);
    });

    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      await syncUser(s);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, user, isAdmin, accessStatus, loading, refreshAccess: ensureAccessRecord };
};
