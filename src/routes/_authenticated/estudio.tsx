import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AIEditorStudio } from "@/components/editor/AIEditorStudio";

export const Route = createFileRoute("/_authenticated/estudio")({
  component: EstudioPage,
});

function EstudioPage() {
  const navigate = useNavigate();

  return (
    <div className="py-12 px-4 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <AIEditorStudio
        open={true}
        onOpenChange={(open) => {
          if (!open) {
            navigate({ to: "/inicio" });
          }
        }}
      />
    </div>
  );
}
