import { createFileRoute } from "@tanstack/react-router";
import { Timeline } from "@/components/timeline/Timeline";
import { useMoments } from "@/hooks/useLibrary";

export const Route = createFileRoute("/_authenticated/linha-do-tempo")({
  head: () => ({
    meta: [
      { title: "Linha do tempo — Primeiros Capítulos" },
      {
        name: "description",
        content: "Todos os momentos registrados, conectados em uma linha do tempo elegante.",
      },
      { property: "og:title", content: "Linha do tempo — Primeiros Capítulos" },
      {
        property: "og:description",
        content: "Do primeiro ultrassom aos primeiros passos, em ordem.",
      },
    ],
  }),
  component: LinhaDoTempo,
});

function LinhaDoTempo() {
  const { data: moments = [], isLoading } = useMoments();

  return (
    <div className="mx-auto max-w-4xl px-5 py-14 sm:py-20">
      <header className="mb-14 space-y-3 text-center">
        <p className="label-eyebrow">Linha do tempo</p>
        <h1 className="text-display text-4xl sm:text-5xl">Tudo o que já aconteceu</h1>
        <p className="text-muted-foreground">Cada ponto dessa linha virou uma página.</p>
      </header>

      {isLoading ? (
        <div className="space-y-6">
          {[0, 1].map((i) => (
            <div key={i} className="h-72 animate-pulse rounded-3xl bg-secondary/60" />
          ))}
        </div>
      ) : moments.length === 0 ? (
        <p className="text-center font-display text-2xl text-muted-foreground italic">
          A linha começa no primeiro momento que você registrar.
        </p>
      ) : (
        <Timeline moments={moments} />
      )}
    </div>
  );
}
