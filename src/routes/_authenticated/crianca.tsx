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
        content: "Os detalhes que dão nome e rosto ao livro da sua família.",
      },
    ],
  }),
  component: Crianca,
});

type Form = {
  name: string;
  mother_name: string;
  is_born: boolean;
  birth_date: string;
  due_date: string;
  last_period_date: string;
  birth_weight_grams: string;
  birth_height_cm: string;
  eye_color: string;
  hair_color: string;
};

const empty: Form = {
  name: "",
  mother_name: "",
  is_born: false,
  birth_date: "",
  due_date: "",
  last_period_date: "",
  birth_weight_grams: "",
  birth_height_cm: "",
  eye_color: "",
  hair_color: "",
};

function getGestationDetails(lastPeriod: string | null, dueDate: string | null) {
  let totalDays = 0;
  if (lastPeriod) {
    totalDays = Math.max(0, differenceInDays(new Date(), parseISO(lastPeriod)));
  } else if (dueDate) {
    const daysUntilDue = differenceInDays(parseISO(dueDate), new Date());
    totalDays = Math.max(0, 280 - daysUntilDue);
  }

  if (totalDays <= 0) return null;

  const weeks = Math.floor(totalDays / 7);
  const days = totalDays % 7;
  const remainingDays = Math.max(0, 280 - totalDays);
  const remainingWeeks = Math.ceil(remainingDays / 7);

  return {
    weeks,
    days,
    totalDays,
    remainingDays,
    remainingWeeks,
    progressPercentage: Math.min(100, Math.round((totalDays / 280) * 100)),
  };
}

function getAgeDetails(birthDate: string | null) {
  if (!birthDate) return null;
  const totalDays = Math.max(0, differenceInDays(new Date(), parseISO(birthDate)));
  const months = Math.floor(totalDays / 30.43);
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  return {
    totalDays,
    months,
    years,
    remainingMonths,
  };
}

function Crianca() {
  const { data: child, isLoading } = useChild();
  const save = useSaveChild();
  const { data: moments = [] } = useMoments();
  const [form, setForm] = useState<Form>(empty);

  useEffect(() => {
    if (!child) return;
    setForm({
      name: child.name ?? "",
      mother_name: child.mother_name ?? "",
      is_born: child.is_born,
      birth_date: child.birth_date ?? "",
      due_date: child.due_date ?? "",
      last_period_date: child.last_period_date ?? "",
      birth_weight_grams: child.birth_weight_grams?.toString() ?? "",
      birth_height_cm: child.birth_height_cm?.toString() ?? "",
      eye_color: child.eye_color ?? "",
      hair_color: child.hair_color ?? "",
    });
  }, [child]);

  const gestation = getGestationDetails(form.last_period_date || null, form.due_date || null);
  const age = getAgeDetails(form.birth_date || null);

  const ultrasounds = moments.filter(
    (m) => m.category === "ultrassom" || m.category === "gestacao",
  );

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error("Preencha o nome do bebê.");
      return;
    }
    try {
      await save.mutateAsync({
        id: child?.id,
        name: form.name.trim(),
        mother_name: form.mother_name.trim() || null,
        is_born: form.is_born,
        birth_date: form.birth_date || null,
        due_date: form.due_date || null,
        last_period_date: form.last_period_date || null,
        birth_weight_grams: form.birth_weight_grams ? Number(form.birth_weight_grams) : null,
        birth_height_cm: form.birth_height_cm ? Number(form.birth_height_cm) : null,
        eye_color: form.eye_color || null,
        hair_color: form.hair_color || null,
      });
      toast.success("Perfil da família salvo com sucesso.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não conseguimos salvar.");
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20">
        <div className="h-96 animate-pulse rounded-3xl bg-secondary/60" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-14 sm:py-20 space-y-10">
      <header className="space-y-3">
        <p className="label-eyebrow">Perfil da Família</p>
        <h1 className="text-display text-4xl sm:text-5xl">
          {form.mother_name ? `Mãe: ${form.mother_name}` : "Perfil da Mãe e do Bebê"}
        </h1>
        <p className="text-muted-foreground">
          Acompanhe o tempo de gestação em dias e semanas, datas marcantes e detalhes do livro.
        </p>
      </header>

      {/* Real-time Gestation or Age Dashboard Widget */}
      {!form.is_born && gestation ? (
        <section className="surface-paper overflow-hidden rounded-3xl p-8 border border-border shadow-lift relative">
          <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <Heart className="size-5 text-gold animate-pulse" />
              <span className="label-eyebrow text-gold font-semibold">Painel da Gestante</span>
            </div>
            <span className="text-xs bg-gold-soft/50 text-foreground px-3 py-1 rounded-full font-medium">
              {gestation.totalDays} dias de gestação
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 items-center">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Tempo Atual</p>
              <h2 className="text-display text-4xl sm:text-5xl text-foreground mt-1">
                {gestation.weeks} <span className="text-2xl font-light">semanas</span>
                {gestation.days > 0 && <span className="text-2xl font-light"> e {gestation.days} {gestation.days === 1 ? 'dia' : 'dias'}</span>}
              </h2>
              <p className="mt-3 text-sm text-muted-foreground italic">
                Faltam aproximadamente {gestation.remainingWeeks} semanas ({gestation.remainingDays} dias) para a chegada.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-xs font-medium">
                <span>Progresso da Gestação</span>
                <span className="text-gold">{gestation.progressPercentage}% concluído</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-gold-soft to-gold transition-all duration-1000"
                  style={{ width: `${gestation.progressPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>Semana 1</span>
                <span>Semana 20</span>
                <span>Semana 40</span>
              </div>
            </div>
          </div>
        </section>
      ) : form.is_born && age ? (
        <section className="surface-paper overflow-hidden rounded-3xl p-8 border border-border shadow-lift">
          <div className="flex items-center gap-2 border-b border-border/50 pb-4 mb-4">
            <Heart className="size-5 text-gold" />
            <span className="label-eyebrow text-gold font-semibold">Idade do Bebê</span>
          </div>
          <div className="flex items-baseline gap-4">
            <h2 className="text-display text-4xl sm:text-5xl">
              {age.years > 0 ? `${age.years} ${age.years === 1 ? 'ano' : 'anos'}` : ''}
              {age.remainingMonths > 0 ? ` ${age.remainingMonths} ${age.remainingMonths === 1 ? 'mês' : 'meses'}` : ''}
              {age.years === 0 && age.remainingMonths === 0 ? `${age.totalDays} dias` : ''}
            </h2>
            <span className="text-sm text-muted-foreground">({age.totalDays} dias de vida registrados)</span>
          </div>
        </section>
      ) : null}

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
              <Label htmlFor="dum">Data da última menstruação (DUM)</Label>
              <Input
                id="dum"
                type="date"
                value={form.last_period_date}
                onChange={(e) => setForm({ ...form, last_period_date: e.target.value })}
                className="rounded-xl bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dpp">Data provável do parto (DPP)</Label>
              <Input
                id="dpp"
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className="rounded-xl bg-background"
              />
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

