import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { BookOpen, Feather } from "lucide-react";
import { useChild, useMoments } from "@/hooks/useLibrary";
import { MomentCard } from "@/components/moments/MomentCard";
import { CHAPTERS, pagesFromMoments } from "@/lib/chapters";
import { BabyProgressWidget } from "@/components/dashboard/BabyProgressWidget";

export const Route = createFileRoute("/_authenticated/inicio")({
  head: () => ({
    meta: [
      { title: "Seu diário — Primeiros Capítulos" },
      {
        name: "description",
        content:
          "Acompanhe as páginas já escritas e adicione novos momentos ao livro do seu filho.",
      },
      { property: "og:title", content: "Seu diário — Primeiros Capítulos" },
      {
        property: "og:description",
        content: "As memórias da sua família virando um livro, página por página.",
      },
    ],
  }),
  component: Inicio,
});

function Inicio() {
  const { data: child } = useChild();
  const { data: moments = [], isLoading } = useMoments();

  const pages = pagesFromMoments(moments.length);
  const chaptersStarted = useMemo(
    () => new Set(moments.map((m) => m.chapter_slug)).size,
    [moments],
  );
  const progress = Math.min(100, Math.round((pages / 30) * 100));
  const recent = [...moments].sort((a, b) => b.happened_on.localeCompare(a.happened_on));

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
      <header className="animate-[var(--animate-rise)] space-y-3">
        <p className="label-eyebrow">Bem-vindo de volta</p>
        <h1 className="text-display text-4xl sm:text-6xl">
          {child?.name ? `A história de ${child.name}` : "A sua história"}
        </h1>
        <p className="text-lg text-muted-foreground">
          {moments.length === 0
            ? "Ainda não há nenhuma página. Vamos começar a escrever essa história?"
            : `Você já registrou ${moments.length} ${moments.length === 1 ? "momento especial" : "momentos especiais"}.`}
        </p>
      </header>

      <BabyProgressWidget child={child} />

      <section className="surface-paper mt-10 animate-[var(--animate-rise)] overflow-hidden rounded-[2rem] p-8 sm:p-12">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="min-w-0 space-y-5">
            <p className="label-eyebrow">
              {pages === 0 ? "O primeiro capítulo" : "Seu livro está sendo escrito"}
            </p>
            <h2 className="text-display text-3xl sm:text-4xl">
              {child?.name ? `O Livro de ${child.name}` : "O seu livro"}
            </h2>
            <p className="font-display text-2xl text-muted-foreground italic">
              {pages === 0
                ? "0 páginas · Vamos começar a escrever essa história?"
                : `${pages} ${pages === 1 ? "página criada" : "páginas criadas"} · ${chaptersStarted} ${chaptersStarted === 1 ? "capítulo ou fase personalizada" : "capítulos ou fases personalizadas"}`}
            </p>

            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold-soft to-gold transition-all duration-1000"
                style={{ width: `${Math.max(progress, pages > 0 ? 8 : 0)}%` }}
              />
            </div>

            <Link
              to="/livro"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-transform duration-300 hover:-translate-y-0.5"
            >
              <BookOpen className="size-4" strokeWidth={1.5} />
              Abrir o livro
            </Link>
          </div>

          <div className="hidden h-52 w-40 rotate-2 rounded-r-xl rounded-l-sm bg-gradient-to-br from-secondary via-paper to-gold-soft/60 shadow-[var(--shadow-book)] md:block" />
        </div>
      </section>

      <section className="mt-16">
        <div className="mb-7 flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-light">Momentos recentes</h2>
          <Link to="/linha-do-tempo" className="text-sm text-muted-foreground hover:text-gold">
            Ver linha do tempo
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-3xl bg-secondary/60" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="surface-paper flex flex-col items-center gap-4 rounded-3xl px-8 py-20 text-center">
            <Feather className="size-6 text-gold" strokeWidth={1.25} />
            <p className="font-display text-2xl">Sua primeira página espera por você.</p>
            <p className="max-w-md text-sm text-muted-foreground">
              Escreva poucas linhas sobre um momento. Nós transformamos em uma história.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recent.slice(0, 6).map((moment) => (
              <MomentCard key={moment.id} moment={moment} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
