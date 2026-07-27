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

export const chapterBySlug = (slug: string, customChapters?: ChapterDef[]) => {
  const found =
    customChapters?.find((c) => c.slug === slug) ??
    CHAPTERS.find((c) => c.slug === slug);
  if (found) return found;
  // Dynamic fallback for custom chapters not in list
  const formatTitle = slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
  return {
    slug,
    index: 99,
    title: formatTitle || "Capítulo Especial",
    subtitle: "Um capítulo especial da nossa história.",
  };
};

export function getAllChapters(
  moments?: { chapter_slug: string }[],
  customChapters?: ChapterDef[]
): ChapterDef[] {
  const map = new Map<string, ChapterDef>();
  CHAPTERS.forEach((c) => map.set(c.slug, { ...c }));
  customChapters?.forEach((c) => {
    if (c.title === "__DELETED__") {
      map.delete(c.slug);
    } else {
      map.set(c.slug, c);
    }
  });

  let nextIdx = 100;
  moments?.forEach((m) => {
    if (!map.has(m.chapter_slug)) {
      const def = chapterBySlug(m.chapter_slug, customChapters);
      if (def && def.title !== "__DELETED__") {
        def.index = nextIdx++;
        map.set(m.chapter_slug, def);
      }
    }
  });

  return Array.from(map.values())
    .filter((c) => c.title !== "__DELETED__")
    .sort((a, b) => a.index - b.index);
}

export const FEELINGS = [
  { value: "feliz", label: "Feliz", emoji: "🤍" },
  { value: "emocionado", label: "Emocionado", emoji: "🥹" },
  { value: "orgulhoso", label: "Orgulhoso", emoji: "💛" },
  { value: "surpreso", label: "Surpreso", emoji: "🌙" },
  { value: "ansioso", label: "Ansioso", emoji: "🌿" },
  { value: "grato", label: "Grato", emoji: "🕊️" },
];

export function getFeeling(value?: string | null) {
  if (!value) return null;
  const found = FEELINGS.find((f) => f.value === value);
  if (found) return found;
  return { value, label: value, emoji: "💛" };
}

export const CATEGORIES = [
  { value: "gestacao", label: "Gestação" },
  { value: "ultrassom", label: "Ultrassom" },
  { value: "nascimento", label: "Nascimento" },
  { value: "primeira-vez", label: "Primeira vez" },
  { value: "familia", label: "Família" },
  { value: "passeio", label: "Passeio" },
  { value: "memoria", label: "Memória" },
];

export function getCategoryLabel(value?: string | null) {
  if (!value) return "";
  const found = CATEGORIES.find((c) => c.value === value);
  if (found) return found.label;
  return value.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

/** Cada momento vira aproximadamente 2 páginas do livro (ou 3 se tiver vídeo). */
export const pagesFromMoments = (count: number) => (count === 0 ? 0 : count * 2);

