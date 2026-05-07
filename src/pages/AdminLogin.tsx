import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff } from "lucide-react";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user && isAdmin) navigate("/admin", { replace: true });
  }, [user, isAdmin, loading, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setErrorMessage("");
    setSubmitting(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setMessage("Enviamos um link de recuperação para o seu e-mail.");
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        setMessage("Conta criada. Se este não for o e-mail principal, seu cadastro ficará pendente de aprovação.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bem-vinda!");
        navigate("/admin");
      }
    } catch (err: any) {
      const friendly =
        mode === "signin"
          ? "Não foi possível entrar. Confira seu e-mail e senha ou recupere sua senha."
          : err.message ?? "Não foi possível concluir a solicitação.";
      setErrorMessage(friendly);
      toast.error(friendly);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <Card className="w-full max-w-md p-8 rounded-2xl shadow-card-soft">
        <h1 className="font-display text-3xl text-foreground mb-1">Painel Raffafe.arte</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {mode === "signin"
            ? "Entre para gerenciar os produtos."
            : mode === "signup"
              ? "Crie sua conta de acesso."
              : "Informe seu e-mail para recuperar a senha."}
        </p>
        {message && <div className="mb-4 rounded-xl bg-secondary px-4 py-3 text-sm text-secondary-foreground">{message}</div>}
        {errorMessage && <div className="mb-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{errorMessage}</div>}
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {mode !== "forgot" && (
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute inset-y-0 right-3 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}
          <Button type="submit" className="w-full rounded-full" disabled={submitting}>
            {submitting ? "Aguarde..." : mode === "signin" ? "Entrar" : mode === "signup" ? "Criar conta" : "Enviar recuperação"}
          </Button>
        </form>
        <div className="mt-4 flex flex-col gap-2 text-center text-sm">
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="text-primary hover:underline"
          >
            {mode === "signin" ? "Criar uma conta" : "Já tenho conta"}
          </button>
          {mode !== "forgot" && (
            <button type="button" onClick={() => setMode("forgot")} className="text-muted-foreground hover:text-primary">
              Esqueci minha senha
            </button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AdminLogin;
