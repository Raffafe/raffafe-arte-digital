import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { ACTIVITIES } from "@/data/products";

interface Props {
  onGoToShop: () => void;
}

export const ActivitiesSection = ({ onGoToShop }: Props) => {
  return (
    <section className="py-10">
      <div className="mb-6 max-w-2xl">
        <p className="text-xs uppercase tracking-[0.2em] text-primary/80 font-medium">
          Inspiração para a sua aula
        </p>
        <h2 className="font-display text-3xl md:text-4xl text-foreground mt-1">
          Atividades
        </h2>
        <p className="mt-2 text-muted-foreground">
          Pequenas ideias em vídeo para inspirar momentos criativos. Para ir além,
          os materiais prontos te ajudam a aplicar com sua turma.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {ACTIVITIES.map((a) => (
          <Card
            key={a.id}
            className="overflow-hidden bg-card-gradient border-border/60 shadow-card-soft rounded-2xl"
          >
            <div className="aspect-video bg-muted">
              <iframe
                loading="lazy"
                src={`https://www.youtube.com/embed/${a.videoId}`}
                title={a.title}
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full border-0"
              />
            </div>
            <div className="p-5 space-y-2">
              <h3 className="font-display text-lg text-foreground">{a.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{a.blurb}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-10 rounded-3xl bg-watercolor p-8 md:p-12 text-center shadow-soft">
        <h3 className="font-display text-2xl md:text-3xl text-foreground">
          Quer aplicar essas ideias com sua turma?
        </h3>
        <p className="mt-2 text-foreground/70 max-w-xl mx-auto">
          Encontre atividades prontas para imprimir, organizadas por mês e por tema.
        </p>
        <Button
          onClick={onGoToShop}
          size="lg"
          className="mt-6 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Ver materiais prontos para imprimir
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </section>
  );
};
