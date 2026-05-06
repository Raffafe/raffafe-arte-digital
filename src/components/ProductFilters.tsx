import { CATEGORIES, MONTHS, type Category } from "@/data/products";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface Props {
  category: Category | "all";
  month: number | "all";
  onCategoryChange: (v: Category | "all") => void;
  onMonthChange: (v: number | "all") => void;
  onClear: () => void;
}

export const ProductFilters = ({
  category,
  month,
  onCategoryChange,
  onMonthChange,
  onClear,
}: Props) => {
  const hasFilters = category !== "all" || month !== "all";

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-card/70 backdrop-blur border border-border/60 shadow-card-soft">
      <span className="text-sm text-muted-foreground font-medium">Filtrar por:</span>

      <Select value={String(category)} onValueChange={(v) => onCategoryChange(v as Category | "all")}>
        <SelectTrigger className="w-[200px] rounded-full bg-background border-border">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as categorias</SelectItem>
          {CATEGORIES.map((c) => (
            <SelectItem key={c} value={c}>{c}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={String(month)} onValueChange={(v) => onMonthChange(v === "all" ? "all" : Number(v))}>
        <SelectTrigger className="w-[160px] rounded-full bg-background border-border">
          <SelectValue placeholder="Mês" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os meses</SelectItem>
          {MONTHS.map((m, i) => (
            <SelectItem key={m} value={String(i + 1)}>{m}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onClear} className="rounded-full">
          Limpar
        </Button>
      )}
    </div>
  );
};
