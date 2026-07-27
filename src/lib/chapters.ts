export type ChapterDef = {
  slug: string;
  index: number;
  title: string;
  subtitle: string;
};

export const CHAPTERS: ChapterDef[] = [];

const LEGACY_CHAPTERS: Record<string, { title: string; subtitle: string }> = {
  "antes-de-voce": { title: "Antes de você nascer", subtitle: "O mundo esperando, sem saber o que estava por vir." },
  "esperando-voce": { title: "Esperando você", subtitle: "Nove meses de contagem, de sonhos e de barriga crescendo." },
  "sua-chegada": { title: "Sua chegada", subtitle: "O dia em que o tempo parou." },
  "primeiras-descobertas": { title: "Primeiras descobertas", subtitle: "Tudo era novo, inclusive nós." },
  "primeiros-sorrisos": { title: "Primeiros sorrisos", subtitle: "E o mundo ficou mais leve." },
  "primeiros-passos": { title: "Primeiros passos", subtitle: "Pequenos para o mundo. Gigantes para nós." },
};

export const chapterBySlug = (slug: string, customChapters?: ChapterDef[]) => {
  const found = customChapters?.find((c) => c.slug === slug);
  if (found) return found;
  if (LEGACY_CHAPTERS[slug]) {
    return {
      slug,
      index: 99,
      title: LEGACY_CHAPTERS[slug].title,
      subtitle: LEGACY_CHAPTERS[slug].subtitle,
    };
  }
  // Dynamic fallback for custom chapters not in list
  const formatTitle = slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
  return {
    slug,
    index: 99,
    title: formatTitle || "Nossa História",
    subtitle: "Um capítulo especial da nossa história.",
  };
};

export function getAllChapters(
  moments?: { chapter_slug: string }[],
  customChapters?: ChapterDef[]
): ChapterDef[] {
  const map = new Map<string, ChapterDef>();
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

export const CATEGORIES: { value: string; label: string }[] = [];

export function getCategoryLabel(value?: string | null) {
  if (!value) return "";
  const found = CATEGORIES.find((c) => c.value === value);
  if (found) return found.label;
  return value.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

/** Cada momento vira aproximadamente 2 páginas do livro (ou 3 se tiver vídeo). */
export const pagesFromMoments = (count: number) => (count === 0 ? 0 : count * 2);

