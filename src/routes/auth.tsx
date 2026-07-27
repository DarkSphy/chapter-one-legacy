import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Entrar — Primeiros Capítulos" },
      {
        name: "description",
        content: "Acesse sua conta e continue escrevendo o livro da vida do seu filho.",
      },
      { property: "og:title", content: "Entrar — Primeiros Capítulos" },
      {
        property: "og:description",
        content: "Um livro feito de memórias, escrito por quem mais ama.",
      },
    ],
  }),
  component: Auth,
});

type Mode = "entrar" | "criar" | "recuperar";

function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("entrar");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/inicio", replace: true });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "recuperar") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Enviamos um link para o seu e-mail.");
        setMode("entrar");
      } else if (mode === "criar") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/inicio`,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        toast.success("Conta criada. Vamos começar o primeiro capítulo.");
        navigate({ to: "/inicio", replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/inicio", replace: true });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível continuar.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Não foi possível entrar com o Google.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/inicio", replace: true });
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between bg-gradient-to-br from-secondary via-background to-gold-soft/50 p-14 lg:flex">
        <p className="font-display text-lg tracking-tight">Primeiros Capítulos</p>
        <div className="space-y-6">
          <h2 className="text-display text-5xl">
            Um livro escrito
            <br />
            aos poucos.
          </h2>
          <div className="gold-rule h-px w-24" />
          <p className="max-w-sm font-display text-xl text-muted-foreground italic">
            "Pequenos passos para o mundo. Gigantes para nossos corações."
          </p>
        </div>
        <p className="text-sm text-muted-foreground">Feito para durar uma vida inteira.</p>
      </aside>

      <main className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm animate-[var(--animate-rise)] space-y-8">
          <header className="space-y-2">
            <p className="label-eyebrow">
              {mode === "criar"
                ? "Começar"
                : mode === "recuperar"
                  ? "Recuperar acesso"
                  : "Bem-vindo de volta"}
            </p>
            <h1 className="text-display text-4xl">
              {mode === "criar"
                ? "Comece o livro dele."
                : mode === "recuperar"
                  ? "Vamos recuperar sua conta."
                  : "Continue a história."}
            </h1>
          </header>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "criar" && (
              <div className="space-y-2">
                <Label htmlFor="nome">Seu nome</Label>
                <Input
                  id="nome"
                  value={name}
                  maxLength={80}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl bg-background"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                maxLength={255}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl bg-background"
              />
            </div>

            {mode !== "recuperar" && (
              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-xl bg-background"
                />
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full rounded-full py-6">
              {loading && <Loader2 className="size-4 animate-spin" />}
              {mode === "criar"
                ? "Criar minha conta"
                : mode === "recuperar"
                  ? "Enviar link"
                  : "Entrar"}
            </Button>
          </form>

          {mode !== "recuperar" && (
            <>
              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">ou</span>
                <span className="h-px flex-1 bg-border" />
              </div>

              <Button
                variant="outline"
                onClick={handleGoogle}
                className="w-full rounded-full border-border py-6"
              >
                Continuar com o Google
              </Button>
            </>
          )}

          <div className="space-y-2 text-center text-sm text-muted-foreground">
            {mode === "entrar" && (
              <>
                <button onClick={() => setMode("recuperar")} className="hover:text-gold">
                  Esqueci minha senha
                </button>
                <p>
                  Ainda não tem conta?{" "}
                  <button
                    onClick={() => setMode("criar")}
                    className={cn("text-foreground hover:text-gold")}
                  >
                    Criar conta
                  </button>
                </p>
              </>
            )}
            {mode !== "entrar" && (
              <button onClick={() => setMode("entrar")} className="hover:text-gold">
                Voltar para o login
              </button>
            )}
            <p>
              <Link to="/" className="text-xs hover:text-gold">
                Conhecer o Primeiros Capítulos
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
