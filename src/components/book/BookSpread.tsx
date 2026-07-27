import { ChevronLeft, ChevronRight, Sparkles, Calendar, MapPin, Share2, Plus, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Moment } from "@/types";
import { cn } from "@/lib/utils";

type Props = {
  pages: Moment[];
  currentIndex: number;
  onNavigate: (index: number) => void;
  onNewPage: () => void;
};

export function BookSpread({ pages, currentIndex, onNavigate, onNewPage }: Props) {
  const totalPages = pages.length;
  const currentPage = pages[currentIndex] || null;

  if (totalPages === 0) {
    return (
      <div className="surface-paper rounded-3xl p-12 text-center max-w-2xl mx-auto border border-border shadow-book my-8 space-y-6 animate-fade">
        <div className="size-16 rounded-full bg-gold-soft text-gold mx-auto flex items-center justify-center">
          <Sparkles className="size-8 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-3xl font-bold text-obsidian">
            O Livro Está Pronto Para Ser Escrito
          </h2>
          <p className="font-serif text-base text-muted-foreground leading-relaxed">
            As páginas brancas aguardam pela primeira memória. Conte o que aconteceu e deixe a Editora IA diagramar um capítulo inesquecível do legado do seu filho.
          </p>
        </div>
        <Button
          onClick={onNewPage}
          className="h-12 px-8 rounded-full bg-obsidian text-paper font-sans text-sm font-semibold hover:bg-gold hover:text-obsidian transition-all duration-300 shadow-sm"
        >
          <Plus className="size-4 mr-2 text-gold" />
          Escrever a Primeira Página com IA
        </Button>
      </div>
    );
  }

  // Se houver páginas, formatamos o spread
  return (
    <div className="max-w-5xl mx-auto py-6 px-2 sm:px-6">
      {/* Barra superior do Livro Aberto */}
      <div className="flex items-center justify-between mb-6 px-4">
        <div className="flex items-center gap-2">
          <span className="font-sans text-xs uppercase tracking-widest text-muted-foreground font-semibold">
            Página {currentIndex + 1} de {totalPages}
          </span>
          <span className="text-gold">•</span>
          <span className="font-display italic text-sm text-foreground/80">
            {currentPage?.chapter_slug ? `Capítulo: ${currentPage.chapter_slug.replace/-/g, " "}` : "Memória Eterna"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentIndex <= 0}
            onClick={() => onNavigate(currentIndex - 1)}
            className="rounded-full h-8 px-3 text-xs"
          >
            <ChevronLeft className="size-3.5 mr-1" />
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={currentIndex >= totalPages - 1}
            onClick={() => onNavigate(currentIndex + 1)}
            className="rounded-full h-8 px-3 text-xs"
          >
            Próxima
            <ChevronRight className="size-3.5 ml-1" />
          </Button>
        </div>
      </div>

      {/* Livro Aberto (Spread Editorial de 2 Páginas em Desktop, 1 em Mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 rounded-3xl overflow-hidden border border-border/80 shadow-book bg-paper relative min-h-[580px]">
        {/* Marcador Central / Lombada do Livro */}
        <div className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-12 bg-gradient-to-r from-black/5 via-black/10 to-transparent pointer-events-none z-20 border-x border-border/40" />

        {/* PÁGINA ESQUERDA: Retrato Visual & Mídia */}
        <div className="p-8 sm:p-12 border-b md:border-b-0 md:border-r border-border/60 flex flex-col justify-between bg-[linear-gradient(to_right,#FFFFFF,#FAF9F6)] relative group">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-sans text-muted-foreground">
              <span className="uppercase tracking-widest font-medium">Registro Fotográfico</span>
              <Bookmark className="size-4 text-gold stroke-[1.5]" />
            </div>

            {currentPage?.cover_url ? (
              <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-border/80 shadow-md bg-background relative group">
                <img
                  src={currentPage.cover_url}
                  alt={currentPage.title}
                  className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {currentPage.feeling && (
                  <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-obsidian/80 backdrop-blur-md text-paper text-[11px] font-sans font-medium tracking-wide">
                    ✨ {currentPage.feeling}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-[4/5] rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground p-6 text-center bg-secondary/20">
                <Sparkles className="size-8 text-gold/60 mb-2" />
                <span className="font-display italic text-lg text-foreground/70">Página de Prosa</span>
                <span className="text-xs font-sans mt-1">Este capítulo foi registrado com palavras puras</span>
              </div>
            )}
          </div>

          <div className="pt-6 mt-4 border-t border-border/40 flex items-center justify-between text-[11px] font-sans text-muted-foreground">
            <span>Vol. I — Arquivo Familiar</span>
            <span className="font-serif italic text-xs text-foreground/60">Pág. {currentIndex * 2 + 1}</span>
          </div>
        </div>

        {/* PÁGINA DIREITA: Prosa Literária & Narrativa da Editora */}
        <div className="p-8 sm:p-12 flex flex-col justify-between bg-[linear-gradient(to_right,#FAF9F6,#FFFFFF)] relative">
          <div className="space-y-6">
            {/* Meta & Data */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-sans text-muted-foreground border-b border-border/40 pb-4">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <Calendar className="size-3.5 text-gold" />
                {new Date(currentPage?.happened_on + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
              </span>
              {currentPage?.place && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="size-3.5 text-gold" />
                  {currentPage.place}
                </span>
              )}
            </div>

            {/* Título Literário do Capítulo */}
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-obsidian tracking-tight leading-snug">
              {currentPage?.title}
            </h1>

            {/* Texto / Prosa Literária */}
            <div className="font-serif text-base sm:text-lg text-foreground/90 leading-relaxed whitespace-pre-line pr-2 selection:bg-gold/20">
              {currentPage?.story_text || currentPage?.raw_text || "Sem texto narrativo registrado."}
            </div>

            {/* Tags e Palavras-chave */}
            {currentPage?.tags && currentPage.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-4">
                {currentPage.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-sans px-2.5 py-1 rounded-md bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Rodapé da Página Direita */}
          <div className="pt-6 mt-8 border-t border-border/40 flex items-center justify-between text-[11px] font-sans text-muted-foreground">
            <span className="font-serif italic text-xs text-foreground/60">Pág. {currentIndex * 2 + 2}</span>
            <button
              onClick={onNewPage}
              className="inline-flex items-center gap-1.5 text-gold hover:underline font-semibold"
            >
              <Plus className="size-3" />
              Escrever Próxima Página
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
