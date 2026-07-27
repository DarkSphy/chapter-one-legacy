import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMoments, useCustomChapters } from "@/hooks/useLibrary";
import { getAllChapters } from "@/lib/chapters";
import { TableOfContents } from "@/components/book/TableOfContents";

export const Route = createFileRoute("/_authenticated/livro")({
  component: LivroPage,
});

function LivroPage() {
  const navigate = useNavigate();
  const { data: moments = [], isLoading: momentsLoading } = useMoments();
  const { data: dbChapters } = useCustomChapters();
  const allChapters = getAllChapters(undefined, dbChapters);

  return (
    <div className="py-2">
      <TableOfContents
        chapters={allChapters}
        moments={moments}
        onSelectPage={(index) => {
          // Quando seleciona uma página no sumário, volta para /inicio e abre lá
          navigate({ to: "/inicio" });
        }}
        onNewChapter={() => window.dispatchEvent(new CustomEvent("open-ai-studio"))}
      />
    </div>
  );
}
