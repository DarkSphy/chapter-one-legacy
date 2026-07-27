import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Users, Heart, Calendar, Loader2, Sparkles, ImagePlus, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useChild, useSaveChild } from "@/hooks/useLibrary";
import { uploadFile } from "@/services/library";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/crianca")({
  component: LegadoFamiliaPage,
});

function LegadoFamiliaPage() {
  const { data: child, isLoading } = useChild();
  const save = useSaveChild();

  const [name, setName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (child) {
      setName(child.name || "");
      setMotherName(child.mother_name || "");
      setFatherName(child.father_name || "");
      setBirthDate(child.birth_date ? child.birth_date.slice(0, 10) : "");
      setPhotoUrl(child.photo_url || null);
    }
  }, [child]);

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file);
      setPhotoUrl(url);
      toast.success("Retrato principal atualizado com carinho.");
    } catch {
      toast.error("Não foi possível carregar a imagem do retrato.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Por favor, digite o nome do protagonista.");
      return;
    }
    try {
      await save.mutateAsync({
        name: name.trim(),
        mother_name: motherName.trim() || null,
        father_name: fatherName.trim() || null,
        birth_date: birthDate || null,
        photo_url: photoUrl,
      });
      toast.success("Prefácio e dados familiares gravados eternamente!");
    } catch {
      toast.error("Erro ao salvar informações da família.");
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="size-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-10 animate-fade">
      {/* Cabeçalho do Prefácio */}
      <div className="text-center space-y-3 border-b border-border/60 pb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-soft text-gold text-xs font-semibold tracking-widest uppercase border border-gold/30">
          <Sparkles className="size-3.5" />
          Prefácio Biográfico
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-obsidian tracking-tight">
          Os Guardiões & O Protagonista
        </h1>
        <p className="font-serif italic text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
          Este é o registro fundamental que abre o livro de ouro da família, dedicando cada palavra ao futuro de quem mais amamos.
        </p>
      </div>

      <form onSubmit={handleSave} className="surface-paper rounded-3xl p-8 sm:p-12 border border-border/80 shadow-book space-y-8">
        {/* Retrato Emblema do Protagonista */}
        <div className="flex flex-col items-center justify-center text-center space-y-4 pb-6 border-b border-border/40">
          <div className="relative group size-36 sm:size-44 rounded-full p-1 bg-gradient-to-tr from-gold via-gold-bright to-gold-border shadow-xl">
            {photoUrl ? (
              <img src={photoUrl} alt="Protagonista" className="size-full rounded-full object-cover border-4 border-paper" />
            ) : (
              <div className="size-full rounded-full bg-secondary flex flex-col items-center justify-center text-gold p-4 border-4 border-paper">
                <Heart className="size-10 mb-1 stroke-[1.5] animate-pulse" />
                <span className="text-[10px] font-sans uppercase tracking-widest font-semibold">Sem Retrato</span>
              </div>
            )}
            <label className="absolute bottom-1 right-1 size-10 rounded-full bg-obsidian text-paper hover:bg-gold hover:text-obsidian flex items-center justify-center cursor-pointer shadow-md transition-all duration-300">
              {uploading ? <Loader2 className="size-4 animate-spin text-gold" /> : <ImagePlus className="size-4" />}
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" disabled={uploading} />
            </label>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">Retrato Principal do Livro</h2>
            <p className="text-xs font-sans text-muted-foreground">Esta fotografia estampará a Capa Dourada da biografia</p>
          </div>
        </div>

        {/* Dados do Protagonista */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block font-display text-lg font-semibold text-foreground">
              Nome do Protagonista (Bebê / Criança)
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Miguel Santos Silva"
              className="h-12 rounded-2xl bg-secondary/40 border-border text-base px-4 focus:border-gold/60"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
              <Calendar className="size-4 text-gold" />
              <span>Data de Nascimento ou Início da Gestação</span>
            </label>
            <Input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="h-12 rounded-2xl bg-secondary/40 border-border text-base px-4 w-full sm:w-2/3 focus:border-gold/60"
            />
          </div>
        </div>

        {/* Guardiões da História (Mãe e Pai) */}
        <div className="pt-6 border-t border-border/40 space-y-6">
          <div className="flex items-center gap-2 text-obsidian">
            <Users className="size-5 text-gold" />
            <h3 className="font-display text-xl font-bold">Os Guardiões do Legado</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Nome da Mãe
              </label>
              <Input
                value={motherName}
                onChange={(e) => setMotherName(e.target.value)}
                placeholder="Ex: Ana Clara Santos"
                className="h-11 rounded-xl bg-secondary/30 border-border text-sm px-4 focus:border-gold/60"
              />
            </div>
            <div className="space-y-2">
              <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Nome do Pai
              </label>
              <Input
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                placeholder="Ex: Lucas Silva"
                className="h-11 rounded-xl bg-secondary/30 border-border text-sm px-4 focus:border-gold/60"
              />
            </div>
          </div>
        </div>

        {/* Botão Salvar Prefácio */}
        <div className="pt-6 flex justify-end">
          <Button
            type="submit"
            disabled={save.isPending || !name.trim()}
            className="h-13 px-8 rounded-full bg-obsidian text-paper font-sans text-sm font-semibold tracking-wide shadow-book hover:bg-gold hover:text-obsidian transition-all duration-300 w-full sm:w-auto flex items-center justify-center gap-2 group"
          >
            {save.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Gravando prefácio...</span>
              </>
            ) : (
              <>
                <Check className="size-4 text-gold group-hover:text-obsidian transition-colors" />
                <span>Gravar no Arquivo Familiar</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
