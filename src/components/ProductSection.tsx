import { ProductCard } from "./ProductCard";
import type { Product } from "@/data/products";

interface Props {
  title: string;
  subtitle?: string;
  products: Product[];
}

export const ProductSection = ({ title, subtitle, products }: Props) => {
  return (
    <section className="py-10">
      <div className="mb-6">
        {subtitle && (
          <p className="text-xs uppercase tracking-[0.2em] text-primary/80 font-medium">
            {subtitle}
          </p>
        )}
        <h2 className="font-display text-3xl md:text-4xl text-foreground mt-1">
          {title}
        </h2>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl bg-card/60 border border-dashed border-border p-10 text-center text-muted-foreground">
          Em breve, novos materiais por aqui.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
};
