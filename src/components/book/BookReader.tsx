import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Edit3, Check, Loader2, Video, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { MomentCover } from "@/components/moments/MomentCard";
import { CHAPTERS, getAllChapters, type ChapterDef } from "@/lib/chapters";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUpdateStory, useSignedUrl } from "@/hooks/useLibrary";
import type { Moment } from "@/types";

type Page =
  | { kind: "cover"; title: string; subtitle: string }
  | { kind: "chapter"; index: number; title: string; subtitle: string }
  | { kind: "moment"; moment: Moment }
  | { kind: "photo"; moment: Moment }
  | { kind: "video"; moment: Moment; video: { url: string; media_type: string } }
  | { kind: "end" };

export function buildPages(moments: Moment[], childName: string, customChapters?: ChapterDef[]): Page[] {
  const pages: Page[] = [
    {
      kind: "cover",
      title: childName ? `O Livro de ${childName}` : "O seu livro",
      subtitle: "Uma história escrita aos poucos, por quem mais ama.",
    },
  ];

  const allChapters = getAllChapters(moments, customChapters);

  for (const chapter of allChapters) {
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
      
      const photos = moment.moment_media?.filter((m) => m.media_type === "photo") || [];
      const videos = moment.moment_media?.filter((m) => m.media_type === "video" || m.media_type === "video_link" || m.url.includes("youtu") || m.url.includes("drive.google") || m.url.includes(".mp4") || m.url.includes(".mov")) || [];

      if (photos.length > 0 || moment.cover_url || videos.length === 0) {
        pages.push({ kind: "photo", moment });
      }

      for (const vid of videos) {
        pages.push({ kind: "video", moment, video: vid });
      }
    }
  }

  if (pages.length > 1) pages.push({ kind: "end" });
  return pages;
}

function VideoPlayer({ path }: { path: string }) {
  const url = useSignedUrl(path);
  if (!url) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        <Loader2 className="size-6 animate-spin text-gold" />
      </div>
    );
  }
  return <video src={url} controls className="size-full max-h-[16rem] object-contain rounded-xl" />;
}

