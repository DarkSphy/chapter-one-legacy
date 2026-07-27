import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BookReader, buildPages } from "@/components/book/BookReader";
import { useChild, useMoments, useCustomChapters } from "@/hooks/useLibrary";
import { ChapterManagerDialog } from "@/components/moments/ChapterManagerDialog";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { BabyProgressWidget } from "@/components/dashboard/BabyProgressWidget";

export const Route = createFileRoute("/_authenticated/livro")({
  head: () => ({
    meta: [
      { title: "Meu Livro — Primeiros Capítulos" },
      {
        name: "description",
        content: "Leia o livro do seu filho, capítulo por capítulo, escrito a partir das memórias.",
      },
      { property: "og:title", content: "Meu Livro — Primeiros Capítulos" },
      {
        property: "og:description",
        content: "Um livro criado a partir dos momentos mais importantes da sua família.",
      },
    ],
  }),
  component: Livro,
});

function Livro() {
  const { data: child } = useChild();
  const { data: dbChapters } = useCustomChapters();
  const { data: moments = [], isLoading } = useMoments();
  const pages = useMemo(() => buildPages(moments, child ?? null, dbChapters), [moments, child, dbChapters]);
  const [openChapterManager, setOpenChapterManager] = useState(false);

  return (
    <div className="mx-auto max-w-5xl px-5 py-14 sm:py-20">
      <header className="mb-10 space-y-4 text-center">
        <p className="label-eyebrow">Meu livro</p>
        <h1 className="text-display text-4xl sm:text-5xl">
          {child?.name ? `O Livro de ${child.name}` : "O seu livro"}
        </h1>
        <div className="flex justify-center pt-2">
          <Button
            onClick={() => setOpenChapterManager(true)}
            variant="outline"
            className="rounded-full border-gold/50 bg-gold-soft/10 text-gold hover:bg-gold-soft/20 text-xs px-5 shadow-xs transition-all duration-300 hover:scale-105"
          >
            <Settings2 className="size-3.5 mr-1.5" />
            Personalizar e Organizar Épocas do Livro
          </Button>
        </div>
      </header>

      <BabyProgressWidget child={child} />

      {isLoading ? (
        <div className="h-[34rem] animate-pulse rounded-[2rem] bg-secondary/60" />
      ) : pages.length <= 1 ? (
        <div className="surface-paper rounded-[2rem] px-8 py-24 text-center">
          <h2 className="text-display text-3xl">0 páginas</h2>
          <div className="gold-rule mx-auto my-6 h-px w-16" />
          <p className="font-display text-xl text-muted-foreground italic">
            Vamos começar a escrever essa história?
          </p>
        </div>
      ) : (
        <BookReader pages={pages} />
      )}

      <ChapterManagerDialog open={openChapterManager} onOpenChange={setOpenChapterManager} />
    </div>
  );
}

