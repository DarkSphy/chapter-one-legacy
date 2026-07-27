import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, ImagePlus, X, Video, Link2, Plus } from "lucide-react";
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
import { FEELINGS, getAllChapters } from "@/lib/chapters";
import {
  useChild,
  useCreateMoment,
  useCustomChapters,
  useCustomCategories,
  useCustomFeelings,
  useUpsertChapter,
  useUpsertCategory,
  useUpsertFeeling,
  useMoments,
} from "@/hooks/useLibrary";
import { uploadFile, upsertCustomChapter } from "@/services/library";
import { cn } from "@/lib/utils";
import { ChapterManagerDialog } from "@/components/moments/ChapterManagerDialog";

type Props = { open: boolean; onOpenChange: (open: boolean) => void; defaultChapter?: string };

export function MomentDialog({ open, onOpenChange, defaultChapter }: Props) {
  const { data: child } = useChild();
  const { data: dbChapters } = useCustomChapters();
  const { data: dbCategories } = useCustomCategories();
  const { data: dbFeelings } = useCustomFeelings();
  const { data: dbMoments = [] } = useMoments();
  const upsertChapter = useUpsertChapter();
  const upsertCategory = useUpsertCategory();
  const upsertFeeling = useUpsertFeeling();
  const allChapters = getAllChapters(undefined, dbChapters);
  const create = useCreateMoment(child?.id ?? null);

  const [openChapterManager, setOpenChapterManager] = useState(false);
  const [title, setTitle] = useState("");
  const [raw, setRaw] = useState("");
  
  const [categoryName, setCategoryName] = useState("Geral");
  const [chapterName, setChapterName] = useState("");

  const [isCreatingChapter, setIsCreatingChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState("");

  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [isCreatingFeeling, setIsCreatingFeeling] = useState(false);
  const [newFeelingLabel, setNewFeelingLabel] = useState("");

  useEffect(() => {
    if (open && defaultChapter) {
      setChapterName(defaultChapter);
    }
  }, [open, defaultChapter]);

  const [feeling, setFeeling] = useState<string | null>(null);

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("");
  const [place, setPlace] = useState("");
  const [tags, setTags] = useState("");
  
  const [files, setFiles] = useState<{ file: File; preview: string }[]>([]);
  const [videoFiles, setVideoFiles] = useState<{ file: File; preview: string }[]>([]);

  const [saving, setSaving] = useState(false);

  function reset() {
    setTitle("");
    setRaw("");
    setCategoryName("Geral");
    setChapterName("");
    setFeeling(null);
    setDate(new Date().toISOString().slice(0, 10));
    setTime("");
    setPlace("");
    setTags("");
    files.forEach((f) => URL.revokeObjectURL(f.preview));
    setFiles([]);
    videoFiles.forEach((f) => URL.revokeObjectURL(f.preview));
    setVideoFiles([]);
  }

  async function handleSave() {
    if (!title.trim()) {
      toast.error("Dê um nome a esse momento.");
      return;
    }
    setSaving(true);
    try {
      const titleClean = chapterName.trim() || "Nossa História";
      const finalChapterSlug = titleClean
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || `capitulo-${Date.now()}`;
      await upsertCustomChapter(finalChapterSlug, titleClean);

      const finalCategory = categoryName.trim().toLowerCase().replace(/\s+/g, "-") || "memoria";

      const finalFeeling = feeling || null;

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

      await create.mutateAsync({
        title: title.trim(),
        raw_text: raw.trim() || null,
        story_text: raw.trim() as string,
        category: finalCategory,
        feeling: finalFeeling,
        happened_on: date,
        place: [place.trim(), time ? `${time}h` : null].filter(Boolean).join(" · ") || null,
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
            <Label htmlFor="relato">Relato do momento (Sua história escrita com suas palavras)</Label>
            <Textarea
              id="relato"
              value={raw}
              maxLength={3000}
              onChange={(e) => setRaw(e.target.value)}
              placeholder="Escreva com detalhes e emoção como foi esse dia especial..."
              className="min-h-36 rounded-xl border-border bg-background font-sans text-base leading-relaxed"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="capitulo">Fase / Capítulo</Label>
                <button
                  type="button"
                  onClick={() => setIsCreatingChapter(!isCreatingChapter)}
                  className="text-xs text-gold hover:underline font-medium flex items-center gap-1"
                >
                  <Plus className="size-3" />
                  {isCreatingChapter ? "Cancelar" : "Nova Fase"}
                </button>
              </div>

              {isCreatingChapter && (
                <div className="flex gap-2 p-2 rounded-xl bg-secondary/80 border border-gold/40 animate-[var(--animate-fade)]">
                  <Input
                    value={newChapterTitle}
                    onChange={(e) => setNewChapterTitle(e.target.value)}
                    placeholder="Ex: 1º Aninho, Nascimento..."
                    className="h-8 text-xs bg-background"
                  />
                  <Button
                    type="button"
                    size="sm"
                    disabled={!newChapterTitle.trim() || upsertChapter.isPending}
                    onClick={async () => {
                      const titleClean = newChapterTitle.trim();
                      const slug = titleClean.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `cap-${Date.now()}`;
                      await upsertChapter.mutateAsync({ slug, title: titleClean });
                      setChapterName(titleClean);
                      setNewChapterTitle("");
                      setIsCreatingChapter(false);
                      toast.success("Fase criada!");
                    }}
                    className="h-8 px-3 rounded-lg bg-gold text-white text-xs hover:bg-gold/90 shrink-0"
                  >
                    {upsertChapter.isPending ? <Loader2 className="size-3 animate-spin" /> : "Criar"}
                  </Button>
                </div>
              )}

              <div className="flex flex-wrap gap-1.5 pt-1">
                {allChapters.map((c) => (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => setChapterName(c.title)}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs transition-all duration-200",
                      chapterName === c.title
                        ? "border-gold bg-gold text-white font-medium shadow-sm"
                        : "border-border bg-secondary/40 text-muted-foreground hover:border-gold/50 hover:text-foreground"
                    )}
                  >
                    {c.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="categoria">Categoria</Label>
                <button
                  type="button"
                  onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                  className="text-xs text-gold hover:underline font-medium flex items-center gap-1"
                >
                  <Plus className="size-3" />
                  {isCreatingCategory ? "Cancelar" : "Nova Categoria"}
                </button>
              </div>

              {isCreatingCategory && (
                <div className="flex gap-2 p-2 rounded-xl bg-secondary/80 border border-gold/40 animate-[var(--animate-fade)]">
                  <Input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Ex: Comemoração, Médico..."
                    className="h-8 text-xs bg-background"
                  />
                  <Button
                    type="button"
                    size="sm"
                    disabled={!newCategoryName.trim() || upsertCategory.isPending}
                    onClick={async () => {
                      const nameClean = newCategoryName.trim();
                      await upsertCategory.mutateAsync({ name: nameClean });
                      setCategoryName(nameClean);
                      setNewCategoryName("");
                      setIsCreatingCategory(false);
                      toast.success("Categoria criada!");
                    }}
                    className="h-8 px-3 rounded-lg bg-gold text-white text-xs hover:bg-gold/90 shrink-0"
                  >
                    {upsertCategory.isPending ? <Loader2 className="size-3 animate-spin" /> : "Criar"}
                  </Button>
                </div>
              )}

              <div className="flex flex-wrap gap-1.5 pt-1">
                {Array.from(new Set([
                  "Geral", "Maternidade", "Primeira Vez", "Família", "Mesversário", "Ultrassom", "Passeio", "Engraçado",
                  ...(dbCategories?.map((c) => c.name) || [])
                ])).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryName(cat)}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs transition-all duration-200 capitalize",
                      categoryName.toLowerCase() === cat.toLowerCase()
                        ? "border-gold bg-gold text-white font-medium shadow-sm"
                        : "border-border bg-secondary/40 text-muted-foreground hover:border-gold/50 hover:text-foreground"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
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
                <Label htmlFor="hora">Hora (Opcional)</Label>
                <Input
                  id="hora"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="rounded-xl bg-background"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="local">Local</Label>
              <Input
                id="local"
                value={place}
                maxLength={120}
                onChange={(e) => setPlace(e.target.value)}
                placeholder="Ex: Casa da vovó, Maternidade..."
                className="rounded-xl bg-background"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Sentimento</Label>
              <button
                type="button"
                onClick={() => setIsCreatingFeeling(!isCreatingFeeling)}
                className="text-xs text-gold hover:underline font-medium flex items-center gap-1"
              >
                <Plus className="size-3" />
                {isCreatingFeeling ? "Cancelar" : "Outro sentimento"}
              </button>
            </div>

            {isCreatingFeeling && (
              <div className="flex gap-2 p-2 rounded-xl bg-secondary/80 border border-gold/40 animate-[var(--animate-fade)]">
                <Input
                  value={newFeelingLabel}
                  onChange={(e) => setNewFeelingLabel(e.target.value)}
                  placeholder="Ex: Encantada, Grata, Em paz..."
                  className="h-8 text-xs bg-background"
                />
                <Button
                  type="button"
                  size="sm"
                  disabled={!newFeelingLabel.trim() || upsertFeeling.isPending}
                  onClick={async () => {
                    const labelClean = newFeelingLabel.trim();
                    await upsertFeeling.mutateAsync({ label: labelClean, emoji: "" });
                    setFeeling(labelClean);
                    setNewFeelingLabel("");
                    setIsCreatingFeeling(false);
                    toast.success("Sentimento criado!");
                  }}
                  className="h-8 px-3 rounded-lg bg-gold text-white text-xs hover:bg-gold/90 shrink-0"
                >
                  {upsertFeeling.isPending ? <Loader2 className="size-3 animate-spin" /> : "Criar"}
                </Button>
              </div>
            )}

            <div className="flex flex-wrap gap-1.5 pt-1">
              {Array.from(new Set([
                ...FEELINGS.map((f) => f.label),
                ...(dbFeelings?.map((f) => f.label) || [])
              ])).map((fLabel) => (
                <button
                  key={fLabel}
                  type="button"
                  onClick={() => setFeeling(feeling === fLabel ? null : fLabel)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs transition-all duration-200",
                    feeling === fLabel
                      ? "border-gold bg-gold text-white font-medium shadow-sm"
                      : "border-border bg-secondary/40 text-muted-foreground hover:border-gold/50 hover:text-foreground"
                  )}
                >
                  {fLabel}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (Palavras-chave)</Label>
            <Input
              id="tags"
              value={tags}
              maxLength={200}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Ex: família, verão, primeiro ano (separe por vírgulas)"
              className="rounded-xl bg-background text-sm"
            />
            <div className="flex flex-wrap gap-1 pt-1">
              <span className="text-[11px] text-muted-foreground self-center mr-1">Sugestões:</span>
              {Array.from(new Set([
                "família", "primeira vez", "verão", "amor", "sorriso", "passeio", "casa", "especial",
                ...(dbMoments.flatMap((m) => m.tags || []))
              ])).slice(0, 12).map((t) => {
                const currentList = tags.split(",").map((s) => s.trim()).filter(Boolean);
                const isSelected = currentList.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setTags(currentList.filter((item) => item !== t).join(", "));
                      } else {
                        setTags([...currentList, t].join(", "));
                      }
                    }}
                    className={cn(
                      "rounded-md border px-2 py-0.5 text-[11px] transition-colors",
                      isSelected
                        ? "border-gold/60 bg-gold-soft/30 text-gold font-medium"
                        : "border-border/60 bg-secondary/30 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {isSelected ? `✓ ${t}` : `+ ${t}`}
                  </button>
                );
              })}
            </div>
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

            {/* Vídeos (Destaque 5s) */}
            <div className="space-y-3 rounded-2xl border border-gold/30 bg-gold-soft/10 p-5">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-base font-medium text-foreground">
                  <Video className="size-4 text-gold" />
                  <span>Vídeo em Destaque (Trecho de 5 segundos)</span>
                </Label>
                <span className="text-[10px] tracking-wider uppercase font-semibold bg-gold/20 text-gold px-2.5 py-0.5 rounded-full">
                  Link no PDF
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Suba qualquer vídeo da sua galeria. Para manter a experiência editorial leve e marcante como um livro interativo sem restrições, o sistema destaca os 5 segundos mais especiais da memória, gerando automaticamente o link de visualização no livro e no PDF exportado.
              </p>

              <div className="space-y-3 pt-2">
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background/80 px-4 py-4 text-xs text-muted-foreground transition-colors hover:border-gold/60 font-medium">
                  <Video className="size-4 text-gold" strokeWidth={1.5} />
                  <span>Anexar vídeo da galeria (Selecione o trecho de 5s)</span>
                  <input
                    type="file"
                    accept="video/*"
                    multiple
                    className="hidden"
                    onChange={async (e) => {
                      const list = Array.from(e.target.files ?? []);
                      const validFiles = await Promise.all(
                        list.map(async (file) => {
                          const url = URL.createObjectURL(file);
                          const video = document.createElement('video');
                          video.preload = 'metadata';
                          video.src = url;
                          await new Promise((resolve) => {
                            video.onloadedmetadata = () => resolve(null);
                          });
                          const duration = video.duration;
                          URL.revokeObjectURL(url);
                          if (duration > 5) {
                            toast.error('O vídeo deve ter no máximo 5 segundos.');
                            return null;
                          }
                          return { file, preview: url };
                        })
                      );
                      setVideoFiles((prev) => [...prev, ...validFiles.filter(Boolean)]);
                    }}
                  />
                </label>
                {videoFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {videoFiles.map((f, i) => (
                      <div key={i} className="relative size-20 overflow-hidden rounded-xl border bg-black shadow-sm">
                        <video src={f.preview} className="size-full object-cover" />
                        <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">Highlight 5s</span>
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

