import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Check, X, ArrowUp, ArrowDown, BookOpen, Tag, Smile } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  useCustomChapters,
  useUpsertChapter,
  useDeleteChapter,
  useCustomCategories,
  useUpsertCategory,
  useDeleteCategory,
  useCustomFeelings,
  useUpsertFeeling,
  useDeleteFeeling,
} from "@/hooks/useLibrary";
import { getAllChapters, type ChapterDef } from "@/lib/chapters";
import { cn } from "@/lib/utils";

type Props = { open: boolean; onOpenChange: (open: boolean) => void; defaultTab?: "chapters" | "categories" | "feelings" };

export function ChapterManagerDialog({ open, onOpenChange, defaultTab = "chapters" }: Props) {
  const [tab, setTab] = useState<"chapters" | "categories" | "feelings">(defaultTab);

  useEffect(() => {
    if (open && defaultTab) setTab(defaultTab);
  }, [open, defaultTab]);

  // --- CHAPTERS STATE ---
  const { data: dbChapters } = useCustomChapters();
  const allChapters = getAllChapters(undefined, dbChapters);
  const upsertChapter = useUpsertChapter();
  const removeChapter = useDeleteChapter();

  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSubtitle, setEditSubtitle] = useState("");
  const [isCreatingChapter, setIsCreatingChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [newChapterSubtitle, setNewChapterSubtitle] = useState("");

  // --- CATEGORIES STATE ---
  const { data: categories = [] } = useCustomCategories();
  const upsertCategory = useUpsertCategory();
  const deleteCategory = useDeleteCategory();
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState("");
  const [isCreatingCat, setIsCreatingCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  // --- FEELINGS STATE ---
  const { data: feelings = [] } = useCustomFeelings();
  const upsertFeeling = useUpsertFeeling();
  const deleteFeeling = useDeleteFeeling();
  const [editingFeeling, setEditingFeeling] = useState<string | null>(null);
  const [editFeelingLabel, setEditFeelingLabel] = useState("");
  const [editFeelingEmoji, setEditFeelingEmoji] = useState("");
  const [isCreatingFeeling, setIsCreatingFeeling] = useState(false);
  const [newFeelingLabel, setNewFeelingLabel] = useState("");
  const [newFeelingEmoji, setNewFeelingEmoji] = useState("");

  // --- CHAPTERS HANDLERS ---
  async function handleCreateChapter() {
    if (!newChapterTitle.trim()) {
      toast.error("O título do capítulo é obrigatório.");
      return;
    }
    const slug = newChapterTitle
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || `capitulo-${Date.now()}`;

    await upsertChapter.mutateAsync({
      slug,
      title: newChapterTitle.trim(),
      subtitle: newChapterSubtitle.trim() || "Uma nova fase da nossa história.",
      position: allChapters.length * 10 + 100,
    });
    toast.success("Capítulo adicionado com sucesso!");
    setNewChapterTitle("");
    setNewChapterSubtitle("");
    setIsCreatingChapter(false);
  }

  async function handleSaveEditChapter(slug: string, pos: number) {
    if (!editTitle.trim()) {
      toast.error("O título não pode ficar em branco.");
      return;
    }
    await upsertChapter.mutateAsync({
      slug,
      title: editTitle.trim(),
      subtitle: editSubtitle.trim(),
      position: pos,
    });
    toast.success("Capítulo atualizado!");
    setEditingSlug(null);
  }

  async function handleDeleteChapter(slug: string) {
    if (!confirm("Deseja realmente ocultar/excluir este capítulo?")) return;
    await removeChapter.mutateAsync(slug);
    toast.success("Capítulo excluído!");
  }

  async function handleMoveChapter(index: number, direction: "up" | "down") {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= allChapters.length) return;
    const current = allChapters[index];
    const target = allChapters[targetIdx];
    await upsertChapter.mutateAsync({ slug: current.slug, title: current.title, subtitle: current.subtitle, position: target.index });
    await upsertChapter.mutateAsync({ slug: target.slug, title: target.title, subtitle: target.subtitle, position: current.index });
    toast.success("Ordem atualizada!");
  }

  // --- CATEGORIES HANDLERS ---
  async function handleCreateCat() {
    if (!newCatName.trim()) {
      toast.error("Digite o nome da categoria.");
      return;
    }
    await upsertCategory.mutateAsync({ name: newCatName.trim() });
    toast.success("Categoria salva!");
    setNewCatName("");
    setIsCreatingCat(false);
  }

  async function handleSaveEditCat(oldName: string) {
    if (!editCatName.trim()) return;
    await upsertCategory.mutateAsync({ name: editCatName.trim(), oldName });
    toast.success("Categoria atualizada!");
    setEditingCat(null);
  }

  async function handleDeleteCat(name: string) {
    if (!confirm(`Excluir a categoria "${name}"?`)) return;
    await deleteCategory.mutateAsync(name);
    toast.success("Categoria excluída!");
  }

  // --- FEELINGS HANDLERS ---
  async function handleCreateFeeling() {
    if (!newFeelingLabel.trim() || !newFeelingEmoji.trim()) {
      toast.error("Preencha o emoji e o sentimento.");
      return;
    }
    await upsertFeeling.mutateAsync({ label: newFeelingLabel.trim(), emoji: newFeelingEmoji.trim() });
    toast.success("Sentimento salvo!");
    setNewFeelingLabel("");
    setNewFeelingEmoji("✨");
    setIsCreatingFeeling(false);
  }

  async function handleSaveEditFeeling(oldLabel: string) {
    if (!editFeelingLabel.trim()) return;
    await upsertFeeling.mutateAsync({ label: editFeelingLabel.trim(), emoji: editFeelingEmoji.trim() || "✨", oldLabel });
    toast.success("Sentimento atualizado!");
    setEditingFeeling(null);
  }

  async function handleDeleteFeeling(label: string) {
    if (!confirm(`Excluir o sentimento "${label}"?`)) return;
    await deleteFeeling.mutateAsync(label);
    toast.success("Sentimento excluído!");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto rounded-3xl border-border bg-paper p-0">
        <div className="px-7 pt-8 pb-2">
          <DialogHeader>
            <p className="label-eyebrow flex items-center gap-1.5 text-gold">
              <BookOpen className="size-3.5" />
              <span>Personalização 100% Livre</span>
            </p>
            <DialogTitle className="font-display text-3xl font-light tracking-tight">
              Gerenciar Capítulos, Categorias e Emoções
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Tenha total controle dos elementos do seu livro. Crie, edite e exclua facilmente qualquer item.
            </DialogDescription>
          </DialogHeader>

          {/* TABS */}
          <div className="flex gap-1.5 mt-5 border-b border-border/60 pb-3">
            <button
              type="button"
              onClick={() => setTab("chapters")}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-all",
                tab === "chapters" ? "bg-gold text-foreground shadow-sm" : "bg-secondary/70 text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <BookOpen className="size-3.5" />
              <span>Capítulos ({allChapters.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setTab("categories")}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-all",
                tab === "categories" ? "bg-gold text-foreground shadow-sm" : "bg-secondary/70 text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Tag className="size-3.5" />
              <span>Categorias ({categories.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setTab("feelings")}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-all",
                tab === "feelings" ? "bg-gold text-foreground shadow-sm" : "bg-secondary/70 text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Smile className="size-3.5" />
              <span>Sentimentos ({feelings.length})</span>
            </button>
          </div>
        </div>

        <div className="space-y-4 px-7 pb-8 pt-2">
          {/* TAB 1: CHAPTERS */}
          {tab === "chapters" && (
            <div className="space-y-4">
              <div className="space-y-3">
                {allChapters.map((chapter, idx) => (
                  <div key={chapter.slug} className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-background/60 p-4 transition-all hover:border-gold/50">
                    {editingSlug === chapter.slug ? (
                      <div className="space-y-3 animate-[var(--animate-fade)]">
                        <div className="space-y-1">
                          <Label className="text-xs">Título do Capítulo</Label>
                          <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="rounded-xl" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Subtítulo poético (Legenda da Capa)</Label>
                          <Input value={editSubtitle} onChange={(e) => setEditSubtitle(e.target.value)} className="rounded-xl" />
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                          <Button size="sm" variant="ghost" onClick={() => setEditingSlug(null)} className="rounded-full text-xs">
                            <X className="size-3 mr-1" /> Cancelar
                          </Button>
                          <Button size="sm" onClick={() => handleSaveEditChapter(chapter.slug, chapter.index)} className="rounded-full bg-gold px-4 text-xs text-foreground">
                            <Check className="size-3 mr-1" /> Salvar Alteração
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-display text-lg font-medium tracking-tight text-foreground truncate">{chapter.title}</h4>
                          <p className="text-xs text-muted-foreground italic truncate">{chapter.subtitle}</p>
                          <button
                            type="button"
                            onClick={() => {
                              onOpenChange(false);
                              window.dispatchEvent(new CustomEvent("open-moment-dialog", { detail: { chapter: chapter.title } }));
                            }}
                            className="inline-flex items-center gap-1 text-[11px] text-gold hover:underline font-medium mt-1.5"
                          >
                            <Plus className="size-3" /> Adicionar página nesta fase
                          </button>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button type="button" onClick={() => handleMoveChapter(idx, "up")} disabled={idx === 0} className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary disabled:opacity-30" title="Mover para cima">
                            <ArrowUp className="size-4" />
                          </button>
                          <button type="button" onClick={() => handleMoveChapter(idx, "down")} disabled={idx === allChapters.length - 1} className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary disabled:opacity-30" title="Mover para baixo">
                            <ArrowDown className="size-4" />
                          </button>
                          <button type="button" onClick={() => { setEditingSlug(chapter.slug); setEditTitle(chapter.title); setEditSubtitle(chapter.subtitle); }} className="p-1.5 rounded-lg text-muted-foreground hover:bg-gold-soft/40 hover:text-gold transition-colors" title="Editar nome/subtítulo">
                            <Edit2 className="size-4" />
                          </button>
                          <button type="button" onClick={() => handleDeleteChapter(chapter.slug)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors" title="Excluir / Ocultar capítulo">
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {!isCreatingChapter ? (
                <Button onClick={() => { setIsCreatingChapter(true); setNewChapterTitle(""); setNewChapterSubtitle(""); }} className="w-full rounded-2xl border border-dashed border-gold/60 bg-gold-soft/10 py-6 text-sm font-medium text-gold hover:bg-gold-soft/20 shadow-none transition-all">
                  <Plus className="size-4 mr-2" /> Criar Novo Capítulo / Época
                </Button>
              ) : (
                <div className="space-y-3 rounded-2xl border border-gold/50 bg-gold-soft/20 p-5 animate-[var(--animate-rise)]">
                  <h5 className="font-display text-base font-medium text-foreground">Nova Época / Fase</h5>
                  <div className="space-y-1">
                    <Label className="text-xs">Nome do Capítulo (Ex: O Primeiro Aniversário, Férias de 2026...)</Label>
                    <Input value={newChapterTitle} onChange={(e) => setNewChapterTitle(e.target.value)} placeholder="Digite o nome do capítulo..." className="rounded-xl bg-background" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Subtítulo poético (Capa do Capítulo)</Label>
                    <Input value={newChapterSubtitle} onChange={(e) => setNewChapterSubtitle(e.target.value)} placeholder="Uma legenda ou frase poética..." className="rounded-xl bg-background" />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button size="sm" variant="ghost" onClick={() => setIsCreatingChapter(false)} className="rounded-full text-xs">Cancelar</Button>
                    <Button size="sm" onClick={handleCreateChapter} className="rounded-full bg-gold px-5 text-xs text-foreground shadow-[var(--shadow-paper)]">
                      <Check className="size-3 mr-1" /> Salvar Capítulo
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CATEGORIES */}
          {tab === "categories" && (
            <div className="space-y-4">
              <div className="space-y-2">
                {categories.map((cat) => (
                  <div key={cat} className="flex items-center justify-between rounded-2xl border border-border/80 bg-background/60 p-3.5 transition-all hover:border-gold/50">
                    {editingCat === cat ? (
                      <div className="flex items-center gap-2 flex-1 animate-[var(--animate-fade)]">
                        <Input value={editCatName} onChange={(e) => setEditCatName(e.target.value)} className="rounded-xl h-9 text-sm flex-1" />
                        <Button size="sm" variant="ghost" onClick={() => setEditingCat(null)} className="rounded-full px-2.5 h-8 text-xs"><X className="size-3.5" /></Button>
                        <Button size="sm" onClick={() => handleSaveEditCat(cat)} className="rounded-full bg-gold px-3 h-8 text-xs text-foreground"><Check className="size-3.5 mr-1" /> Salvar</Button>
                      </div>
                    ) : (
                      <>
                        <span className="font-display text-base text-foreground font-medium pl-1">{cat}</span>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => { setEditingCat(cat); setEditCatName(cat); }} className="p-1.5 rounded-lg text-muted-foreground hover:bg-gold-soft/40 hover:text-gold transition-colors" title="Editar Categoria">
                            <Edit2 className="size-4" />
                          </button>
                          <button type="button" onClick={() => handleDeleteCat(cat)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors" title="Excluir Categoria">
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {!isCreatingCat ? (
                <Button onClick={() => { setIsCreatingCat(true); setNewCatName(""); }} className="w-full rounded-2xl border border-dashed border-gold/60 bg-gold-soft/10 py-5 text-sm font-medium text-gold hover:bg-gold-soft/20 shadow-none transition-all">
                  <Plus className="size-4 mr-2" /> Criar Nova Categoria 100% Personalizada
                </Button>
              ) : (
                <div className="space-y-3 rounded-2xl border border-gold/50 bg-gold-soft/20 p-4 animate-[var(--animate-rise)]">
                  <Label className="text-xs font-medium">Nome da Categoria (Ex: Mesversário, Banho, Viagem...)</Label>
                  <div className="flex gap-2">
                    <Input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Digite o nome..." className="rounded-xl bg-background flex-1" />
                    <Button size="sm" variant="ghost" onClick={() => setIsCreatingCat(false)} className="rounded-full text-xs">Cancelar</Button>
                    <Button size="sm" onClick={handleCreateCat} className="rounded-full bg-gold px-4 text-xs text-foreground"><Check className="size-3 mr-1" /> Salvar</Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FEELINGS */}
          {tab === "feelings" && (
            <div className="space-y-4">
              <div className="space-y-2">
                {feelings.map((f) => (
                  <div key={f.label} className="flex items-center justify-between rounded-2xl border border-border/80 bg-background/60 p-3.5 transition-all hover:border-gold/50">
                    {editingFeeling === f.label ? (
                      <div className="flex items-center gap-2 flex-1 animate-[var(--animate-fade)]">
                        <Input value={editFeelingEmoji} onChange={(e) => setEditFeelingEmoji(e.target.value)} className="rounded-xl h-9 w-14 text-center text-base" placeholder="😊" />
                        <Input value={editFeelingLabel} onChange={(e) => setEditFeelingLabel(e.target.value)} className="rounded-xl h-9 text-sm flex-1" placeholder="Sentimento..." />
                        <Button size="sm" variant="ghost" onClick={() => setEditingFeeling(null)} className="rounded-full px-2 h-8 text-xs"><X className="size-3.5" /></Button>
                        <Button size="sm" onClick={() => handleSaveEditFeeling(f.label)} className="rounded-full bg-gold px-3 h-8 text-xs text-foreground"><Check className="size-3.5 mr-1" /> Salvar</Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 pl-1">
                          <span className="text-xl">{f.emoji}</span>
                          <span className="font-display text-base text-foreground font-medium">{f.label}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => { setEditingFeeling(f.label); setEditFeelingLabel(f.label); setEditFeelingEmoji(f.emoji); }} className="p-1.5 rounded-lg text-muted-foreground hover:bg-gold-soft/40 hover:text-gold transition-colors" title="Editar Sentimento">
                            <Edit2 className="size-4" />
                          </button>
                          <button type="button" onClick={() => handleDeleteFeeling(f.label)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors" title="Excluir Sentimento">
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {!isCreatingFeeling ? (
                <Button onClick={() => { setIsCreatingFeeling(true); setNewFeelingLabel(""); setNewFeelingEmoji("✨"); }} className="w-full rounded-2xl border border-dashed border-gold/60 bg-gold-soft/10 py-5 text-sm font-medium text-gold hover:bg-gold-soft/20 shadow-none transition-all">
                  <Plus className="size-4 mr-2" /> Criar Novo Sentimento / Emoção
                </Button>
              ) : (
                <div className="space-y-3 rounded-2xl border border-gold/50 bg-gold-soft/20 p-4 animate-[var(--animate-rise)]">
                  <Label className="text-xs font-medium">Novo Sentimento (Emoji + Nome)</Label>
                  <div className="flex gap-2 items-center">
                    <Input value={newFeelingEmoji} onChange={(e) => setNewFeelingEmoji(e.target.value)} className="rounded-xl bg-background w-16 text-center text-lg" placeholder="🥰" />
                    <Input value={newFeelingLabel} onChange={(e) => setNewFeelingLabel(e.target.value)} placeholder="Ex: Apaixonada, Abençoada, Em paz..." className="rounded-xl bg-background flex-1" />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <Button size="sm" variant="ghost" onClick={() => setIsCreatingFeeling(false)} className="rounded-full text-xs">Cancelar</Button>
                    <Button size="sm" onClick={handleCreateFeeling} className="rounded-full bg-gold px-4 text-xs text-foreground"><Check className="size-3 mr-1" /> Salvar Sentimento</Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
