import { useState, useEffect } from "react";
import { EditorialShell } from "@/components/layout/EditorialShell";
import { AIEditorStudio } from "@/components/editor/AIEditorStudio";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [openStudio, setOpenStudio] = useState(false);
  const [defaultChapter, setDefaultChapter] = useState<string | undefined>(undefined);

  useEffect(() => {
    const handleOpen = (e: any) => {
      setDefaultChapter(e.detail?.chapter);
      setOpenStudio(true);
    };
    window.addEventListener("open-moment-dialog", handleOpen);
    window.addEventListener("open-ai-studio", handleOpen);
    return () => {
      window.removeEventListener("open-moment-dialog", handleOpen);
      window.removeEventListener("open-ai-studio", handleOpen);
    };
  }, []);

  return (
    <EditorialShell>
      {children}
      <AIEditorStudio open={openStudio} onOpenChange={setOpenStudio} defaultChapter={defaultChapter} />
    </EditorialShell>
  );
}
