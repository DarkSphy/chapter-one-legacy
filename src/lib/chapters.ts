export type ChapterDef = {
  slug: string;
  index: number;
  title: string;
  subtitle: string;
};

export const CHAPTERS: ChapterDef[] = [
  {
    slug: "antes-de-voce",
    index: 1,
    title: "Antes de você nascer",
    subtitle: "O mundo esperando, sem saber o que estava por vir.",
  },
  {
    slug: "esperando-voce",
    index: 2,
    title: "Esperando você",
    subtitle: "Nove meses de contagem, de sonhos e de barriga crescendo.",
  },
  {
    slug: "sua-chegada",
    index: 3,
    title: "Sua chegada",
    subtitle: "O dia em que o tempo parou.",
  },
  {
    slug: "primeiras-descobertas",
    index: 4,
    title: "Primeiras descobertas",
    subtitle: "Tudo era novo, inclusive nós.",
  },
  {
    slug: "primeiros-sorrisos",
    index: 5,
    title: "Primeiros sorrisos",
    subtitle: "E o mundo ficou mais leve.",
  },
  {
    slug: "primeiros-passos",
    index: 6,
    title: "Primeiros passos",
    subtitle: "Pequenos para o mundo. Gigantes para nós.",
  },
];

export const chapterBySlug = (slug: string) =>
  CHAPTERS.find((c) => c.slug === slug) ?? CHAPTERS[0];

export const FEELINGS = [
  { value: "feliz", label: "Feliz", emoji: "🤍" },
  { value: "emocionado", label: "Emocionado", emoji: "🥹" },
  { value: "orgulhoso", label: "Orgulhoso", emoji: "✨" },
  { value: "surpreso", label: "Surpreso", emoji: "🌙" },
  { value: "ansioso", label: "Ansioso", emoji: "🌿" },
  { value: "grato", label: "Grato", emoji: "🕊️" },
];

export const CATEGORIES = [
  { value: "gestacao", label: "Gestação" },
  { value: "ultrassom", label: "Ultrassom" },
  { value: "nascimento", label: "Nascimento" },
  { value: "primeira-vez", label: "Primeira vez" },
  { value: "familia", label: "Família" },
  { value: "passeio", label: "Passeio" },
  { value: "memoria", label: "Memória" },
];

/** Cada momento vira aproximadamente 2 páginas do livro. */
export const pagesFromMoments = (count: number) => (count === 0 ? 0 : count * 2);
