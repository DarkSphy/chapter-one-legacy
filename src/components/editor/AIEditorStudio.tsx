import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Sparkles, ImagePlus, X, Loader2, Send, Check, Calendar, MapPin, BookOpen, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useChild, useCreateMoment, useUpsertChapter } from "@/hooks/useLibrary";
import { uploadFile } from "@/services/library";
import { draftLiteraryPage, refineWithEditor, type EditorialPageDraft } from "@/services/ai/editorEngine";
import { cn } from "@/lib/utils";

type Props = { open: boolean; onOpenChange: (open: boolean) => void; defaultChapter?: string };

export function AIEditorStudio({ open, onOpenChange, defaultChapter }: Props) {
  const { data: child } = useChild();
  const create = useCreateMoment(child?.id ?? null);
  const upsertChapter = useUpsertChapter();

  // Etapa do fluxo: 1 = Inspiração / Texto Bruto, 2 = Lapidação & Prosa IA
  const [step, setStep] = useState<1 | 2>(1);
  const [rawText, setRawText] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [place, setPlace] = useState("");
  
  // Fotos / Mídias
  const [files, setFiles] = useState<{ file: File; preview: string }[]>([]);
  
  // Estado da Editora IA
  const [isDrafting, setIsDrafting] = useState(false);
  const [draft, setDraft] = useState<EditorialPageDraft | null>(null);
  const [refinementPrompt, setRefinementPrompt] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    if (!open) {
      setTimeout(() => resetStudio(), 300);
    }
  }, [open]);

  function resetStudio() {
    setStep(1);
    setRawText("");
    setDate(new Date().toISOString().slice(0, 10));
    setPlace("");
    files.forEach((f) => URL.revokeObjectURL(f.preview));
    setFiles([]);
    setDraft(null);
    setRefinementPrompt("");
    setIsDrafting(false);
    setIsRefining(false);
    setIsPublishing(false);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const added = Array.from(e.target.files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setFiles((prev) => [...prev, ...added].slice(0, 10));
  }

  function removeFile(index: number) {
    setFiles((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[index].preview);
      copy.splice(index, 1);
      return copy;
    });
  }

  async function handleDraftAI() {
    if (!rawText.trim() && files.length === 0) {
      toast.error("Compartilhe pelo menos uma lembrança ou foto com a Editora IA.");
      return;
    }
    setIsDrafting(true);
    try {
      const result = await draftLiteraryPage(rawText || "Uma nova lembrança fotográfica em família", date, place);
      if (defaultChapter) {
        result.chapter_title = defaultChapter;
      }
      setDraft(result);
      setStep(2);
      toast.success("A Editora IA diagramou o seu capítulo!");
    } catch (err) {
      toast.error("Ocorreu um erro ao consultar a Editora IA.");
    } finally {
      setIsDrafting(false);
    }
  }

  async function handleRefine() {
    if (!draft || !refinementPrompt.trim()) return;
    setIsRefining(true);
    try {
      const updated = await refineWithEditor(draft, refinementPrompt);
      setDraft(updated);
      setRefinementPrompt("");
      toast.success("O texto foi polido e atualizado com sucesso!");
    } catch (err) {
      toast.error("Erro ao refinar o texto.");
    } finally {
      setIsRefining(false);
    }
  }

  async function handlePublishToBook() {
    if (!draft) return;
    setIsPublishing(true);
    try {
      // 1. Registrar ou garantir o capítulo no banco
      const slug = draft.chapter_title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || `cap-${Date.now()}`;
      await upsertChapter.mutateAsync({ slug, title: draft.chapter_title });

      // 2. Upload de fotografias
      const uploaded: { url: string; media_type: "photo" | "video" }[] = [];
      for (const item of files) {
        const path = await uploadFile(item.file);
        uploaded.push({ url: path, media_type: "photo" });
      }

      // 3. Criar a Página (Moment)
      await create.mutateAsync({
        title: draft.title,
        raw_text: rawText.trim() || null,
        story_text: draft.story_text,
        category: draft.chapter_title.toLowerCase().replace(/\s+/g, "-"),
        feeling: draft.feeling,
        happened_on: draft.happened_on,
        place: draft.place || null,
        tags: draft.tags,
        chapter_slug: slug,
        cover_url: uploaded[0]?.url ?? null,
        media: uploaded as never,
      });

      toast.success("🎉 Nova página literária eterna adicionada ao Livro!");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não conseguimos publicar a página.");
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl border border-border/80 bg-paper p-0 shadow-sheet selection:bg-gold/20">
        {/* Cabeçalho do Estúdio */}
        <div className="px-8 pt-8 pb-5 border-b border-border/40 bg-secondary/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-obsidian text-gold flex items-center justify-center shadow-sm">
              <Sparkles className="size-5 animate-pulse" />
            </div>
            <div>
              <DialogTitle className="font-display text-2xl font-bold text-foreground">
                {step === 1 ? "Estúdio da Editora IA" : "Revisão e Lapidação Literária"}
              </DialogTitle>
              <DialogDescription className="text-xs font-sans text-muted-foreground tracking-wide mt-0.5">
                {step === 1
                  ? "Compartilhe uma memória, áudio ou ideia bruta. A IA transforma em um capítulo de livro."
                  : "Converse com a Editora para ajustar o tom poético da página antes de encadernar."}
              </DialogDescription>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* ETAPA 1: A Inspiração Bruta */}
        {step === 1 && (
          <div className="p-8 space-y-6 animate-fade">
            <div className="space-y-2">
              <label className="block font-display text-lg text-foreground font-semibold">
                O que aconteceu que merece se tornar eterno?
              </label>
              <Textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Ex: Hoje estávamos na sala da vovó e o Miguel deu seus primeiros três passos sem apoio! Todo mundo gritou de emoção e ele riu muito caindo sentado no tapete..."
                className="min-h-[140px] rounded-2xl border-border bg-background/50 p-4 font-sans text-base leading-relaxed focus:border-gold/60 focus:ring-1 focus:ring-gold/30 transition-all shadow-inner"
              />
            </div>

            {/* Fotografia / Memória Visual */}
            <div className="space-y-3">
              <label className="flex items-center justify-between font-display text-base font-medium text-foreground">
                <span>Fotografias do Capítulo</span>
                <span className="text-xs font-sans text-muted-foreground">{files.length} selecionada(s)</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {files.map((item, idx) => (
                  <div key={idx} className="group relative aspect-square rounded-2xl overflow-hidden border border-border shadow-sm bg-background">
                    <img src={item.preview} alt="Prévia" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="absolute top-2 right-2 size-7 rounded-full bg-obsidian/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ))}

                <label className="aspect-square rounded-2xl border-2 border-dashed border-gold/40 bg-gold-soft/20 hover:bg-gold-soft/40 transition-colors flex flex-col items-center justify-center cursor-pointer text-gold p-4 text-center group">
                  <ImagePlus className="size-6 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium">Anexar Fotos</span>
                  <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
            </div>

            {/* Contexto Minimalista (Data e Local) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/40">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-secondary/40 border border-border/60">
                <Calendar className="size-4 text-gold shrink-0" />
                <span className="text-xs text-muted-foreground">Quando:</span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-transparent text-sm font-medium text-foreground focus:outline-none flex-1"
                />
              </div>

              <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-secondary/40 border border-border/60">
                <MapPin className="size-4 text-gold shrink-0" />
                <span className="text-xs text-muted-foreground">Onde:</span>
                <input
                  type="text"
                  value={place}
                  onChange={(e) => setPlace(e.target.value)}
                  placeholder="Ex: Casa dos avós, Praia..."
                  className="bg-transparent text-sm font-medium text-foreground focus:outline-none flex-1 placeholder:text-muted-foreground/60"
                />
              </div>
            </div>

            {/* Botão Principal */}
            <div className="pt-4 flex justify-end">
              <Button
                type="button"
                disabled={isDrafting || (!rawText.trim() && files.length === 0)}
                onClick={handleDraftAI}
                className="h-13 px-8 rounded-full bg-obsidian text-paper font-sans text-sm font-semibold tracking-wide shadow-book hover:bg-gold hover:text-obsidian transition-all duration-300 w-full sm:w-auto flex items-center justify-center gap-2.5 group"
              >
                {isDrafting ? (
                  <>
                    <Loader2 className="size-4 animate-spin text-gold" />
                    <span>A Editora IA está diagramando...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4 text-gold group-hover:scale-125 transition-transform" />
                    <span>Deixar a Editora IA Escrever a Página</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* ETAPA 2: A Página Diagramada (Prontuário Literário) */}
        {step === 2 && draft && (
          <div className="p-8 space-y-7 animate-fade">
            {/* Visualização de Livro Aberto (Card Editorial) */}
            <div className="surface-paper rounded-3xl p-7 border border-gold-border/60 relative overflow-hidden shadow-book">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-soft text-gold text-xs font-semibold tracking-wider uppercase border border-gold/30">
                  <BookOpen className="size-3" />
                  {draft.chapter_title}
                </span>
                <span className="text-xs font-serif italic text-muted-foreground">
                  {new Date(draft.happened_on + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                  {draft.place ? ` · ${draft.place}` : ""}
                </span>
              </div>

              {/* Título Literário */}
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-obsidian tracking-tight leading-tight mb-4">
                {draft.title}
              </h2>

              {/* Prosa Literária */}
              <div className="font-serif text-base sm:text-lg text-foreground/90 leading-relaxed whitespace-pre-line border-l-2 border-gold/40 pl-5 py-1 mb-6">
                {draft.story_text}
              </div>

              {/* Fotos Anexadas na Página */}
              {files.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-4 border-t border-border/40">
                  {files.map((item, idx) => (
                    <img key={idx} src={item.preview} alt="Memória" className="aspect-square rounded-xl object-cover border border-border shadow-xs" />
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-1.5 mt-5">
                <span className="text-[11px] font-sans px-2.5 py-0.5 rounded-md bg-secondary text-muted-foreground">
                  Sentimento: {draft.feeling}
                </span>
                {draft.tags.map((tag) => (
                  <span key={tag} className="text-[11px] font-sans px-2.5 py-0.5 rounded-md bg-secondary/60 text-muted-foreground/80">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Chat com a Editora IA (Refinamento) */}
            <div className="p-4 rounded-2xl bg-secondary/50 border border-border space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-obsidian">
                <Sparkles className="size-3.5 text-gold" />
                <span>Converse com a Editora IA para ajustar o texto</span>
              </label>
              <div className="flex gap-2">
                <Input
                  value={refinementPrompt}
                  onChange={(e) => setRefinementPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRefine()}
                  placeholder="Ex: 'Deixe o tom mais poético', 'Mencione como o vovô sorriu', 'Deixe mais curto'..."
                  className="rounded-xl bg-background border-border text-sm flex-1"
                />
                <Button
                  type="button"
                  size="icon"
                  disabled={isRefining || !refinementPrompt.trim()}
                  onClick={handleRefine}
                  className="size-10 rounded-xl bg-obsidian text-paper hover:bg-gold hover:text-obsidian shrink-0 transition-colors"
                >
                  {isRefining ? <Loader2 className="size-4 animate-spin text-gold" /> : <Send className="size-4" />}
                </Button>
              </div>
            </div>

            {/* Ações Finais: Voltar ou Publicar */}
            <div className="flex items-center justify-between gap-4 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="rounded-full px-6 text-xs font-medium hover:bg-secondary"
              >
                <RefreshCw className="size-3.5 mr-1.5" />
                Voltar e editar inspiração
              </Button>

              <Button
                type="button"
                disabled={isPublishing}
                onClick={handlePublishToBook}
                className="h-12 px-8 rounded-full bg-gold text-white font-sans text-sm font-bold tracking-wide shadow-book hover:bg-gold-bright transition-all duration-300 flex items-center gap-2 group"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Encadernando página...</span>
                  </>
                ) : (
                  <>
                    <Check className="size-4 stroke-[2.5]" />
                    <span>Encadernar e Publicar no Livro</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
