import { differenceInDays, parseISO } from "date-fns";
import { Link } from "@tanstack/react-router";
import { Heart, Calendar, Clock, ArrowRight, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Child } from "@/types";

export function getGestationDetails(lastPeriod: string | null, dueDate: string | null) {
  let totalDays = 0;
  if (lastPeriod) {
    const start = parseISO(lastPeriod);
    if (!isNaN(start.getTime())) {
      totalDays = Math.max(0, differenceInDays(new Date(), start));
    }
  } else if (dueDate) {
    const due = parseISO(dueDate);
    if (!isNaN(due.getTime())) {
      const daysUntilDue = differenceInDays(due, new Date());
      totalDays = Math.max(0, 280 - daysUntilDue);
    }
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

export function getAgeDetails(birthDate: string | null) {
  if (!birthDate) return null;
  const birth = parseISO(birthDate);
  if (isNaN(birth.getTime())) return null;

  const totalDays = Math.max(0, differenceInDays(new Date(), birth));
  const months = Math.floor(totalDays / 30.4375);
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  return {
    totalDays,
    months,
    years,
    remainingMonths,
  };
}

export function BabyProgressWidget({ child, hideSettingsButton = false }: { child: Child | null | undefined; hideSettingsButton?: boolean }) {
  if (!child) return null;

  if (!child.is_born) {
    const gestation = getGestationDetails(child.last_period_date || null, child.due_date || null);
    if (!gestation) {
      if (hideSettingsButton) return null;
      return (
        <section className="surface-paper overflow-hidden rounded-3xl p-6 sm:p-8 border border-border shadow-lift my-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Heart className="size-4 text-gold" />
                <span className="label-eyebrow text-gold font-semibold">Tempo de Gestação</span>
              </div>
              <h3 className="font-display text-2xl text-foreground">Defina a data de início da gravidez</h3>
              <p className="text-sm text-muted-foreground">
                Informe a data exata em que soube da gravidez para ativarmos o contador em tempo real na sua página inicial.
              </p>
            </div>
            <Link to="/crianca" className="shrink-0">
              <Button variant="outline" className="rounded-full border-gold/50 bg-gold-soft/10 text-gold hover:bg-gold-soft/20 text-xs px-5">
                <Settings2 className="size-3.5 mr-1.5" />
                Configurar Perfil e Datas
              </Button>
            </Link>
          </div>
        </section>
      );
    }

    return (
      <section className="surface-paper overflow-hidden rounded-3xl p-6 sm:p-8 border border-border shadow-lift my-6 animate-[var(--animate-rise)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-full bg-gold-soft/30 flex items-center justify-center">
              <Heart className="size-5 text-gold" />
            </div>
            <div>
              <span className="label-eyebrow text-gold font-semibold block">Jornada da Gestação</span>
              <span className="text-sm text-muted-foreground">Acompanhamento em tempo real</span>
            </div>
          </div>
          {!hideSettingsButton && (
            <Link to="/crianca" className="shrink-0 self-start sm:self-auto">
              <Button variant="ghost" className="rounded-full text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/60 h-8 px-4">
                <Settings2 className="size-3.5 mr-1.5" />
                Editar datas
              </Button>
            </Link>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-display text-3xl sm:text-5xl tracking-tight text-foreground">
              {gestation.weeks} <span className="text-xl sm:text-2xl font-light text-muted-foreground">semanas</span>
              {gestation.days > 0 && (
                <span className="text-xl sm:text-2xl font-light text-muted-foreground">
                  {" "}e {gestation.days} {gestation.days === 1 ? "dia" : "dias"}
                </span>
              )}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground italic">
              Faltam aproximadamente <strong className="text-foreground font-medium">{gestation.remainingWeeks} semanas</strong> ({gestation.remainingDays} dias) para a chegada de {child.name}!
            </p>
          </div>

          <div className="space-y-2.5 bg-secondary/30 p-5 rounded-2xl border border-border/40">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-muted-foreground">Progresso do livro de memórias da gravidez</span>
              <span className="text-gold font-semibold">{gestation.progressPercentage}% da gestação</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold-soft to-gold transition-all duration-1000"
                style={{ width: `${gestation.progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-muted-foreground/80 font-mono pt-0.5">
              <span>Início (1ª sem)</span>
              <span>Metade (20ª sem)</span>
              <span>Chegada (40ª sem)</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Born
  const age = getAgeDetails(child.birth_date || null);
  if (!age) {
    if (hideSettingsButton) return null;
    return (
      <section className="surface-paper overflow-hidden rounded-3xl p-6 sm:p-8 border border-border shadow-lift my-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Heart className="size-4 text-gold" />
              <span className="label-eyebrow text-gold font-semibold">Tempo de Vida de {child.name}</span>
            </div>
            <h3 className="font-display text-2xl text-foreground">Defina a data de nascimento</h3>
            <p className="text-sm text-muted-foreground">
              Cadastre o dia exato do nascimento para calcularmos os anos, meses e dias de vida em tempo real na sua página inicial.
            </p>
          </div>
          <Link to="/crianca" className="shrink-0">
            <Button variant="outline" className="rounded-full border-gold/50 bg-gold-soft/10 text-gold hover:bg-gold-soft/20 text-xs px-5">
              <Settings2 className="size-3.5 mr-1.5" />
              Configurar Perfil
            </Button>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="surface-paper overflow-hidden rounded-3xl p-6 sm:p-8 border border-border shadow-lift my-6 animate-[var(--animate-rise)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="size-9 rounded-full bg-gold-soft/30 flex items-center justify-center">
            <Heart className="size-5 text-gold" />
          </div>
          <div>
            <span className="label-eyebrow text-gold font-semibold block">Tempo de Vida de {child.name}</span>
            <span className="text-sm text-muted-foreground">Contagem e memórias ativas</span>
          </div>
        </div>
        {!hideSettingsButton && (
          <Link to="/crianca" className="shrink-0 self-start sm:self-auto">
            <Button variant="ghost" className="rounded-full text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/60 h-8 px-4">
              <Settings2 className="size-3.5 mr-1.5" />
              Editar perfil e dados
            </Button>
          </Link>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div className="flex flex-wrap items-baseline gap-3">
          <h2 className="text-display text-3xl sm:text-5xl text-foreground">
            {age.years > 0 ? `${age.years} ${age.years === 1 ? "ano" : "anos"}` : ""}
            {age.remainingMonths > 0 ? ` ${age.remainingMonths} ${age.remainingMonths === 1 ? "mês" : "meses"}` : ""}
            {age.years === 0 && age.remainingMonths === 0 ? `${age.totalDays} dias` : ""}
          </h2>
          <span className="text-sm sm:text-base text-muted-foreground font-light">
            ({age.totalDays} {age.totalDays === 1 ? "dia de vida registrado" : "dias de vida registrados"})
          </span>
        </div>
      </div>
    </section>
  );
}
