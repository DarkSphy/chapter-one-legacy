import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Nova senha — Primeiros Capítulos" },
      { name: "description", content: "Defina uma nova senha para voltar ao seu livro." },
      { property: "og:title", content: "Nova senha — Primeiros Capítulos" },
      { property: "og:description", content: "Recupere o acesso à sua conta em segundos." },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Senha atualizada.");
      navigate({ to: "/inicio", replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível atualizar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
        <header className="space-y-2">
          <p className="label-eyebrow">Quase lá</p>
          <h1 className="text-display text-4xl">Defina uma nova senha.</h1>
        </header>
        <div className="space-y-2">
          <Label htmlFor="senha">Nova senha</Label>
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
        <Button type="submit" disabled={loading} className="w-full rounded-full py-6">
          {loading && <Loader2 className="size-4 animate-spin" />}
          Salvar nova senha
        </Button>
      </form>
    </div>
  );
}
