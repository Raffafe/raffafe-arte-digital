import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const ProtectedAdmin = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, accessStatus, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Carregando...
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace />;

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-6 text-center">
        <h1 className="font-display text-2xl">Acesso restrito</h1>
        <p className="text-muted-foreground max-w-md">
          {accessStatus === "rejected"
            ? "Sua solicitação de acesso foi recusada."
            : "Seu cadastro está pendente de aprovação por uma administradora."}
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
