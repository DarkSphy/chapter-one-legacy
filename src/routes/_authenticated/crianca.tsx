import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { differenceInDays, parseISO } from "date-fns";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useChild, useSaveChild, useMoments } from "@/hooks/useLibrary";
import { MomentCover } from "@/components/moments/MomentCard";

export const Route = createFileRoute("/_authenticated/crianca")({
  head: () => ({
    meta: [
      { title: "Perfil da criança — Primeiros Capítulos" },
      {
        name: "description",
        content: "Nome, nascimento, medidas e a gestação semana a semana em um só lugar.",
      },
      { property: "og:title", content: "Perfil da criança — Primeiros Capítulos" },
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
  is_born: false,
  birth_date: "",
  due_date: "",
  last_period_date: "",
  birth_weight_grams: "",
  birth_height_cm: "",
  eye_color: "",
  hair_color: "",
};

function gestationWeek(lastPeriod: string | null, dueDate: string | null) {
  if (lastPeriod) {
    const days = differenceInDays(new Date(), parseISO(lastPeriod));
    if (days >= 0 && days < 320) return Math.floor(days / 7);
  }
  if (dueDate) {
    const remaining = differenceInDays(parseISO(dueDate), new Date());
    const week = 40 - Math.ceil(remaining / 7);
    if (week > 0 && week <= 42) return week;
  }
  return null;
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

  const week = gestationWeek(form.last_period_date || null, form.due_date || null);
  const ultrasounds = moments.filter(
    (m) => m.category === "ultrassom" || m.category === "gestacao",
  );

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error("Conte o nome da criança.");
      return;
    }
    try {
      await save.mutateAsync({
        id: child?.id,
        name: form.name.trim(),
        is_born: form.is_born,
        birth_date: form.birth_date || null,
        due_date: form.due_date || null,
        last_period_date: form.last_period_date || null,
        birth_weight_grams: form.birth_weight_grams ? Number(form.birth_weight_grams) : null,
        birth_height_cm: form.birth_height_cm ? Number(form.birth_height_cm) : null,
        eye_color: form.eye_color || null,
        hair_color: form.hair_color || null,
      });
      toast.success("Perfil guardado.");
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
    <div className="mx-auto max-w-3xl px-5 py-14 sm:py-20">
      <header className="mb-10 space-y-3">
        <p className="label-eyebrow">Perfil</p>
        <h1 className="text-display text-4xl sm:text-5xl">
          {form.name || "Quem é o protagonista?"}
        </h1>
        <p className="text-muted-foreground">
          Estes detalhes aparecem na capa e nos capítulos do livro.
        </p>
      </header>

      <section className="surface-paper space-y-6 rounded-3xl p-7 sm:p-9">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome</Label>
          <Input
            id="nome"
            value={form.name}
            maxLength={80}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Miguel"
            className="rounded-xl bg-background"
          />
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-secondary/60 px-5 py-4">
          <div>
            <p className="text-sm font-medium">O bebê já nasceu</p>
            <p className="text-sm text-muted-foreground">
              {form.is_born ? "Vamos guardar as medidas." : "Vamos acompanhar a gestação."}
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
              <Label htmlFor="altura">Altura (cm)</Label>
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
                className="rounded-xl bg-background"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="cabelo">Cor do cabelo</Label>
              <Input
                id="cabelo"
                value={form.hair_color}
                maxLength={40}
                onChange={(e) => setForm({ ...form, hair_color: e.target.value })}
                className="rounded-xl bg-background"
              />
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dum">Data da última menstruação</Label>
              <Input
                id="dum"
                type="date"
                value={form.last_period_date}
                onChange={(e) => setForm({ ...form, last_period_date: e.target.value })}
                className="rounded-xl bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dpp">Data provável do parto</Label>
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

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={save.isPending} className="rounded-full px-6">
            {save.isPending && <Loader2 className="size-4 animate-spin" />}
            Guardar
          </Button>
        </div>
      </section>

      {!form.is_born && week !== null && (
        <section className="surface-paper mt-8 rounded-3xl p-8 text-center">
          <p className="label-eyebrow">Gestação</p>
          <h2 className="text-display mt-3 text-5xl">Semana {week}</h2>
          <div className="mx-auto mt-6 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold-soft to-gold transition-all duration-1000"
              style={{ width: `${Math.min(100, (week / 40) * 100)}%` }}
            />
          </div>
          <p className="mt-4 font-display text-lg text-muted-foreground italic">
            Faltam cerca de {Math.max(0, 40 - week)} semanas para conhecer você.
          </p>
        </section>
      )}

      {ultrasounds.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-5 font-display text-2xl font-light">Ultrassons e barriga</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {ultrasounds.map((m) => (
              <figure key={m.id} className="surface-paper overflow-hidden rounded-2xl">
                <MomentCover path={m.cover_url} className="h-36 w-full" />
                <figcaption className="p-3 text-xs text-muted-foreground">{m.title}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
