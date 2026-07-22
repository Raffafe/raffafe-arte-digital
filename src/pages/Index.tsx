import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { ProductSection } from "@/components/ProductSection";
import { ProductFilters } from "@/components/ProductFilters";
import { ActivitiesSection } from "@/components/ActivitiesSection";
import { ContactCard } from "@/components/ContactCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MONTHS, CATEGORIES, type Category } from "@/data/products";
import { useActiveProducts } from "@/hooks/useProducts";
import { useParams } from "react-router-dom";

interface IndexProps {
  initialTab?: "loja" | "atividades";
}

const Index = ({ initialTab = "loja" }: IndexProps) => {
  const { products } = useActiveProducts();
  const { categoria } = useParams();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const [month, setMonth] = useState<number | "all">("all");
  const [tab, setTab] = useState<"loja" | "atividades">(initialTab);

    useEffect(() => {
  if (!categoria) return;

  const categoryMap: Record<string, Category> = {
    "volta-as-aulas": "Volta às Aulas",
    "kits-para-sala": "Kits para Sala",
    "leitura-aconchego": "Leitura & Aconchego",
    "yoga-bem-estar": "Yoga & Bem-estar",
    "arte-que-acolhe": "Arte que Acolhe",
    "livros": "Livros",
    "datas-comemorativas": "Datas Comemorativas",
    "conscientizacao-cuidado": "Conscientização & Cuidado",
    "jogos": "Jogos",
  };

  const mappedCategory = categoryMap[categoria];

  if (mappedCategory && CATEGORIES.includes(mappedCategory)) {
    setCategory(mappedCategory);
  }
      const monthMap: Record<string, number> = {
  janeiro: 1,
  fevereiro: 2,
  marco: 3,
  abril: 4,
  maio: 5,
  junho: 6,
  julho: 7,
  agosto: 8,
  setembro: 9,
  outubro: 10,
  novembro: 11,
  dezembro: 12,
};

const mappedMonth = monthMap[categoria];

if (mappedMonth) {
  setMonth(mappedMonth);
} 
      const searchMap: Record<string, string> = {
  "copa-do-mundo": "Copa do Mundo",
  "festa-junina": "Festa Junina",
};

const mappedSearch = searchMap[categoria];

if (mappedSearch) {
  setSearch(mappedSearch);
}
}, [categoria]);

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
  const noMonthProducts = filtered.filter((p) => p.month == null);


  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader search={search} onSearchChange={setSearch} />

      <main className="container mx-auto px-4 pb-16 flex-1">
        <Tabs value={tab} onValueChange={(v) => setTab(v as "loja" | "atividades")} className="mt-2">
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
      
      <ContactCard />
      
      <footer className="border-t border-border/60 bg-card/40 backdrop-blur">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          Feito com carinho • Raffafe.arte © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default Index;
