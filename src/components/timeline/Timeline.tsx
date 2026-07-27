import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MomentCover } from "@/components/moments/MomentCard";
import { getFeeling, chapterBySlug, getCategoryLabel } from "@/lib/chapters";
import { useCustomChapters } from "@/hooks/useLibrary";
import type { Moment } from "@/types";

export function Timeline({ moments }: { moments: Moment[] }) {
  const { data: dbChapters } = useCustomChapters();
  if (moments.length === 0) {
    return (
      <div className="surface-paper rounded-3xl p-12 text-center">
        <p className="font-display text-2xl text-muted-foreground">
          Sua linha do tempo ainda está em branco. Adicione o primeiro momento.
        </p>
      </div>
    );
  }

  return (
    <ol className="relative space-y-12 before:absolute before:top-4 before:bottom-4 before:left-2 before:w-px before:bg-gradient-to-b before:from-gold-soft before:via-border/60 before:to-transparent sm:before:left-1/2 sm:before:-translate-x-1/2">
      {moments.map((moment, idx) => {
        const left = idx % 2 === 0;
        const feeling = getFeeling(moment.feeling);
        const chapter = chapterBySlug(moment.chapter_slug, dbChapters);

        return (
          <li key={moment.id} className="relative pl-8 sm:pl-0">
            <span
              aria-hidden
              className="absolute top-6 left-1.5 size-[9px] rounded-full bg-gold ring-4 ring-background sm:left-1/2 sm:-translate-x-1/2"
            />
            <div
              className={`sm:w-[calc(50%-2.25rem)] ${left ? "" : "sm:ml-auto"}`}
            >
              <div className="surface-paper overflow-hidden rounded-3xl transition-all duration-500 hover:shadow-lift border border-border/60">
                <MomentCover path={moment.cover_url} className="h-52 w-full" />
                <div className="space-y-2.5 p-6">
                  <div className="flex flex-wrap items-center gap-2 text-xs tracking-wider text-muted-foreground">
                    <span>{format(parseISO(moment.happened_on), "d MMM yyyy", { locale: ptBR })}{moment.place ? ` · ${moment.place}` : ""} · {chapter.title}</span>
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
                  <h3 className="font-display text-2xl font-light text-foreground">
                    {moment.title}
                  </h3>
                  <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">
                    {moment.story_text || moment.raw_text}
                  </p>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
