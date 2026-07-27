import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Primeiros Capítulos — O livro da vida do seu filho" },
      {
        name: "description",
        content:
          "Transforme a gravidez e os primeiros anos do seu filho em um livro emocionante, escrito aos poucos com ajuda de inteligência artificial.",
      },
      { property: "og:title", content: "Primeiros Capítulos — O livro da vida do seu filho" },
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
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/inicio", replace: true });
    });
  }, [navigate]);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-gold-soft">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display text-xl font-medium tracking-tight">Primeiros Capítulos</span>
            <span className="text-[10px] uppercase tracking-widest text-gold border border-gold/40 px-2 py-0.5 rounded-full font-sans">
              Edição Memória
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
              <a href="#como-funciona" className="hover:text-foreground transition-colors">Como funciona</a>
              <a href="#capitulos" className="hover:text-foreground transition-colors">Os Capítulos</a>
              <a href="#diferenciais" className="hover:text-foreground transition-colors">Diferenciais</a>
              <a href="#faq" className="hover:text-foreground transition-colors">Dúvidas</a>
            </nav>
            <Link to="/auth" className="text-sm font-medium text-primary hover:text-gold transition-colors">
              Entrar
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="mx-auto max-w-4xl px-6 pt-20 pb-16 text-center sm:pt-28 sm:pb-24">
          <span className="label-eyebrow animate-[var(--animate-fade)]">Um legado, não apenas um aplicativo</span>
          <h1 className="text-display mt-6 animate-[var(--animate-rise)] text-5xl sm:text-7xl leading-[1.08] text-balance">
            O livro mais importante
            <br />
            da vida do seu filho.
          </h1>
          <div className="gold-rule mx-auto my-8 h-px w-28" />
          <p className="mx-auto max-w-2xl font-display text-xl sm:text-2xl leading-relaxed text-muted-foreground italic font-light">
            Escreva poucas linhas sobre um momento. Nossa inteligência artificial transforma em uma história emocionante — e cada memória vira uma página do livro dele.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/auth"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-full bg-primary px-8 py-4 text-base font-medium text-primary-foreground shadow-lift transition-all duration-300 hover:-translate-y-0.5 hover:shadow-book"
            >
              Escrever o primeiro capítulo
            </Link>
            <a
              href="#como-funciona"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-border bg-paper/60 px-8 py-4 text-base font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Conhecer como funciona
            </a>
          </div>

          {/* Book Mockup Preview Card */}
          <div className="mt-16 mx-auto max-w-3xl surface-paper rounded-3xl p-8 sm:p-12 text-left relative overflow-hidden border border-border shadow-book animate-[var(--animate-page)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-soft/30 rounded-bl-full pointer-events-none" />
            <span className="label-eyebrow">Exemplo de Página • Capítulo 1</span>
            <h3 className="mt-3 font-display text-3xl sm:text-4xl">"O dia em que soubemos de você"</h3>
            <p className="mt-4 font-display text-lg text-muted-foreground italic leading-relaxed">
              "Era uma manhã quieta de terça-feira quando duas linhas paralelas mudaram nosso mundo para sempre. O teste tremia nas minhas mãos, mas o coração batia com a certeza de que a maior aventura da nossa vida estava apenas começando..."
            </p>
            <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4 text-xs text-muted-foreground">
              <span>Maternidade • 12 de Março, 2026</span>
              <span className="text-gold font-medium">Página 12</span>
            </div>
          </div>
        </section>

        {/* Como Funciona */}
        <section id="como-funciona" className="bg-secondary/40 py-20 border-y border-border/50">
          <div className="mx-auto max-w-5xl px-6">
            <div className="text-center max-w-2xl mx-auto">
              <span className="label-eyebrow">Simplicidade & Afeto</span>
              <h2 className="text-display text-4xl sm:text-5xl mt-3">Como nasce a história do seu filho</h2>
              <p className="mt-3 text-muted-foreground">Sem precisar gastar horas escrevendo. Bastam 2 minutos por semana.</p>
            </div>

            <div className="mt-14 grid gap-8 sm:grid-cols-3">
              <div className="surface-paper rounded-2xl p-8 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-gold-soft flex items-center justify-center font-display text-2xl text-primary font-medium mb-5">1</div>
                <h3 className="font-display text-2xl">Você envia o momento</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Envie uma frase curta, um áudio ou uma foto do dia. Pode ser uma descoberta, uma risada ou o primeiro dente.
                </p>
              </div>

              <div className="surface-paper rounded-2xl p-8 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-gold-soft flex items-center justify-center font-display text-2xl text-primary font-medium mb-5">2</div>
                <h3 className="font-display text-2xl">A IA dá vida às palavras</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Nossa inteligência afetuosa transforma seu relato cru em um texto emocionante, sensível e poético.
                </p>
              </div>

              <div className="surface-paper rounded-2xl p-8 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-gold-soft flex items-center justify-center font-display text-2xl text-primary font-medium mb-5">3</div>
                <h3 className="font-display text-2xl">Você recebe o livro físico</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  As memórias organizadas viram um livro impresso de capa dura com qualidade de colecionador para guardar para sempre.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Os Capítulos */}
        <section id="capitulos" className="py-20">
          <div className="mx-auto max-w-5xl px-6">
            <div className="text-center max-w-2xl mx-auto">
              <span className="label-eyebrow">Estágios do Crescimento</span>
              <h2 class="text-display text-4xl sm:text-5xl mt-3">Cada fase, um capítulo especial</h2>
              <p className="mt-3 text-muted-foreground">O livro é organizado cronologicamente para acompanhar toda a infância.</p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {[
                { t: "Capítulo 1: A Espera", d: "Antes de você nascer, a descoberta e a gestação." },
                { t: "Capítulo 2: A Chegada", d: "As primeiras horas, o quarto e o primeiro abraço." },
                { t: "Capítulo 3: Primeiras Descobertas", d: "O primeiro sorriso, os passos e as primeiras palavras." },
              ].map((item) => (
                <div key={item.t} className="surface-paper rounded-2xl p-7 border border-border/80 hover:border-gold/50 transition-colors">
                  <span className="label-eyebrow text-gold">Livro I</span>
                  <h3 className="mt-2 font-display text-2xl">{item.t}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Differentials */}
        <section id="diferenciais" className="bg-secondary/30 py-20 border-t border-border/50">
          <div className="mx-auto max-w-5xl px-6">
            <div className="grid gap-12 sm:grid-cols-2 items-center">
              <div>
                <span className="label-eyebrow">Feito para Gerações</span>
                <h2 className="text-display text-4xl sm:text-5xl mt-3">Por que o Primeiros Capítulos é único?</h2>
                <div className="gold-rule my-6 h-px w-20" />
                <ul className="space-y-6">
                  <li className="flex gap-4">
                    <span className="text-gold font-bold text-xl">✦</span>
                    <div>
                      <h4 className="font-display text-xl">Tom poético e emocionante</h4>
                      <p className="text-sm text-muted-foreground mt-1">A IA não cria respostas robóticas, mas ajusta a narrativa com o carinho de uma memória familiar.</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-gold font-bold text-xl">✦</span>
                    <div>
                      <h4 className="font-display text-xl">Privacidade total da família</h4>
                      <p className="text-sm text-muted-foreground mt-1">Suas fotos e textos nunca são compartilhados ou usados para treinar redes públicas.</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-gold font-bold text-xl">✦</span>
                    <div>
                      <h4 className="font-display text-xl">Impressão em papel nobre</h4>
                      <p className="text-sm text-muted-foreground mt-1">O livro físico é impresso com acabamento atemporal para resistir a décadas de leitura.</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="surface-paper rounded-3xl p-8 border border-border shadow-lift">
                <blockquote className="font-display text-2xl italic text-foreground leading-relaxed">
                  "Quando meu filho fizer 18 anos, não vou entregar um feed de rede social. Vou entregar este livro impresso nas mãos dele."
                </blockquote>
                <div className="mt-6 flex items-center gap-4 border-t border-border pt-4">
                  <div className="w-10 h-10 rounded-full bg-gold-soft flex items-center justify-center font-display font-bold text-primary">C</div>
                  <div>
                    <h5 className="font-medium text-sm">Carolina M.</h5>
                    <p className="text-xs text-muted-foreground">Mãe do Bento (2 anos)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Accordion */}
        <section id="faq" className="py-20">
          <div className="mx-auto max-w-3xl px-6">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="label-eyebrow">Dúvidas Frequentes</span>
              <h2 className="text-display text-4xl mt-2">Perguntas comuns</h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "Como a inteligência artificial ajuda a escrever o livro?",
                  a: "Você só precisa digitar frases curtas ou mandar um áudio com suas memórias. A nossa IA organiza a cronologia e reescreve os fatos com uma linguagem emocionante e fluida, sem perder a essência do seu relato."
                },
                {
                  q: "Preciso escrever todos os dias?",
                  a: "Não! O Primeiros Capítulos foi pensado para a rotina corrida de pais. Escrever 1 vez por semana ou até 1 vez por mês é suficiente para criar um livro completo ao final do ano."
                },
                {
                  q: "Quando recebo o livro impresso?",
                  a: "Ao completar os capítulos de uma fase (ex: 1º Ano de Vida), você pode revisar todas as páginas, escolher a foto da capa e solicitar a impressão direta na sua casa."
                },
                {
                  q: "Minhas memórias e fotos estão seguras?",
                  a: "Sim. Usamos criptografia de ponta a ponta. Seus dados pertencem unicamente a você e sua família."
                }
              ].map((faq, idx) => (
                <div key={idx} className="surface-paper rounded-xl border border-border overflow-hidden transition-colors">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-6 py-5 text-left font-display text-xl flex justify-between items-center gap-4"
                  >
                    <span>{faq.q}</span>
                    <span className="text-gold text-2xl font-light">{activeFaq === idx ? "−" : "+"}</span>
                  </button>
                  {activeFaq === idx && (
                    <div className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="bg-primary text-primary-foreground py-20 text-center relative overflow-hidden">
          <div className="mx-auto max-w-3xl px-6 relative z-10">
            <h2 className="text-display text-4xl sm:text-6xl leading-tight">
              Comece a escrever o legado da sua família hoje.
            </h2>
            <p className="mt-4 font-display text-xl text-primary-foreground/80 italic">
              Cada momento que passa é um momento que merece ser lembrado.
            </p>
            <Link
              to="/auth"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-gold px-10 py-4 text-base font-medium text-foreground shadow-lift hover:bg-gold-soft transition-colors"
            >
              Criar Meu Primeiro Capítulo
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-background text-muted-foreground text-sm">
        <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="font-display text-lg text-foreground font-medium">Primeiros Capítulos</span>
            <span>— Cada página vira um legado.</span>
          </div>
          <p className="text-xs">&copy; {new Date().getFullYear()} Primeiros Capítulos. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

