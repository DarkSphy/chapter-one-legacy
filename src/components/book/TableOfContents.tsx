import { Compass, BookOpen, ChevronRight, Sparkles, Plus } from "lucide-react";
import type { Moment } from "@/types";
import { cn } from "@/lib/utils";

type ChapterItem = {
  slug: string;
  title: string;
  subtitle?: string;
};

type Props = {
  chapters: ChapterItem[];
  moments: Moment[];
  onSelectPage: (index: number) => void;
  onNewChapter?: () => void;
};

export function TableOfContents({ chapters, moments, onSelectPage, onNewChapter }: Props) {
  // Agrupar momentos por capítulo
  const grouped = chapters.map((chap) => {
    const chapMoments = moments.filter((m) => m.chapter_slug === chap.slug || m.category === chap.slug);
    return {
      ...chap,
      pages: chapMoments,
    };
  });

  // Identificar momentos sem capítulo definido
  const orphanMoments = moments.filter(
    (m) => !chapters.some((c) => c.slug === m.chapter_slug || c.slug === m.category)
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-10 animate-fade">
      {/* Cabeçalho do Sumário */}
      <div className="text-center space-y-3 border-b border-border/60 pb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-soft text-gold text-xs font-semibold tracking-widest uppercase border border-gold/30">
          <Compass className="size-3.5" />
          Sumário Cronológico
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-obsidian tracking-tight">
          As Épocas de Nossa Vida
        </h1>
        <p className="font-serif italic text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
          Cada fase do crescimento representa um volume eterno da nossa história, escrito a várias mãos com amor e memória.
        </p>
      </div>

      {/* Lista de Capítulos (Estilo editorial com pontos condutores) */}
      <div className="space-y-8">
        {grouped.map((chap, chapIdx) => (
          <div key={chap.slug} className="surface-paper rounded-3xl p-6 sm:p-8 border border-border/80 shadow-sm space-y-5 transition-all duration-300 hover:border-gold/50">
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <div className="flex items-center gap-3">
                <span className="font-display italic text-2xl text-gold font-bold">
                  {String(chapIdx + 1).padStart(2, "0")}.
                </span>
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    {chap.title}
                  </h2>
                  {chap.subtitle && (
                    <p className="font-sans text-xs text-muted-foreground uppercase tracking-wide">
                      {chap.subtitle}
                    </p>
                  )}
                </div>
              </div>
              <span className="text-xs font-sans font-medium px-3 py-1 rounded-full bg-secondary text-muted-foreground">
                {chap.pages.length} {chap.pages.length === 1 ? "página" : "páginas"}
              </span>
            </div>

            {/* Páginas Deste Capítulo */}
            {chap.pages.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {chap.pages.map((page) => {
                  const globalIndex = moments.findIndex((m) => m.id === page.id);
                  return (
                    <div
                      key={page.id}
                      onClick={() => globalIndex !== -1 && onSelectPage(globalIndex)}
                      className="group flex items-center gap-3 p-3 rounded-2xl bg-secondary/30 hover:bg-gold-soft/30 border border-transparent hover:border-gold/40 transition-all cursor-pointer"
                    >
                      {page.cover_url ? (
                        <img src={page.cover_url} alt="" className="size-12 rounded-xl object-cover border border-border shrink-0" />
                      ) : (
                        <div className="size-12 rounded-xl bg-paper border border-border flex items-center justify-center text-gold shrink-0">
                          <BookOpen className="size-5" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display font-semibold text-sm text-foreground truncate group-hover:text-gold transition-colors">
                          {page.title}
                        </h3>
                        <p className="font-sans text-[11px] text-muted-foreground truncate">
                          {new Date(page.happened_on + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                          {page.feeling ? ` · ${page.feeling}` : ""}
                        </p>
                      </div>
                      <ChevronRight className="size-4 text-muted-foreground/50 group-hover:text-gold group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center text-xs font-sans text-muted-foreground bg-secondary/20 rounded-2xl border border-dashed border-border/60">
                <span>Esta época ainda não possui páginas escritas. </span>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent("open-ai-studio", { detail: { chapter: chap.title } }))}
                  className="text-gold font-semibold hover:underline ml-1 inline-flex items-center gap-1"
                >
                  <Plus className="size-3" />
                  Escrever primeira página
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Memórias Avulsas (Se houver) */}
        {orphanMoments.length > 0 && (
          <div className="surface-paper rounded-3xl p-6 sm:p-8 border border-border/80 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <h2 className="font-display text-2xl font-bold text-foreground">
                Páginas Soltas do Legado
              </h2>
              <span className="text-xs font-sans font-medium px-3 py-1 rounded-full bg-secondary text-muted-foreground">
                {orphanMoments.length} páginas
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {orphanMoments.map((page) => {
                const globalIndex = moments.findIndex((m) => m.id === page.id);
                return (
                  <div
                    key={page.id}
                    onClick={() => globalIndex !== -1 && onSelectPage(globalIndex)}
                    className="group flex items-center gap-3 p-3 rounded-2xl bg-secondary/30 hover:bg-gold-soft/30 border border-transparent hover:border-gold/40 transition-all cursor-pointer"
                  >
                    {page.cover_url ? (
                      <img src={page.cover_url} alt="" className="size-12 rounded-xl object-cover border border-border shrink-0" />
                    ) : (
                      <div className="size-12 rounded-xl bg-paper border border-border flex items-center justify-center text-gold shrink-0">
                        <BookOpen className="size-5" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display font-semibold text-sm text-foreground truncate group-hover:text-gold transition-colors">
                        {page.title}
                      </h3>
                      <p className="font-sans text-[11px] text-muted-foreground truncate">
                        {new Date(page.happened_on + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground/50 group-hover:text-gold group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
