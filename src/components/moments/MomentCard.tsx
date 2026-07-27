import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowUpRight, Image as ImageIcon, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSignedUrl, useDeleteMoment } from "@/hooks/useLibrary";
import { getFeeling, chapterBySlug, getCategoryLabel } from "@/lib/chapters";
import type { Moment } from "@/types";

export function MomentCover({
  path,
  className = "",
}: {
  path?: string | null;
  className?: string;
}) {
  const url = useSignedUrl(path);
  if (!url) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-secondary to-gold-soft/40 ${className}`}
      >
        <ImageIcon className="size-5 text-muted-foreground/50" strokeWidth={1.25} />
      </div>
    );
  }
  return <img src={url} alt="" loading="lazy" className={`object-cover ${className}`} />;
}

export function MomentCard({ moment, onOpen }: { moment: Moment; onOpen?: () => void }) {
  const feeling = getFeeling(moment.feeling);
  const chapter = chapterBySlug(moment.chapter_slug);
  const deleteMoment = useDeleteMoment();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(`Tem certeza que deseja excluir "${moment.title}" do livro?`)) {
      return;
    }
    setIsDeleting(true);
    try {
      await deleteMoment.mutateAsync(moment.id);
      toast.success("Momento removido com sucesso.");
    } catch (error) {
      toast.error("Não foi possível excluir o momento.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <article
      onClick={onOpen}
      className="surface-paper group relative cursor-pointer overflow-hidden rounded-[1.75rem] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift border border-border/60"
    >
      <MomentCover
        path={moment.cover_url}
        className="h-56 w-full transition-transform duration-700 group-hover:scale-105"
      />
      
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        title="Excluir este momento"
        className="absolute top-3 right-3 z-10 flex size-9 items-center justify-center rounded-full bg-background/80 text-muted-foreground backdrop-blur-md transition-all duration-200 hover:bg-destructive hover:text-destructive-foreground opacity-80 group-hover:opacity-100 shadow-sm"
      >
        {isDeleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
      </button>

      <div className="space-y-3 p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs tracking-wider text-muted-foreground">
          <span>{format(parseISO(moment.happened_on), "d 'de' MMMM, yyyy", { locale: ptBR })}</span>
          {feeling && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gold-soft/30 px-2.5 py-0.5 text-[11px] font-medium text-foreground border border-gold/40">
              <span>{feeling.emoji}</span>
              <span>{feeling.label}</span>
            </span>
          )}
          {moment.category && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-[11px] text-foreground/80">
              {getCategoryLabel(moment.category)}
            </span>
          )}
        </div>
        <h3 className="font-display text-2xl leading-tight font-light text-foreground">
          {moment.title}
        </h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {moment.story_text || moment.raw_text}
        </p>
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground/80 italic">{chapter.title}</span>
          {onOpen && (
            <button
              onClick={onOpen}
              className="inline-flex items-center gap-1 text-sm text-foreground transition-colors hover:text-gold"
            >
              Visualizar
              <ArrowUpRight className="size-3.5" strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

