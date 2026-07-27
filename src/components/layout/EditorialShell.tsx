import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { BookOpen, Sparkles, Compass, Users, LogOut, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const EDITORIAL_NAV = [
  { to: "/inicio", label: "O Livro Vivo", icon: BookOpen },
  { to: "/livro", label: "Sumário & Épocas", icon: Compass },
  { to: "/crianca", label: "Legado & Família", icon: Users },
] as const;

export function EditorialShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-gold/20 selection:text-obsidian">
      {/* Top Editorial Header Minimalista */}
      <header className={cn(
        "sticky top-0 z-40 transition-all duration-500 px-6 sm:px-12 py-6 flex items-center justify-between",
        scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border/40 py-4" : "bg-transparent"
      )}>
        <Link to="/inicio" className="flex items-center gap-3.5 group">
          <div className="size-9 rounded-full bg-paper border border-gold/40 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300">
            <span className="font-display italic text-lg text-gold font-bold">P</span>
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg sm:text-xl tracking-tight font-semibold text-foreground group-hover:text-gold transition-colors">
              Primeiros Capítulos
            </span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-sans font-medium">
              Legado da Família
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("open-ai-studio"))}
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-obsidian text-paper font-sans text-xs font-medium tracking-wide shadow-sm hover:bg-gold hover:text-obsidian transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <Sparkles className="size-3.5 text-gold animate-pulse" />
            <span>Co-escrever Página com IA</span>
          </button>

          <button
            onClick={signOut}
            title="Sair do Livro"
            className="p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
          >
            <LogOut className="size-4" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* Main Content Area (O Livro) */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 pb-32 pt-2 animate-rise">
        {children}
      </main>

      {/* Floating Linear/Arc Command Bar no Rodapé */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-lg">
        <nav className="surface-float rounded-full px-3 py-2 flex items-center justify-between shadow-float">
          <div className="flex items-center gap-1">
            {EDITORIAL_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.to || pathname.startsWith(item.to + "/");
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-sans font-medium transition-all duration-300",
                    isActive
                      ? "bg-obsidian text-paper shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  )}
                >
                  <Icon className={cn("size-3.5", isActive ? "text-gold" : "opacity-70")} />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="h-4 w-[1px] bg-border mx-1" />

          {/* Botão de Criação IA Móvel & Desktop */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("open-ai-studio"))}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gold text-white font-sans text-xs font-semibold tracking-wide shadow-sm hover:bg-gold-bright hover:scale-105 transition-all duration-300"
          >
            <Sparkles className="size-3.5" />
            <span>+ Página IA</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
