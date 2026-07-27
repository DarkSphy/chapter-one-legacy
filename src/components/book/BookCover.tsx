import { Sparkles, BookOpen, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  title?: string;
  subtitle?: string;
  childName?: string;
  coverUrl?: string | null;
  onOpenBook: () => void;
};

export function BookCover({
  title = "Primeiros Capítulos",
  subtitle = "O Livro da Vida & Legado",
  childName = "Nossa Criança",
  coverUrl,
  onOpenBook,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4">
      {/* Container 3D do Livro */}
      <div
        onClick={onOpenBook}
        className="group relative cursor-pointer transform-gpu transition-all duration-700 hover:-translate-y-2 hover:scale-[1.01]"
        style={{
          perspective: "1500px",
        }}
      >
        {/* Capa de Livro de Luxo (Hardbound Obsidian & Gold) */}
        <div className="w-[320px] sm:w-[420px] md:w-[480px] aspect-[1/1.38] rounded-r-3xl rounded-l-md bg-obsidian text-paper border-y-2 border-r-2 border-gold-border/40 shadow-sheet p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden transition-all duration-500 group-hover:shadow-[0_40px_80px_-15px_rgba(197,160,89,0.25)]">
          {/* Lombada do Livro (Efeito Relevo na Esquerda) */}
          <div className="absolute top-0 left-0 bottom-0 w-8 sm:w-12 bg-gradient-to-r from-black/60 via-white/5 to-transparent border-r border-gold/20 pointer-events-none" />
          
          {/* Fita / Marcador de Página Dourado */}
          <div className="absolute top-0 right-14 w-6 h-28 bg-gradient-to-b from-gold-bright via-gold to-gold-border rounded-b-sm shadow-md transform translate-y-[-4px] group-hover:translate-y-0 transition-transform duration-500" />

          {/* Textura Dourada Subtil */}
          <div className="absolute inset-0 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

          {/* Topo da Capa */}
          <div className="relative z-10 text-center space-y-2 pt-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/15 text-gold text-[11px] font-sans font-semibold tracking-widest uppercase border border-gold/30">
              <Sparkles className="size-3" />
              Edição Eterna de Legado
            </span>
            <p className="font-sans text-xs sm:text-sm tracking-widest uppercase text-paper/70 font-medium">
              {subtitle}
            </p>
          </div>

          {/* Centro da Capa (Título & Fotografia Emblema) */}
          <div className="relative z-10 flex flex-col items-center justify-center my-auto space-y-6 text-center">
            {coverUrl ? (
              <div className="size-40 sm:size-52 rounded-full p-1.5 bg-gradient-to-tr from-gold via-gold-bright to-gold-border shadow-2xl">
                <img
                  src={coverUrl}
                  alt={childName}
                  className="size-full rounded-full object-cover border-4 border-obsidian"
                />
              </div>
            ) : (
              <div className="size-36 sm:size-48 rounded-full border-2 border-dashed border-gold/50 bg-gold/5 flex flex-col items-center justify-center text-gold p-4">
                <Heart className="size-10 mb-2 stroke-[1.5] animate-pulse" />
                <span className="font-display italic text-sm text-paper/80">O Protagonista</span>
              </div>
            )}

            <div className="space-y-1">
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gold drop-shadow-sm">
                {title}
              </h1>
              <p className="font-display italic text-2xl sm:text-3xl text-paper/90 font-normal">
                {childName}
              </p>
            </div>
          </div>

          {/* Rodapé da Capa */}
          <div className="relative z-10 pt-6 border-t border-gold/30 flex items-center justify-between text-xs font-sans text-gold/80 uppercase tracking-widest">
            <span>Vol. I</span>
            <span className="flex items-center gap-1 group-hover:text-gold-bright transition-colors font-semibold">
              <span>Abrir Livro</span>
              <BookOpen className="size-3.5 ml-1 transition-transform group-hover:translate-x-1" />
            </span>
            <span>Est. 2026</span>
          </div>
        </div>
      </div>
      
      <p className="mt-6 text-xs font-sans text-muted-foreground tracking-wide text-center">
        Clique na capa para folhear as páginas da história
      </p>
    </div>
  );
}
