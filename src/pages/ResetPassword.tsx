import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        const errDesc = url.searchParams.get("error_description") || url.hash.match(/error_description=([^&]+)/)?.[1];

        if (errDesc) {
          setError(decodeURIComponent(errDesc).replace(/\+/g, " "));
          return;
        }

        // PKCE flow: exchange ?code= for a session
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            setError("Link de recuperação expirado ou inválido. Solicite um novo.");
            return;
          }
          // Clean the URL
          window.history.replaceState({}, "", window.location.pathname);
        }

        // Implicit flow lands with #access_token=...&type=recovery — Supabase parses it automatically.
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setReady(true);
        } else {
          // Wait briefly for PASSWORD_RECOVERY event from hash parsing
          await new Promise((r) => setTimeout(r, 400));
          const { data: again } = await supabase.auth.getSession();
          if (again.session) setReady(true);
          else setError("Link de recuperação inválido ou expirado. Solicite um novo pela tela de login.");
        }
      } catch (e) {
        setError("Não foi possível validar o link. Solicite um novo pela tela de login.");
      }
    };

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });

    init();
    return () => sub.subscription.unsubscribe();
  }, []);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast.error("As senhas precisam ser iguais.");
      return;
    }

    setSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (updateError) {
      toast.error("Não foi possível alterar a senha. Solicite um novo link.");
      return;
    }

    toast.success("Senha alterada com sucesso.");
    await supabase.auth.signOut();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <Card className="w-full max-w-md p-8 rounded-2xl shadow-card-soft">
        <h1 className="font-display text-3xl text-foreground mb-2">Criar nova senha</h1>
        {error ? (
          <>
            <p className="text-sm text-destructive mb-4">{error}</p>
            <Button onClick={() => navigate("/admin/login")} className="w-full rounded-full">
              Voltar para o login
            </Button>
          </>
        ) : !ready ? (
          <p className="text-sm text-muted-foreground">Validando link de recuperação...</p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nova senha</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </div>
            <Button type="submit" className="w-full rounded-full" disabled={submitting}>
              {submitting ? "Salvando..." : "Salvar nova senha"}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
};

export default ResetPassword;
