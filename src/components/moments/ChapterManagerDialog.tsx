import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Check, X, ArrowUp, ArrowDown, BookOpen } from "lucide-react";
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
import { useCustomChapters, useUpsertChapter, useDeleteChapter } from "@/hooks/useLibrary";
import { getAllChapters, type ChapterDef } from "@/lib/chapters";

type Props = { open: boolean; onOpenChange: (open: boolean) => void };

export function ChapterManagerDialog({ open, onOpenChange }: Props) {
  const { data: dbChapters } = useCustomChapters();
  const allChapters = getAllChapters(undefined, dbChapters);
  const upsert = useUpsertChapter();
  const remove = useDeleteChapter();

  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSubtitle, setEditSubtitle] = useState("");

  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");

  async function handleCreate() {
    if (!newTitle.trim()) {
      toast.error("O título do capítulo é obrigatório.");
      return;
    }
    const slug = newTitle
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || `capitulo-${Date.now()}`;

    await upsert.mutateAsync({
      slug,
      title: newTitle.trim(),
      subtitle: newSubtitle.trim() || "Uma nova fase da nossa história.",
      position: allChapters.length * 10 + 100,
    });

    toast.success("Capítulo adicionado com sucesso!");
    setNewTitle("");
    setNewSubtitle("");
    setIsCreating(false);
  }

  async function handleSaveEdit(slug: string, pos: number) {
    if (!editTitle.trim()) {
      toast.error("O título não pode ficar vazio.");
      return;
    }
    await upsert.mutateAsync({
      slug,
      title: editTitle.trim(),
      subtitle: editSubtitle.trim() || "Uma nova fase da nossa história.",
      position: pos,
    });
    toast.success("Capítulo atualizado!");
    setEditingSlug(null);
  }

  async function handleDelete(slug: string) {
    if (confirm("Tem certeza que deseja ocultar este capítulo?")) {
      await remove.mutateAsync(slug);
      toast.success("Capítulo ocultado!");
    }
  }

  async function handleMove(index: number, direction: "up" | "down") {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= allChapters.length) return;

    const current = allChapters[index];
    const target = allChapters[targetIdx];

    // Swap positions
    const currentPos = current.index;
    const targetPos = target.index;

    await upsert.mutateAsync({
      slug: current.slug,
      title: current.title,
      subtitle: current.subtitle,
      position: targetPos,
    });
    await upsert.mutateAsync({
      slug: target.slug,
      title: target.title,
      subtitle: target.subtitle,
      position: currentPos,
    });
    toast.success("Ordem atualizada!");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto rounded-3xl border-border bg-paper p-0">
        <div className="px-7 pt-8 pb-2">
          <DialogHeader>
            <p className="label-eyebrow flex items-center gap-1.5 text-gold">
              <BookOpen className="size-3.5" />
              <span>Personalização Total</span>
            </p>
            <DialogTitle className="font-display text-3xl font-light tracking-tight">
              Capítulos e Épocas do Livro
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Seu livro não está preso a números fixos! Crie novas fases, altere os nomes, reordene a sequência ou exclua os capítulos como quiser.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-4 px-7 pb-8">
          <div className="space-y-3 pt-2">
            {allChapters.map((chapter, idx) => (
              <div
                key={chapter.slug}
                className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-background/60 p-4 transition-all hover:border-gold/50"
              >
                {editingSlug === chapter.slug ? (
                  <div className="space-y-3 animate-[var(--animate-fade)]">
                    <div className="space-y-1">
                      <Label className="text-xs">Título do Capítulo</Label>
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Subtítulo poético (Capa do Capítulo)</Label>
                      <Input
                        value={editSubtitle}
                        onChange={(e) => setEditSubtitle(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingSlug(null)}
                        className="rounded-full text-xs"
                      >
                        <X className="size-3 mr-1" /> Cancelar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSaveEdit(chapter.slug, chapter.index)}
                        className="rounded-full bg-gold px-4 text-xs text-foreground"
                      >
                        <Check className="size-3 mr-1" /> Salvar Alteração
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-display text-lg font-medium tracking-tight text-foreground truncate">
                        {chapter.title}
                      </h4>
                      <p className="text-xs text-muted-foreground italic truncate">
                        {chapter.subtitle}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMove(idx, "up")}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary disabled:opacity-30"
                        title="Mover para cima"
                      >
                        <ArrowUp className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(idx, "down")}
                        disabled={idx === allChapters.length - 1}
                        className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary disabled:opacity-30"
                        title="Mover para baixo"
                      >
                        <ArrowDown className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSlug(chapter.slug);
                          setEditTitle(chapter.title);
                          setEditSubtitle(chapter.subtitle);
                        }}
                        className="p-1.5 rounded-lg text-muted-foreground hover:bg-gold-soft/40 hover:text-gold transition-colors"
                        title="Editar nome/subtítulo"
                      >
                        <Edit2 className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(chapter.slug)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        title="Excluir / Ocultar capítulo"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {!isCreating ? (
            <Button
              onClick={() => {
                setIsCreating(true);
                setNewTitle("");
                setNewSubtitle("");
              }}
              className="w-full rounded-2xl border border-dashed border-gold/60 bg-gold-soft/10 py-6 text-sm font-medium text-gold hover:bg-gold-soft/20 shadow-none transition-all"
            >
              <Plus className="size-4 mr-2" />
              Criar Novo Capítulo / Época
            </Button>
          ) : (
            <div className="space-y-3 rounded-2xl border border-gold/50 bg-gold-soft/20 p-5 animate-[var(--animate-rise)]">
              <h5 className="font-display text-base font-medium text-foreground">Nova Época / Fase</h5>
              <div className="space-y-1">
                <Label className="text-xs">Nome do Capítulo (Ex: O Primeiro Aniversário, Férias de 2026...)</Label>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Digite o nome do capítulo..."
                  className="rounded-xl bg-background"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Subtítulo poético (Capa do Capítulo)</Label>
                <Input
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  placeholder="Uma legenda ou frase poética..."
                  className="rounded-xl bg-background"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsCreating(false)}
                  className="rounded-full text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleCreate}
                  className="rounded-full bg-gold px-5 text-xs text-foreground shadow-[var(--shadow-paper)]"
                >
                  Criar Capítulo
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-border/40">
            <Button onClick={() => onOpenChange(false)} className="rounded-full px-6 bg-secondary text-foreground hover:bg-secondary/80">
              Concluir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
