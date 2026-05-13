import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SiteHeaderProps {
  search: string;
  onSearchChange: (v: string) => void;
}

export const SiteHeader = ({ search, onSearchChange }: SiteHeaderProps) => {
  return (
    <header className="relative overflow-hidden">
      <div className="absolute inset-0 bg-watercolor opacity-70" aria-hidden />
      <div className="relative container mx-auto px-4 py-12 md:py-16 text-center">
        <h1 className="text-4xl text-foreground tracking-tight font-serif md:text-5xl">
          Raffafe<span className="text-primary">.arte</span>
        </h1>
        <p className="mt-3 text-base md:text-lg text-muted-foreground font-body">
          Arte e Educação Criativa
        </p>
       <p className="mt-2 max-w-xl mx-auto text-sm md:text-base text-foreground/70">
          Atividades artísticas e materiais prontos para imprimir para professoras da educação infantil e primeiro ciclo.
       </p>

        <div className="relative mt-8 max-w-md mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar materiais, temas, datas..."
            className="pl-11 h-12 rounded-full bg-card/80 backdrop-blur border-border shadow-card-soft"
            aria-label="Buscar materiais"
          />
        </div>
      </div>
    </header>
  );
};
