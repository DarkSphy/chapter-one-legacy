import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Primeiros Capítulos: O livro da vida do seu filho" },
      {
        name: "description",
        content:
          "Transforme a gravidez e os primeiros anos do seu filho em um livro emocionante, escrito aos poucos por quem mais ama.",
      },
      { property: "og:title", content: "Primeiros Capítulos: O livro da vida do seu filho" },
      {
        property: "og:description",
        content: "Cada memória vira uma página. Cada página vira um legado eterno.",
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
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo Primeiros Capítulos" className="w-9 h-9 rounded-full object-cover border border-gold/40 shadow-sm" />
            <div className="flex flex-col text-left">
              <span className="font-display text-xl font-medium tracking-tight leading-none">Primeiros Capítulos</span>
              <span className="text-[9px] uppercase tracking-widest text-gold font-sans font-semibold mt-1">
                Livro da Vida do Seu Filho
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
              <a href="#como-funciona" className="hover:text-foreground transition-colors">Como funciona</a>
              <a href="#capitulos" className="hover:text-foreground transition-colors">Personalização</a>
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
        <section className="mx-auto max-w-5xl px-6 pt-16 pb-16 text-center sm:pt-24 sm:pb-24">
          <span className="label-eyebrow animate-[var(--animate-fade)]">Um legado eterno, não apenas uma rede social</span>
          <h1 className="text-display mt-6 animate-[var(--animate-rise)] text-5xl sm:text-7xl leading-[1.08] text-balance">
            O livro mais importante
            <br />
            da vida do seu filho.
          </h1>
          <div className="gold-rule mx-auto my-8 h-px w-28" />
          <p className="mx-auto max-w-2xl font-display text-xl sm:text-2xl leading-relaxed text-muted-foreground italic font-light">
            Escreva os relatos com suas próprias palavras, anexe fotos marcantes e adicione links de vídeos. Sua história é diagramada como um livro editorial, acessível online a qualquer momento e entregue em arquivo PDF de alta resolução, pronto para imprimir onde e quando você quiser.
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

          {/* Visual Transformation Showcase */}
          <div className="mt-16 mx-auto surface-paper rounded-3xl p-6 sm:p-10 border border-border shadow-book animate-[var(--animate-page)] relative overflow-hidden">
            <div className="text-center mb-8">
              <span className="label-eyebrow text-gold">A Magia do Legado</span>
              <h3 className="font-display text-3xl mt-1">Das lembranças cotidianas direto para as páginas da vida dele</h3>
            </div>

            <div className="grid sm:grid-cols-2 gap-8 items-center text-left">
              {/* Left Side: Memory Entry Card */}
              <div className="bg-background/80 backdrop-blur-sm border border-border rounded-2xl p-6 relative shadow-sm">
                <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-gold animate-pulse"></span>
                    <span className="text-xs font-mono text-muted-foreground">Registro de Memória: Fase 1º Ano</span>
                  </div>
                  <span className="text-[10px] bg-gold-soft/40 text-gold px-2.5 py-1 rounded-full font-medium">100% Personalizado</span>
                </div>
                <p className="text-sm font-sans text-foreground/90 italic leading-relaxed">
                  "Hoje o Pedro deu os primeiros passinhos no meio da sala. Ficou sorrindo e correu direto para os meus braços. Um dia que nunca esqueceremos."
                </p>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/30 font-medium">
                  <span>📸 Foto anexada</span>
                  <span>🎬 Link do Vídeo incluído</span>
                </div>
              </div>

              {/* Right Side: Digital Book / PDF Showcase */}
              <div className="relative group">
                <div className="rounded-2xl overflow-hidden border border-border shadow-lift relative">
                  <img 
                    src="/book-mockup.jpg" 
                    alt="Livro Digital e PDF Primeiros Capítulos" 
                    className="w-full h-64 object-cover transform transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent flex items-end p-5">
                    <div>
                      <span className="text-xs font-display text-gold">Acesso Digital & Arquivo PDF</span>
                      <h4 className="font-display text-xl text-foreground mt-0.5">"Os Primeiros Passos na Sala"</h4>
                      <p className="text-[11px] text-muted-foreground mt-1">Leia na plataforma ou exporte o arquivo para imprimir.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Como Funciona */}
        <section id="como-funciona" className="bg-secondary/40 py-20 border-y border-border/50">
          <div className="mx-auto max-w-5xl px-6">
            <div className="text-center max-w-2xl mx-auto">
              <span className="label-eyebrow">Simplicidade & Afeto</span>
              <h2 className="text-display text-4xl sm:text-5xl mt-3">Como nasce o livro da sua família</h2>
              <p className="mt-3 text-muted-foreground">Sem complicação ou perda de tempo. Bastam alguns minutos por semana ou no seu próprio ritmo.</p>
            </div>

            <div className="mt-14 grid gap-8 sm:grid-cols-3">
              <div className="surface-paper rounded-2xl p-8 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-gold-soft flex items-center justify-center font-display text-2xl text-primary font-medium mb-5">1</div>
                <h3 className="font-display text-2xl">Você registra o momento</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Escreva um relato sincero sobre um acontecimento marcante, anexe as melhores fotografias e inclua o link do vídeo de onde ele estiver armazenado na nuvem.
                </p>
              </div>

              <div className="surface-paper rounded-2xl p-8 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-gold-soft flex items-center justify-center font-display text-2xl text-primary font-medium mb-5">2</div>
                <h3 className="font-display text-2xl">Organização por épocas</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  O sistema agrupa suas lembranças em capítulos e fases literárias, sem numerações forçadas. Você tem controle total para criar e reordenar as etapas da infância.
                </p>
              </div>

              <div className="surface-paper rounded-2xl p-8 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-gold-soft flex items-center justify-center font-display text-2xl text-primary font-medium mb-5">3</div>
                <h3 className="font-display text-2xl">Acesso digital ou PDF</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Leia o livro interativo com cinema na própria plataforma, ou gere o arquivo em formato PDF com links de acesso aos vídeos para imprimir quando desejar.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Os Capítulos e Customização */}
        <section id="capitulos" className="py-20">
          <div className="mx-auto max-w-5xl px-6">
            <div className="text-center max-w-2xl mx-auto">
              <span className="label-eyebrow">Liberdade & Personalização</span>
              <h2 className="text-display text-4xl sm:text-5xl mt-3">Capítulos definidos por você</h2>
              <p className="mt-3 text-muted-foreground">Sua história não segue fórmulas prontas. Você escolhe os nomes das fases sem ficar preso a números engessados.</p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {[
                { t: "Fase da Espera", d: "As lembranças da gestação, os preparativos do quarto e o chá de bebê." },
                { t: "A Chegada em Casa", d: "Os primeiros dias de resguardo, o acolhimento da família e o primeiro banho." },
                { t: "Capítulos Especiais", d: "Crie suas próprias épocas: o batizado, a primeira viagem à praia ou os aniversários." },
              ].map((item, idx) => (
                <div key={item.t} className="surface-paper rounded-2xl p-7 border border-border/80 hover:border-gold/50 transition-colors">
                  <span className="label-eyebrow text-gold">Época Literária {idx + 1}</span>
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
                <span className="label-eyebrow">Feito para Famílias</span>
                <h2 className="text-display text-4xl sm:text-5xl mt-3">Por que o Primeiros Capítulos é único?</h2>
                <div className="gold-rule my-6 h-px w-20" />
                <ul className="space-y-6">
                  <li className="flex gap-4">
                    <span className="text-gold font-bold text-xl">✦</span>
                    <div>
                      <h4 className="font-display text-xl">Autenticidade e liberdade total</h4>
                      <p className="text-sm text-muted-foreground mt-1">Você escreve os textos com as suas palavras e define suas categorias, sentimentos e capítulos exatamente como preferir.</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-gold font-bold text-xl">✦</span>
                    <div>
                      <h4 className="font-display text-xl">Vídeo integrado e acessível no PDF</h4>
                      <p className="text-sm text-muted-foreground mt-1">O livro digital possui cinema de lembranças, e ao gerar o PDF, cada vídeo conta com um link para acesso em qualquer lugar.</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-gold font-bold text-xl">✦</span>
                    <div>
                      <h4 className="font-display text-xl">Pronto para imprimir quando quiser</h4>
                      <p className="text-sm text-muted-foreground mt-1">O livro é seu. Acesse online de qualquer aparelho ou faça o download do arquivo PDF diagramado para mandar imprimir.</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="surface-paper rounded-3xl p-8 border border-border shadow-lift">
                <blockquote className="font-display text-2xl italic text-foreground leading-relaxed">
                  "Quando meu filho crescer, não vou mostrar apenas postagens em redes sociais. Vou entregar o arquivo PDF e o livro impresso da história dele."
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
                  q: "Como recebo e acesso o meu livro terminado?",
                  a: "O livro fica disponível em tempo real na plataforma para você ler, editar e assistir aos vídeos de qualquer dispositivo conectado à internet. Quando desejar, você pode exportar a edição completa em formato PDF de alta resolução."
                },
                {
                  q: "Posso imprimir o arquivo PDF em uma gráfica ou em casa?",
                  a: "Com certeza. O nosso arquivo PDF já é entregue totalmente diagramado no formato de livro editorial de luxo. Basta salvar o arquivo e imprimir onde você preferir para ter a versão física nas mãos."
                },
                {
                  q: "Como funcionam os vídeos na versão em PDF e na impressão?",
                  a: "No livro digital online, você assiste aos vídeos diretamente na tela. Na versão em PDF ou impressa, criamos um quadro especial com o endereço (link) do vídeo em nuvem para que o leitor possa acessar facilmente através do computador ou celular."
                },
                {
                  q: "Sou obrigado a usar números fixos como Capítulo 1 e Capítulo 2?",
                  a: "Não. Nós liberamos a estrutura de numeração fixa. Você pode criar, renomear, excluir ou reordenar as fases da vida do seu filho com liberdade total, usando títulos poéticos ou datas que façam sentido para a sua família."
                }
              ].map((faq, idx) => (
                <div key={idx} className="surface-paper rounded-xl border border-border overflow-hidden transition-colors">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-6 py-5 text-left font-display text-xl flex justify-between items-center gap-4"
                  >
                    <span>{faq.q}</span>
                    <span className="text-gold text-2xl font-light">{activeFaq === idx ? "+" : "-"}</span>
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
              Cada momento que passa merece ser guardado para sempre.
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
            <span>: Cada página vira um legado.</span>
          </div>
          <p className="text-xs">&copy; {new Date().getFullYear()} Primeiros Capítulos. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
