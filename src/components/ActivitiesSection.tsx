import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink } from "lucide-react";
import { useActiveAtividades, getYouTubeId, isExternalSocial } from "@/hooks/useAtividades";

interface Props {
  onGoToShop: () => void;
}

export const ActivitiesSection = ({ onGoToShop }: Props) => {
  const { atividades, loading } = useActiveAtividades();

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

      {loading ? (
        <div className="py-10 text-center text-muted-foreground">Carregando atividades...</div>
      ) : atividades.length === 0 ? (
        <div className="py-10 text-center text-muted-foreground">Nenhuma atividade publicada ainda.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {atividades.map((a) => {
            const ytId = getYouTubeId(a.video_url);
            const actionLink = ytId
              ? `https://www.youtube.com/watch?v=${ytId}`
              : a.video_url && isExternalSocial(a.video_url)
              ? a.video_url
              : a.video_url || null;
            return (
              <Card
                key={a.id}
                className="flex flex-col overflow-hidden bg-card-gradient border-border/60 shadow-card-soft rounded-2xl transition-smooth hover:shadow-soft"
              >
                <div className="relative w-full overflow-hidden bg-muted h-[220px] md:h-[260px]">
                  {ytId ? (
                    <iframe
                      loading="lazy"
                      src={`https://www.youtube.com/embed/${ytId}`}
                      title={a.titulo}
                      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 h-full w-full border-0"
                    />
                  ) : a.imagem_url ? (
                    <img
                      src={a.imagem_url}
                      alt={a.titulo}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col p-6 gap-3">
                  <h3 className="font-display text-lg text-foreground line-clamp-2">{a.titulo}</h3>
                  {a.texto_curto && (
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {a.texto_curto}
                    </p>
                  )}
                  {actionLink && (
                    <div className="mt-auto pt-4">
                      <Button
                        asChild
                        size="sm"
                        variant="secondary"
                        className="rounded-full bg-accent text-accent-foreground hover:bg-accent/80 px-5"
                      >
                        <a href={actionLink} target="_blank" rel="noopener noreferrer">
                          Ver atividade
                          <ExternalLink className="ml-1 h-3.5 w-3.5" />
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

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
          className="mt-6 mx-auto flex w-full max-w-[320px] items-center justify-center rounded-full bg-primary px-5 text-center text-sm leading-tight text-primary-foreground hover:bg-primary/90 sm:w-auto sm:max-w-none sm:text-base"
        >
          <span className="whitespace-normal">
          Ver materiais prontos para imprimir
          </span>
          <ArrowRight className="ml-2 h-4 w-4 shrink-0" />
       </Button> 
        
      </div>
    </section>
  );
};
