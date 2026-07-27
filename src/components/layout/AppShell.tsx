import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { BookOpen, LogOut, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MomentDialog } from "@/components/moments/MomentDialog";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/inicio", label: "Início" },
  { to: "/livro", label: "Meu Livro" },
  { to: "/linha-do-tempo", label: "Linha do tempo" },
  { to: "/crianca", label: "Perfil" },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [defaultChapter, setDefaultChapter] = useState<string | undefined>(undefined);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const handleOpen = (e: any) => {
      setDefaultChapter(e.detail?.chapter);
      setOpen(true);
    };
    window.addEventListener("open-moment-dialog", handleOpen);
    return () => window.removeEventListener("open-moment-dialog", handleOpen);
  }, []);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 sm:flex sm:justify-between">
          <Link to="/inicio" className="flex min-w-0 items-center gap-3 group">
            <img src="/logo.png" alt="Primeiros Capítulos" className="size-7 rounded-full object-cover border border-gold/40 shadow-xs transition-transform duration-300 group-hover:scale-105" />
            <span className="truncate font-display text-lg tracking-tight font-medium">
              Primeiros Capítulos
            </span>
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground",
                  pathname === item.to && "bg-secondary text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={signOut}
              aria-label="Sair"
              className="ml-1 rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <LogOut className="size-4" strokeWidth={1.5} />
            </button>
          </nav>

          <button
            onClick={signOut}
            aria-label="Sair"
            className="justify-self-end rounded-full p-2 text-muted-foreground sm:hidden"
          >
            <LogOut className="size-4" strokeWidth={1.5} />
          </button>
        </div>

        <nav className="flex gap-1 overflow-x-auto border-t border-border/60 px-4 py-2 sm:hidden">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-sm text-muted-foreground",
                pathname === item.to && "bg-secondary text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main>{children}</main>

      <button
        onClick={() => {
          setDefaultChapter(undefined);
          setOpen(true);
        }}
        className="fixed right-5 bottom-6 z-40 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-lift)] transition-transform duration-300 hover:-translate-y-0.5 sm:right-8 sm:bottom-8"
      >
        <Plus className="size-4" strokeWidth={1.75} />
        Escrever uma página
      </button>

      <MomentDialog open={open} onOpenChange={setOpen} defaultChapter={defaultChapter} />
    </div>
  );
}
