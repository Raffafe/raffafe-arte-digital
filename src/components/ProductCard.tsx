import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/data/products";

export const ProductCard = ({ product }: { product: Product }) => {
  const price = product.price.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <Card className="group overflow-hidden bg-card-gradient border-border/60 shadow-card-soft hover:shadow-soft transition-smooth hover:-translate-y-1 rounded-2xl">
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-smooth group-hover:scale-105"
        />
      </div>
      <div className="p-4 space-y-3">
        <Badge variant="secondary" className="bg-accent/60 text-accent-foreground font-normal">
          {product.category}
        </Badge>
        <h3 className="font-display text-lg leading-snug text-foreground line-clamp-2">
          {product.title}
        </h3>
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="font-display text-xl text-primary">{price}</span>
          <Button
            asChild
            size="sm"
            className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <a href={product.hotmartUrl} aria-label={`Ver material ${product.title}`}>
              Adquirir material
            </a>
          </Button>
        </div>
      </div>
    </Card>
  );
};
