import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { differenceInDays, parseISO, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, Heart, Calendar, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useChild, useSaveChild, useMoments } from "@/hooks/useLibrary";
import { MomentCover } from "@/components/moments/MomentCard";
import { BabyProgressWidget } from "@/components/dashboard/BabyProgressWidget";

export const Route = createFileRoute("/_authenticated/crianca")({
  head: () => ({
    meta: [
      { title: "Perfil do Bebê & Mãe — Primeiros Capítulos" },
      {
        name: "description",
        content: "Cadastro da mãe, tempo de gestação em semanas e dias, datas importantes e perfil do bebê.",
      },
      { property: "og:title", content: "Perfil do Bebê & Mãe — Primeiros Capítulos" },
      {
        property: "og:description",
        content: "Acompanhe e edite as informações mais valiosas do seu bebê e da gestação.",
      },
    ],
  }),
  component: Crianca,
});

function Crianca() {
  const { data: child, isLoading } = useChild();
  const { data: moments = [] } = useMoments();
  const save = useSaveChild();

  const [form, setForm] = useState({
    name: "",
    mother_name: "",
    birth_date: "",
    last_period_date: "",
    due_date: "",
    birth_weight_grams: "",
    birth_height_cm: "",
    eye_color: "",
    hair_color: "",
    is_born: false,
  });

  useEffect(() => {
    if (child) {
      setForm({
        name: child.name ?? "",
        mother_name: child.mother_name ?? "",
        birth_date: child.birth_date ? child.birth_date.slice(0, 10) : "",
        last_period_date: child.last_period_date ? child.last_period_date.slice(0, 10) : "",
        due_date: child.due_date ? child.due_date.slice(0, 10) : "",
        birth_weight_grams: child.birth_weight_grams?.toString() ?? "",
        birth_height_cm: child.birth_height_cm?.toString() ?? "",
        eye_color: child.eye_color ?? "",
        hair_color: child.hair_color ?? "",
        is_born: child.is_born ?? false,
      });
    }
  }, [child]);

  async function handleSave() {
    try {
      await save.mutateAsync({
        id: child?.id,
        name: form.name.trim() || null,
        mother_name: form.mother_name.trim() || null,
        birth_date: form.birth_date || null,
        last_period_date: form.last_period_date || null,
        due_date: form.due_date || null,
        birth_weight_grams: form.birth_weight_grams ? parseInt(form.birth_weight_grams, 10) : null,
        birth_height_cm: form.birth_height_cm ? parseFloat(form.birth_height_cm) : null,
        eye_color: form.eye_color.trim() || null,
        hair_color: form.hair_color.trim() || null,
        is_born: form.is_born,
      });
      toast.success("Informações salvas com sucesso!");
    } catch (error) {
      toast.error("Não foi possível salvar os dados.");
    }
  }

  const ultrasounds = moments.filter(
    (m) => m.category === "ultrassom" || m.category === "gestacao",
  );

  if (isLoading) {
    return <div className="h-96 animate-pulse rounded-[2rem] bg-secondary/60 mx-auto max-w-4xl mt-12" />;
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-14 sm:py-20 space-y-12 animate-[var(--animate-rise)]">
      <header className="space-y-3 text-center sm:text-left">
        <p className="label-eyebrow">Configurações & Memórias</p>
        <h1 className="text-display text-4xl sm:text-5xl">
          {form.mother_name ? `Mãe: ${form.mother_name}` : "Perfil da Mãe e do Bebê"}
        </h1>
        <p className="text-muted-foreground">
          Acompanhe o tempo de gestação em dias e semanas, datas marcantes e detalhes do livro.
        </p>
      </header>

      {/* Real-time Gestation or Age Dashboard Widget */}
      <BabyProgressWidget child={{ ...child, ...form, birth_weight_grams: form.birth_weight_grams ? parseInt(form.birth_weight_grams, 10) : null, birth_height_cm: form.birth_height_cm ? parseFloat(form.birth_height_cm) : null } as any} />

      {/* Main Registration Form */}
      <section className="surface-paper space-y-6 rounded-3xl p-7 sm:p-9 border border-border">
        <h3 className="font-display text-2xl font-light border-b border-border/50 pb-3">Informações da Mãe & Bebê</h3>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nomeMae">Nome da Mãe</Label>
            <Input
              id="nomeMae"
              value={form.mother_name}
              maxLength={80}
              onChange={(e) => setForm({ ...form, mother_name: e.target.value })}
              placeholder="Ex: Mariana Silva"
              className="rounded-xl bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nomeBebe">Nome do Bebê / Criança</Label>
            <Input
              id="nomeBebe"
              value={form.name}
              maxLength={80}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Miguel ou Bebê na Barriga"
              className="rounded-xl bg-background"
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-secondary/60 px-5 py-4">
          <div>
            <p className="text-sm font-medium">O bebê já nasceu?</p>
            <p className="text-sm text-muted-foreground">
              {form.is_born ? "Modo Bebê Nascido: Registre nascimento e medidas." : "Modo Gestação: Acompanhe semanas e dias da gravidez."}
            </p>
          </div>
          <Switch
            checked={form.is_born}
            onCheckedChange={(checked) => setForm({ ...form, is_born: checked })}
          />
        </div>

        {form.is_born ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nasc">Data de nascimento</Label>
              <Input
                id="nasc"
                type="date"
                value={form.birth_date}
                onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
                className="rounded-xl bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="peso">Peso ao nascer (g)</Label>
              <Input
                id="peso"
                type="number"
                value={form.birth_weight_grams}
                onChange={(e) => setForm({ ...form, birth_weight_grams: e.target.value })}
                placeholder="3250"
                className="rounded-xl bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="altura">Altura ao nascer (cm)</Label>
              <Input
                id="altura"
                type="number"
                step="0.1"
                value={form.birth_height_cm}
                onChange={(e) => setForm({ ...form, birth_height_cm: e.target.value })}
                placeholder="49"
                className="rounded-xl bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="olhos">Cor dos olhos</Label>
              <Input
                id="olhos"
                value={form.eye_color}
                maxLength={40}
                onChange={(e) => setForm({ ...form, eye_color: e.target.value })}
                placeholder="Castanhos"
                className="rounded-xl bg-background"
              />
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dum">Dia exato do início da gravidez (ou data em que soube)</Label>
              <Input
                id="dum"
                type="date"
                value={form.last_period_date}
                onChange={(e) => setForm({ ...form, last_period_date: e.target.value })}
                className="rounded-xl bg-background"
              />
              <p className="text-[11px] text-muted-foreground">Esta data alimenta o contador em tempo real em todas as páginas do aplicativo.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dpp">Previsão da chegada do bebê (Data Provável)</Label>
              <Input
                id="dpp"
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className="rounded-xl bg-background"
              />
              <p className="text-[11px] text-muted-foreground">Usada para estimar quantas semanas faltam para o nascimento.</p>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button onClick={handleSave} disabled={save.isPending} className="rounded-full px-8 bg-primary">
            {save.isPending && <Loader2 className="size-4 animate-spin mr-2" />}
            Salvar Alterações
          </Button>
        </div>
      </section>

      {/* Datas Importantes & Ultrassons */}
      {ultrasounds.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="size-5 text-gold" />
            <h2 className="font-display text-2xl font-light">Datas & Registros Importantes</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {ultrasounds.map((m) => (
              <figure key={m.id} className="surface-paper overflow-hidden rounded-2xl border border-border">
                <MomentCover path={m.cover_url} className="h-36 w-full" />
                <figcaption className="p-3 text-xs text-muted-foreground font-medium">
                  {m.title}
                  <span className="block text-[10px] text-gold mt-0.5">
                    {format(parseISO(m.happened_on), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

