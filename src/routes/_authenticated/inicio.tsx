import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, Compass, Sparkles } from "lucide-react";
import { useChild, useMoments, useCustomChapters } from "@/hooks/useLibrary";
import { getAllChapters } from "@/lib/chapters";
import { BookCover } from "@/components/book/BookCover";
import { BookSpread } from "@/components/book/BookSpread";
import { TableOfContents } from "@/components/book/TableOfContents";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/inicio")({
  component: InicioPage,
});

function InicioPage() {
  const { data: child, isLoading: childLoading } = useChild();
  const { data: moments = [], isLoading: momentsLoading } = useMoments();
  const { data: dbChapters } = useCustomChapters();
  const allChapters = getAllChapters(undefined, dbChapters);

  // Modo de Leitura do Livro: Capa -> Espalhado (Spread) -> Sumário
  const [mode, setMode] = useState<"cover" | "spread" | "toc">("cover");
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  if (childLoading || momentsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <div className="size-12 rounded-full bg-gold-soft border border-gold/40 flex items-center justify-center animate-spin">
          <Sparkles className="size-6 text-gold" />
        </div>
        <p className="font-serif italic text-sm text-muted-foreground">
          Abrindo os arquivos eternos de nossa família...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barra de Controle Editorial da Mesa de Leitura */}
      <div className="flex items-center justify-between border-b border-border/40 pb-4 px-2 sm:px-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode("cover")}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-sans font-medium transition-all duration-300",
              mode === "cover"
                ? "bg-obsidian text-paper shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            )}
          >
            Capa do Livro
          </button>
          <button
            onClick={() => setMode("spread")}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-sans font-medium transition-all duration-300 flex items-center gap-1.5",
              mode === "spread"
                ? "bg-obsidian text-paper shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            )}
          >
            <BookOpen className="size-3" />
            <span>Páginas ({moments.length})</span>
          </button>
          <button
            onClick={() => setMode("toc")}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-sans font-medium transition-all duration-300 flex items-center gap-1.5",
              mode === "toc"
                ? "bg-obsidian text-paper shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            )}
          >
            <Compass className="size-3" />
            <span>Sumário</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-serif italic text-muted-foreground">
          <span>{child?.name ? `Legado de ${child.name}` : "Livro Familiar"}</span>
        </div>
      </div>

      {/* MODO CAPA: Capa de Luxo Interativa */}
      {mode === "cover" && (
        <BookCover
          title="Primeiros Capítulos"
          subtitle="A História e Legado de Nossa Família"
          childName={child?.name || "Nosso Bebezinho"}
          coverUrl={child?.photo_url || null}
          onOpenBook={() => setMode("spread")}
        />
      )}

      {/* MODO SPREAD: Páginas em Leitura Imersiva */}
      {mode === "spread" && (
        <BookSpread
          pages={moments}
          currentIndex={currentPageIndex}
          onNavigate={(idx) => setCurrentPageIndex(idx)}
          onNewPage={() => window.dispatchEvent(new CustomEvent("open-ai-studio"))}
        />
      )}

      {/* MODO SUMÁRIO: Cronologia e Épocas da Vida */}
      {mode === "toc" && (
        <TableOfContents
          chapters={allChapters}
          moments={moments}
          onSelectPage={(idx) => {
            setCurrentPageIndex(idx);
            setMode("spread");
          }}
          onNewChapter={() => window.dispatchEvent(new CustomEvent("open-ai-studio"))}
        />
      )}
    </div>
  );
}
