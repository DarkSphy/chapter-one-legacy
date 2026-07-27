import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Sparkles, ImagePlus, X, Video, Link2, Plus } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, CHAPTERS, FEELINGS, chapterBySlug, getAllChapters } from "@/lib/chapters";
import { useChild, useCreateMoment, useCustomChapters } from "@/hooks/useLibrary";
import { uploadFile, upsertCustomChapter } from "@/services/library";
import { writeStory } from "@/lib/ai.functions";
import { cn } from "@/lib/utils";

type Props = { open: boolean; onOpenChange: (open: boolean) => void };

export function MomentDialog({ open, onOpenChange }: Props) {
  const { data: child } = useChild();
  const { data: dbChapters } = useCustomChapters();
  const allChapters = getAllChapters(undefined, dbChapters);

  const create = useCreateMoment(child?.id ?? null);
  const generate = useServerFn(writeStory);

  const [title, setTitle] = useState("");
  const [raw, setRaw] = useState("");
  const [story, setStory] = useState("");
  
  const [category, setCategory] = useState("memoria");
  const [customCategoryName, setCustomCategoryName] = useState("");

  const [chapter, setChapter] = useState(CHAPTERS[0].slug);
  const [customChapterTitle, setCustomChapterTitle] = useState("");

  const [feeling, setFeeling] = useState<string | null>(null);
  const [isCustomFeeling, setIsCustomFeeling] = useState(false);
  const [customFeelingText, setCustomFeelingText] = useState("");

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [place, setPlace] = useState("");
  const [tags, setTags] = useState("");
  
  const [files, setFiles] = useState<{ file: File; preview: string }[]>([]);
  const [videoFiles, setVideoFiles] = useState<{ file: File; preview: string }[]>([]);
  const [videoLink, setVideoLink] = useState("");

  const [writing, setWriting] = useState(false);
  const [saving, setSaving] = useState(false);

  function reset() {
    setTitle("");
    setRaw("");
    setStory("");
    setCategory("memoria");
    setCustomCategoryName("");
    setChapter(CHAPTERS[0].slug);
    setCustomChapterTitle("");
    setFeeling(null);
    setIsCustomFeeling(false);
    setCustomFeelingText("");
    setDate(new Date().toISOString().slice(0, 10));
    setPlace("");
    setTags("");
    files.forEach((f) => URL.revokeObjectURL(f.preview));
    setFiles([]);
    videoFiles.forEach((f) => URL.revokeObjectURL(f.preview));
    setVideoFiles([]);
    setVideoLink("");
  }

  async function handleWrite() {
    if (raw.trim().length < 3) {
      toast.error("Escreva algumas palavras primeiro.");
      return;
    }
    setWriting(true);
    try {
      const currentChapterTitle =
        chapter === "__custom_chapter__"
          ? (customChapterTitle.trim() || "Capítulo Especial")
          : chapterBySlug(chapter, dbChapters).title;

      const currentFeeling = isCustomFeeling ? (customFeelingText.trim() || null) : feeling;

      const result = await generate({
        data: {
          title,
          rawText: raw,
          feeling: currentFeeling,
          childName: child?.name ?? null,
          chapterTitle: currentChapterTitle,
        },
      });
      setStory(result.story);
      toast.success("A história ganhou vida. Você pode editar como quiser.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não conseguimos escrever agora.");
    } finally {
      setWriting(false);
    }
  }

  async function handleSave() {
    if (!title.trim()) {
      toast.error("Dê um nome a esse momento.");
      return;
    }
    setSaving(true);
    try {
      let finalChapterSlug = chapter;
      if (chapter === "__custom_chapter__") {
        const titleClean = customChapterTitle.trim() || "Capítulo Especial";
        finalChapterSlug = titleClean
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") || `capitulo-${Date.now()}`;
        await upsertCustomChapter(finalChapterSlug, titleClean);
      }

      const finalCategory =
        category === "__custom_category__"
          ? (customCategoryName.trim().toLowerCase().replace(/\s+/g, "-") || "memoria")
          : category;

      const finalFeeling = isCustomFeeling
        ? (customFeelingText.trim() || null)
        : feeling;

      const uploaded: { url: string; media_type: "photo" | "video" | "video_link" }[] = [];
      
      for (const item of files) {
        const path = await uploadFile(item.file);
        uploaded.push({
          url: path,
          media_type: "photo",
        });
      }

      for (const item of videoFiles) {
        const path = await uploadFile(item.file);
        uploaded.push({
          url: path,
          media_type: "video",
        });
      }

      if (videoLink.trim()) {
        uploaded.push({
          url: videoLink.trim(),
          media_type: "video_link",
        });
      }

      await create.mutateAsync({
        title: title.trim(),
        raw_text: raw.trim() || null,
        story_text: (story.trim() || raw.trim()) as string,
        category: finalCategory,
        feeling: finalFeeling,
        happened_on: date,
        place: place.trim() || null,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        chapter_slug: finalChapterSlug,
        cover_url: uploaded.find((u) => u.media_type === "photo")?.url ?? null,
        media: uploaded as never,
      });

      toast.success("Seu livro acabou de ganhar uma nova página.");
      reset();
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não conseguimos salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto rounded-3xl border-border bg-paper p-0">
        <div className="px-7 pt-8 pb-2">
          <DialogHeader>
            <p className="label-eyebrow">Nova página</p>
            <DialogTitle className="font-display text-3xl font-light tracking-tight">
              Um momento para guardar
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Escreva pouco. Nós cuidamos das palavras bonitas. Capítulos, categorias e sentimentos são 100% personalizáveis!
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-6 px-7 pb-8">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              value={title}
              maxLength={120}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Primeiro ultrassom"
              className="rounded-xl border-border bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="relato">O que aconteceu</Label>
            <Textarea
              id="relato"
              value={raw}
              maxLength={2000}
              onChange={(e) => setRaw(e.target.value)}
              placeholder="Hoje ele deu os primeiros passos."
              className="min-h-24 rounded-xl border-border bg-background"
            />
            <Button
              type="button"
              variant="ghost"
              onClick={handleWrite}
              disabled={writing}
              className="h-9 rounded-full border border-gold/40 bg-gold-soft/40 px-4 text-sm text-foreground hover:bg-gold-soft"
            >
              {writing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4 text-gold" strokeWidth={1.5} />
              )}
              Transformar em uma linda história
            </Button>
          </div>

          {story && (
            <div className="animate-[var(--animate-rise)] space-y-2">
              <Label htmlFor="historia">A história do seu livro</Label>
              <Textarea
                id="historia"
                value={story}
                onChange={(e) => setStory(e.target.value)}
                className="min-h-40 rounded-xl border-gold/30 bg-gold-soft/20 font-display text-lg leading-relaxed"
              />
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Capítulo</Label>
              <Select value={chapter} onValueChange={setChapter}>
                <SelectTrigger className="rounded-xl bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allChapters.map((c) => (
                    <SelectItem key={c.slug} value={c.slug}>
                      {c.index}. {c.title}
                    </SelectItem>
                  ))}
                  <SelectItem value="__custom_chapter__" className="font-medium text-gold">
                    ✨ + Novo capítulo (Personalizar)
                  </SelectItem>
                </SelectContent>
              </Select>
              {chapter === "__custom_chapter__" && (
                <Input
                  value={customChapterTitle}
                  onChange={(e) => setCustomChapterTitle(e.target.value)}
                  placeholder="Título do capítulo (ex: Primeiro Aniversário)"
                  className="mt-2 rounded-xl border-gold/50 bg-gold-soft/10 text-sm animate-[var(--animate-fade)]"
                />
              )}
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="rounded-xl bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="__custom_category__" className="font-medium text-gold">
                    ✨ + Outra categoria (Personalizar)
                  </SelectItem>
                </SelectContent>
              </Select>
              {category === "__custom_category__" && (
                <Input
                  value={customCategoryName}
                  onChange={(e) => setCustomCategoryName(e.target.value)}
                  placeholder="Ex: Mesversário, Batizado, Escola..."
                  className="mt-2 rounded-xl border-gold/50 bg-gold-soft/10 text-sm animate-[var(--animate-fade)]"
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="data">Data</Label>
              <Input
                id="data"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-xl bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="local">Local</Label>
              <Input
                id="local"
                value={place}
                maxLength={120}
                onChange={(e) => setPlace(e.target.value)}
                placeholder="Casa da vovó"
                className="rounded-xl bg-background"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Sentimento</Label>
            <div className="flex flex-wrap gap-2 items-center">
              {FEELINGS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => {
                    setIsCustomFeeling(false);
                    setFeeling(feeling === f.value ? null : f.value);
                  }}
                  className={cn(
                    "rounded-full border border-border px-3.5 py-1.5 text-sm transition-all duration-200",
                    !isCustomFeeling && feeling === f.value
                      ? "border-gold bg-gold-soft/50 text-foreground"
                      : "text-muted-foreground hover:border-gold/50",
                  )}
                >
                  <span className="mr-1.5">{f.emoji}</span>
                  {f.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setIsCustomFeeling(!isCustomFeeling);
                  if (!isCustomFeeling) setFeeling(null);
                }}
                className={cn(
                  "rounded-full border border-dashed px-3.5 py-1.5 text-sm transition-all duration-200 flex items-center gap-1",
                  isCustomFeeling
                    ? "border-gold bg-gold text-foreground font-medium"
                    : "border-gold/60 text-gold hover:bg-gold-soft/20",
                )}
              >
                <Plus className="size-3.5" />
                Outro sentimento...
              </button>
            </div>
            {isCustomFeeling && (
              <Input
                value={customFeelingText}
                onChange={(e) => setCustomFeelingText(e.target.value)}
                placeholder="Digite o sentimento (ex: 🙏 Abençoada, 😍 Encantada, 🏖️ Em paz...)"
                className="mt-2 rounded-xl border-gold/50 bg-gold-soft/10 text-sm animate-[var(--animate-fade)]"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={tags}
              maxLength={200}
              onChange={(e) => setTags(e.target.value)}
              placeholder="família, primeira vez, verão"
              className="rounded-xl bg-background"
            />
          </div>

          <div className="space-y-5 pt-2 border-t border-border/40">
            {/* Fotos */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base font-medium text-foreground">
                <ImagePlus className="size-4 text-gold" />
                <span>Fotos da Lembrança</span>
              </Label>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-background/60 px-4 py-6 text-sm text-muted-foreground transition-colors hover:border-gold/60">
                <ImagePlus className="size-4" strokeWidth={1.5} />
                Escolher fotos
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const list = Array.from(e.target.files ?? []);
                    setFiles((prev) => [
                      ...prev,
                      ...list.map((file) => ({ file, preview: URL.createObjectURL(file) })),
                    ]);
                  }}
                />
              </label>
              {files.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {files.map((f, i) => (
                    <div key={i} className="relative size-20 overflow-hidden rounded-xl border">
                      <img src={f.preview} alt="" className="size-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 rounded-full bg-background/90 p-1 hover:bg-destructive hover:text-white transition-colors"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Vídeos e Links para PDF */}
            <div className="space-y-3 rounded-2xl border border-gold/30 bg-gold-soft/10 p-5">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-base font-medium text-foreground">
                  <Video className="size-4 text-gold" />
                  <span>Vídeo da Lembrança (Separado da foto)</span>
                </Label>
                <span className="text-[10px] tracking-wider uppercase font-semibold bg-gold/20 text-gold px-2 py-0.5 rounded-full">
                  Link ativo no PDF
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Adicione um vídeo ou cole o link (Drive, YouTube, iCloud) para assistir ao clicar no livro e ao exportar em PDF.
              </p>

              <div className="space-y-3 pt-2">
                <div className="relative">
                  <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    value={videoLink}
                    onChange={(e) => setVideoLink(e.target.value)}
                    placeholder="Cole o link do vídeo (https://youtu.be/... ou Google Drive)"
                    className="pl-10 rounded-xl bg-background border-border text-sm"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-px bg-border/60 flex-1" />
                  <span className="text-[11px] text-muted-foreground uppercase font-mono">ou suba o arquivo</span>
                  <div className="h-px bg-border/60 flex-1" />
                </div>

                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background/80 px-4 py-3.5 text-xs text-muted-foreground transition-colors hover:border-gold/60">
                  <Video className="size-3.5" strokeWidth={1.5} />
                  <span>Anexar arquivo de vídeo (.mp4, .mov)</span>
                  <input
                    type="file"
                    accept="video/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const list = Array.from(e.target.files ?? []);
                      setVideoFiles((prev) => [
                        ...prev,
                        ...list.map((file) => ({ file, preview: URL.createObjectURL(file) })),
                      ]);
                    }}
                  />
                </label>
                {videoFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {videoFiles.map((f, i) => (
                      <div key={i} className="relative size-20 overflow-hidden rounded-xl border bg-black">
                        <video src={f.preview} className="size-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setVideoFiles((prev) => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-1 right-1 rounded-full bg-background/90 p-1 hover:bg-destructive hover:text-white transition-colors"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-full">
              Agora não
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="rounded-full px-6 shadow-[var(--shadow-paper)]"
            >
              {saving && <Loader2 className="size-4 animate-spin" />}
              Guardar no livro
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

