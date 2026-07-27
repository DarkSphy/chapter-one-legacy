import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Primeiros Capítulos — o livro da vida do seu filho" },
      {
        name: "description",
        content:
          "Transforme a gravidez e os primeiros anos do seu filho em um livro emocionante, escrito aos poucos com ajuda de inteligência artificial.",
      },
      { property: "og:title", content: "Primeiros Capítulos — o livro da vida do seu filho" },
      {
        property: "og:description",
        content: "Cada memória vira uma página. Cada página vira um legado.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/inicio", replace: true });
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-display text-lg tracking-tight">Primeiros Capítulos</span>
        <Link to="/auth" className="text-sm text-muted-foreground hover:text-gold">
          Entrar
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-24 text-center sm:py-36">
        <p className="label-eyebrow animate-[var(--animate-fade)]">Um legado, não um aplicativo</p>
        <h1 className="text-display mt-6 animate-[var(--animate-rise)] text-5xl sm:text-7xl">
          O livro mais importante
          <br />
          da vida do seu filho.
        </h1>
        <div className="gold-rule mx-auto my-9 h-px w-24" />
        <p className="mx-auto max-w-xl font-display text-xl leading-relaxed text-muted-foreground italic">
          Escreva poucas linhas sobre um momento. Nós transformamos em uma história — e cada
          história vira uma página do livro dele.
        </p>

        <Link
          to="/auth"
          className="mt-12 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-medium text-primary-foreground transition-transform duration-300 hover:-translate-y-0.5"
        >
          Começar o primeiro capítulo
        </Link>

        <section className="mt-28 grid gap-10 text-left sm:grid-cols-3">
          {[
            { t: "Capítulo 1", d: "Antes de você nascer." },
            { t: "Capítulo 3", d: "Sua chegada." },
            { t: "Capítulo 6", d: "Primeiros passos." },
          ].map((item) => (
            <div key={item.t} className="surface-paper rounded-2xl p-6">
              <p className="label-eyebrow">{item.t}</p>
              <p className="mt-2 font-display text-2xl font-light">{item.d}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