function PdfVideoLinkBox({ urlPath }: { urlPath: string }) {
  const isHttp = urlPath.startsWith("http");
  const signed = useSignedUrl(isHttp ? null : urlPath);
  const displayUrl = isHttp ? urlPath : (signed || "https://primeiroscapitulos.app/video-ativo");

  return (
    <div className="rounded-2xl border border-gold/50 bg-gold-soft/20 p-4 text-center shadow-sm">
      <p className="text-[11px] font-bold tracking-wider text-gold uppercase mb-1 flex items-center justify-center gap-1.5">
        <ExternalLink className="size-3" />
        <span>Link para Acesso no Livro em PDF</span>
      </p>
      <p className="text-xs text-muted-foreground mb-2.5">
        Ao exportar em PDF ou ler o livro impresso, acesse o vídeo diretamente pelo link da plataforma:
      </p>
      <a
        href={displayUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center justify-center font-mono text-xs text-foreground bg-background/90 px-3 py-2 rounded-xl border border-border hover:border-gold transition-all duration-200 break-all underline decoration-gold shadow-xs w-full font-medium"
      >
        {displayUrl}
      </a>
    </div>
  );
}

function PageFace({ page, number }: { page: Page; number: number }) {
  const updateStory = useUpdateStory();
  const [isEditing, setIsEditing] = useState(false);
  const [storyText, setStoryText] = useState(() =>
    page.kind === "moment" ? page.moment.story_text || page.moment.raw_text || "" : "",
  );
  const [isSaving, setIsSaving] = useState(false);

  async function handleSaveStory() {
    if (page.kind !== "moment") return;
    setIsSaving(true);
    try {
      await updateStory.mutateAsync({
        id: page.moment.id,
        story: storyText.trim(),
      });
      page.moment.story_text = storyText.trim();
      setIsEditing(false);
      toast.success("História da página atualizada no livro!");
    } catch (error) {
      toast.error("Não foi possível salvar a alteração.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="relative flex min-h-[26rem] flex-col justify-center bg-paper px-8 py-12 sm:min-h-[34rem] sm:px-12 transition-all duration-500 hover:shadow-inner">
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
          <p className="label-eyebrow flex items-center justify-center gap-1.5 text-gold">
            <span>Época da Nossa História</span>
          </p>
          <h2 className="text-display text-4xl sm:text-5xl">{page.title}</h2>
          <div className="gold-rule mx-auto h-px w-16" />
          <p className="font-display text-lg text-muted-foreground italic">{page.subtitle}</p>
        </div>
      )}

      {page.kind === "moment" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="label-eyebrow">
              {format(parseISO(page.moment.happened_on), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              {page.moment.place ? ` · ${page.moment.place}` : ""}
            </p>
            
            {/* Inline Edit Button */}
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-gold transition-colors"
                title="Editar texto da página"
              >
                <Edit3 className="size-3.5" />
                <span>Editar página</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveStory}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1 rounded-full bg-gold px-3 py-1 text-xs text-foreground font-medium hover:bg-gold-soft transition-colors"
                >
                  {isSaving ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
                  Salvar
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>

          <h3 className="font-display text-3xl font-light">{page.moment.title}</h3>

          {/* Editable Story Textarea or Display */}
          {isEditing ? (
            <textarea
              value={storyText}
              onChange={(e) => setStoryText(e.target.value)}
              className="w-full min-h-[14rem] rounded-2xl border border-gold/40 bg-gold-soft/20 p-4 font-display text-xl leading-relaxed outline-none focus:ring-1 focus:ring-gold"
              placeholder="Escreva a história deste momento..."
            />
          ) : (
            <p className="font-display text-xl leading-relaxed whitespace-pre-line text-foreground/90">
              {page.moment.story_text || page.moment.raw_text}
            </p>
          )}
        </div>
      )}

      {page.kind === "photo" && (
        <figure className="space-y-4">
          <MomentCover
            path={page.moment.cover_url}
            className="h-64 w-full rounded-2xl sm:h-80 shadow-sm"
          />
          <figcaption className="text-center font-display text-base text-muted-foreground italic">
            {page.moment.title}
          </figcaption>
        </figure>
      )}

      {page.kind === "video" && (
        <div className="flex flex-col h-full justify-between space-y-4 my-auto">
          <div className="space-y-1 text-center">
            <p className="label-eyebrow flex items-center justify-center gap-1.5 text-gold font-semibold">
              <Video className="size-3.5" />
              <span>Cinema da Lembrança · {page.moment.title}</span>
            </p>
            <h3 className="font-display text-2xl font-light">O filme desse momento</h3>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-gold/40 bg-black/95 shadow-md flex-1 min-h-[14rem] flex flex-col items-center justify-center p-4">
            {page.video.media_type === "video_link" || page.video.url.startsWith("http") ? (
              page.video.url.includes("youtu") || page.video.url.endsWith(".mp4") ? (
                <video src={page.video.url} controls className="size-full max-h-[16rem] object-contain rounded-xl" />
              ) : (
                <div className="text-center space-y-3 p-4">
                  <div className="size-14 rounded-full bg-gold/20 text-gold flex items-center justify-center mx-auto border border-gold/40 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                    <Video className="size-7" />
                  </div>
                  <p className="font-display text-lg text-white">Vídeo na Nuvem (Drive / iCloud)</p>
                  <a
                    href={page.video.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2 text-sm font-medium text-foreground hover:bg-gold-soft transition-transform hover:scale-105"
                  >
                    <span>▶️ Assistir Vídeo Externo</span>
                  </a>
                </div>
              )
            ) : (
              <VideoPlayer path={page.video.url} />
            )}
          </div>

          <PdfVideoLinkBox urlPath={page.video.url} />
        </div>
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
  const [direction, setDirection] = useState<"next" | "prev">("next");

  const spread = useMemo(
    () => pages.slice(index, index + step),
    [pages, index, step],
  );

  const canPrev = index > 0;
  const canNext = index + step < pages.length;

  const handleNext = () => {
    if (canNext) {
      setDirection("next");
      setIndex((i) => i + step);
    }
  };

  const handlePrev = () => {
    if (canPrev) {
      setDirection("prev");
      setIndex((i) => Math.max(0, i - step));
    }
  };

  return (
    <div className="space-y-6">
      {/* 3D Realistic Book Container */}
      <div className="relative overflow-hidden rounded-[2rem] border border-border shadow-[var(--shadow-book)] perspective-[2000px]">
        {/* Book Central Spine Shadow Effect */}
        <div className="pointer-events-none absolute inset-y-0 left-1/2 z-20 hidden w-12 -translate-x-1/2 bg-gradient-to-r from-transparent via-black/15 to-transparent md:block" />

        <div
          key={index}
          className={`grid divide-x divide-border/60 md:grid-cols-2 transition-all duration-700 ease-out transform ${
            direction === "next"
              ? "animate-[var(--animate-page)]"
              : "animate-[var(--animate-fade)]"
          }`}
        >
          {spread.map((page, i) => (
            <PageFace key={`${index}-${i}`} page={page} number={index + i + 1} />
          ))}
          {spread.length === 1 && !isMobile && (
            <div className="hidden bg-paper md:block" aria-hidden />
          )}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-center gap-6">
        <button
          onClick={handlePrev}
          disabled={!canPrev}
          aria-label="Página anterior"
          className="rounded-full border border-border bg-paper p-3 transition-all hover:border-gold hover:shadow-md disabled:opacity-30"
        >
          <ChevronLeft className="size-4" strokeWidth={1.5} />
        </button>
        <span className="text-sm font-display text-muted-foreground">
          Página {Math.min(index + 1, pages.length)} – {Math.min(index + step, pages.length)} de{" "}
          {pages.length}
        </span>
        <button
          onClick={handleNext}
          disabled={!canNext}
          aria-label="Próxima página"
          className="rounded-full border border-border bg-paper p-3 transition-all hover:border-gold hover:shadow-md disabled:opacity-30"
        >
          <ChevronRight className="size-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}

