import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MomentCover } from "@/components/moments/MomentCard";
import { CHAPTERS } from "@/lib/chapters";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Moment } from "@/types";

type Page =
  | { kind: "cover"; title: string; subtitle: string }
  | { kind: "chapter"; index: number; title: string; subtitle: string }
  | { kind: "moment"; moment: Moment }
  | { kind: "photo"; moment: Moment }
  | { kind: "end" };

export function buildPages(moments: Moment[], childName: string): Page[] {
  const pages: Page[] = [
    {
      kind: "cover",
      title: childName ? `O Livro de ${childName}` : "O seu livro",
      subtitle: "Uma história escrita aos poucos, por quem mais ama.",
    },
  ];

  for (const chapter of CHAPTERS) {
    const items = moments
      .filter((m) => m.chapter_slug === chapter.slug)
      .sort((a, b) => a.happened_on.localeCompare(b.happened_on));
    if (!items.length) continue;
    pages.push({
      kind: "chapter",
      index: chapter.index,
      title: chapter.title,
      subtitle: chapter.subtitle,
    });
    for (const moment of items) {
      pages.push({ kind: "moment", moment });
      pages.push({ kind: "photo", moment });
    }
  }

  if (pages.length > 1) pages.push({ kind: "end" });
  return pages;
}

function PageFace({ page, number }: { page: Page; number: number }) {
  return (
    <div className="relative flex min-h-[26rem] flex-col justify-center bg-paper px-8 py-12 sm:min-h-[34rem] sm:px-12">
      {page.kind === "cover" && (
        <div className="space-y-6 text-center">
          <p className="label-eyebrow">Primeiros Capítulos</p>
          <h2 className="text-display text-4xl sm:text-5xl">{page.title}</h2>
          <div className="gold-rule mx-auto h-px w-24" />
          <p className="font-display text-lg text-muted-foreground italic">{page.subtitle}</p>
        </div>
      )}

      {page.kind === "chapter" && (
        <div className="space-y-5 text-center">
          <p className="label-eyebrow">Capítulo {page.index}</p>
          <h2 className="text-display text-4xl sm:text-5xl">{page.title}</h2>
          <div className="gold-rule mx-auto h-px w-16" />
          <p className="font-display text-lg text-muted-foreground italic">{page.subtitle}</p>
        </div>
      )}

      {page.kind === "moment" && (
        <div className="space-y-5">
          <p className="label-eyebrow">
            {format(parseISO(page.moment.happened_on), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            {page.moment.place ? ` · ${page.moment.place}` : ""}
          </p>
          <h3 className="font-display text-3xl font-light">{page.moment.title}</h3>
          <p className="font-display text-xl leading-relaxed whitespace-pre-line">
            {page.moment.story_text || page.moment.raw_text}
          </p>
        </div>
      )}

      {page.kind === "photo" && (
        <figure className="space-y-4">
          <MomentCover
            path={page.moment.cover_url}
            className="h-64 w-full rounded-2xl sm:h-80"
          />
          <figcaption className="text-center font-display text-base text-muted-foreground italic">
            {page.moment.title}
          </figcaption>
        </figure>
      )}

      {page.kind === "end" && (
        <div className="space-y-5 text-center">
          <h2 className="text-display text-4xl">Continua…</h2>
          <div className="gold-rule mx-auto h-px w-16" />
          <p className="font-display text-lg text-muted-foreground italic">
            A próxima página depende de você.
          </p>
        </div>
      )}

      <span className="absolute inset-x-0 bottom-5 text-center text-xs text-muted-foreground/70">
        {number}
      </span>
    </div>
  );
}

export function BookReader({ pages }: { pages: Page[] }) {
  const isMobile = useIsMobile();
  const step = isMobile ? 1 : 2;
  const [index, setIndex] = useState(0);
  const spread = useMemo(
    () => pages.slice(index, index + step),
    [pages, index, step],
  );

  const canPrev = index > 0;
  const canNext = index + step < pages.length;

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-[2rem] border border-border shadow-[var(--shadow-book)]">
        <div
          key={index}
          className="grid animate-[var(--animate-page)] divide-x divide-border md:grid-cols-2"
        >
          {spread.map((page, i) => (
            <PageFace key={`${index}-${i}`} page={page} number={index + i + 1} />
          ))}
          {spread.length === 1 && !isMobile && (
            <div className="hidden bg-paper md:block" aria-hidden />
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-6">
        <button
          onClick={() => setIndex((i) => Math.max(0, i - step))}
          disabled={!canPrev}
          aria-label="Página anterior"
          className="rounded-full border border-border bg-paper p-3 transition-all hover:border-gold disabled:opacity-30"
        >
          <ChevronLeft className="size-4" strokeWidth={1.5} />
        </button>
        <span className="text-sm text-muted-foreground">
          {Math.min(index + 1, pages.length)} – {Math.min(index + step, pages.length)} de{" "}
          {pages.length}
        </span>
        <button
          onClick={() => setIndex((i) => (i + step < pages.length ? i + step : i))}
          disabled={!canNext}
          aria-label="Próxima página"
          className="rounded-full border border-border bg-paper p-3 transition-all hover:border-gold disabled:opacity-30"
        >
          <ChevronRight className="size-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
