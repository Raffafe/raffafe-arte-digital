import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { ProductSection } from "@/components/ProductSection";
import { ProductFilters } from "@/components/ProductFilters";
import { ActivitiesSection } from "@/components/ActivitiesSection";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MONTHS, type Category } from "@/data/products";
import { useActiveProducts } from "@/hooks/useProducts";

interface IndexProps {
  initialTab?: "loja" | "atividades";
}

  const Index = ({ initialTab = "loja" }: IndexProps) => {
  const { products } = useActiveProducts();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const [month, setMonth] = useState<number | "all">("all");
  const [tab, setTab] = useState<"loja" | "atividades">(initialTab);

  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  const nextMonth = (currentMonth % 12) + 1;

  const normalizedSearch = search.trim().toLowerCase();

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (month !== "all" && p.month !== month) return false;
      if (normalizedSearch) {
        const hay = `${p.title} ${p.theme} ${p.category} ${p.audience}`.toLowerCase();
        if (!hay.includes(normalizedSearch)) return false;
      }
      return true;
    });
  }, [products, category, month, normalizedSearch]);

  const hasActiveFilter = category !== "all" || month !== "all" || normalizedSearch.length > 0;

  const currentMonthProducts = filtered.filter((p) => p.month === currentMonth);
  const nextMonthProducts = filtered.filter((p) => p.month === nextMonth);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader search={search} onSearchChange={setSearch} />

      <main className="container mx-auto px-4 pb-16 flex-1">
        <Tabs value={tab} onValueChange={setTab} className="mt-2">
          <TabsList className="mx-auto flex w-fit rounded-full bg-card/70 backdrop-blur border border-border/60 p-1 shadow-card-soft">
            <TabsTrigger value="loja" className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Loja
            </TabsTrigger>
            <TabsTrigger value="atividades" className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Atividades
            </TabsTrigger>
          </TabsList>

          <TabsContent value="loja" className="mt-8 space-y-2">
            <ProductFilters
              category={category}
              month={month}
              onCategoryChange={setCategory}
              onMonthChange={setMonth}
              onClear={() => {
                setCategory("all");
                setMonth("all");
              }}
            />

            {hasActiveFilter ? (
              <ProductSection
                subtitle="Resultados"
                title={`${filtered.length} ${filtered.length === 1 ? "material encontrado" : "materiais encontrados"}`}
                products={filtered}
              />
            ) : (
              <>
                <ProductSection
                  subtitle={`${MONTHS[currentMonth - 1]} • agora`}
                  title="Materiais do mês"
                  products={currentMonthProducts}
                />
                <ProductSection
                  subtitle={`${MONTHS[nextMonth - 1]} • em breve`}
                  title="Prepare-se para o próximo mês"
                  products={nextMonthProducts}
                />
              </>
            )}
          </TabsContent>

         <TabsContent value="atividades" className="mt-8">
         <ActivitiesSection
         onGoToShop={() => {
         window.location.href = "/loja";
         setTimeout(() => {
         window.scrollTo({ top: 0, behavior: "smooth" });
         }, 100);
         }}
         />
         </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-border/60 bg-card/40 backdrop-blur">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          Feito com carinho • Raffafe.arte © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default Index;
