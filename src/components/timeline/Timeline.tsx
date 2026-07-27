import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MomentCover } from "@/components/moments/MomentCard";
import { FEELINGS, chapterBySlug } from "@/lib/chapters";
import type { Moment } from "@/types";

export function Timeline({ moments }: { moments: Moment[] }) {
  return (
    <ol className="relative mx-auto max-w-3xl">
      <span
        aria-hidden
        className="absolute top-2 bottom-2 left-[11px] w-px origin-top animate-[var(--animate-draw)] bg-gradient-to-b from-gold/70 via-border to-transparent sm:left-1/2"
      />
      {moments.map((moment, i) => {
        const feeling = FEELINGS.find((f) => f.value === moment.feeling);
        const left = i % 2 === 0;
        return (
          <li
            key={moment.id}
            className="relative animate-[var(--animate-rise)] pb-14 pl-10 sm:pl-0"
            style={{ animationDelay: `${Math.min(i, 8) * 70}ms` }}
          >
            <span
              aria-hidden
              className="absolute top-6 left-1.5 size-[9px] rounded-full bg-gold ring-4 ring-background sm:left-1/2 sm:-translate-x-1/2"
            />
            <div
              className={`sm:w-[calc(50%-2.25rem)] ${left ? "" : "sm:ml-auto"}`}
            >
              <div className="surface-paper overflow-hidden rounded-3xl transition-all duration-500 hover:shadow-[var(--shadow-lift)]">
                <MomentCover path={moment.cover_url} className="h-52 w-full" />
                <div className="space-y-2 p-6">
                  <p className="label-eyebrow">
                    {format(parseISO(moment.happened_on), "d MMM yyyy", { locale: ptBR })} ·{" "}
                    {chapterBySlug(moment.chapter_slug).title}
                  </p>
                  <h3 className="font-display text-2xl font-light">
                    {feeling ? `${feeling.emoji} ` : ""}
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
