/**
 * O Livro Vivo — Motor da Editora IA (AI Editor Engine)
 * 
 * "A IA não é um chatbot. Ela é uma escritora. Ela transforma registros simples em histórias. 
 *  Ela organiza capítulos. Ela escolhe títulos. Ela cria narrativas."
 */

export interface EditorialPageDraft {
  title: string;
  story_text: string;
  chapter_title: string;
  feeling: string;
  tags: string[];
  happened_on: string;
  place?: string;
}

// Palavras-chave relacionando termos ao tom de capítulo e sentimento
const CHAPTER_THEMES: Record<string, { chapter: string; feeling: string; titlePrefixes: string[] }> = {
  nascimento: { chapter: "O Milagre da Chegada", feeling: "Pura Emoção", titlePrefixes: ["O Primeiro Choro de", "O Dia em Que Conhecemos", "A Chegada de"] },
  parto: { chapter: "O Milagre da Chegada", feeling: "Abençoada", titlePrefixes: ["A Luz do Primeiro Dia:", "Nosso Milagre:"] },
  passo: { chapter: "Os Primeiros Passos", feeling: "Orgulho Infinito", titlePrefixes: ["A Conquista do Equilíbrio:", "O Primeiro Passo em", "Caminhando em"] },
  andar: { chapter: "Os Primeiros Passos", feeling: "Orgulho Infinito", titlePrefixes: ["Pezinhos Aventureiros:", "O Mundo aos Seus Pés:"] },
  dente: { chapter: "Pequenas Grandes Conquistas", feeling: "Encantamento", titlePrefixes: ["O Primeiro Dentinho:", "Um Sorriso de Pérola:"] },
  falar: { chapter: "As Primeiras Palavras", feeling: "Doçura", titlePrefixes: ["A Voz do Coração:", "Quando Você Disse:"] },
  palavra: { chapter: "As Primeiras Palavras", feeling: "Encantada", titlePrefixes: ["O Eco da Sua Voz:", "Primeiras Sílabas:"] },
  mae: { chapter: "O Vínculo Eterno", feeling: "Amor Incondicional", titlePrefixes: ["O Colo Mais Seguro:", "No Aconchego de Mãe:"] },
  pai: { chapter: "O Vínculo Eterno", feeling: "Proteção e Amor", titlePrefixes: ["Os Braços do Papai:", "A Força de Nosso Amor:"] },
  avo: { chapter: "O Amor de Geração em Geração", feeling: "Gratidão e Ternura", titlePrefixes: ["No Colo dos Avós:", "A Bênção das Gerações:"] },
  praia: { chapter: "Descobrindo o Mundo", feeling: "Liberdade e Paz", titlePrefixes: ["O Batismo do Mar:", "Pezinhos na Areia:"] },
  viagem: { chapter: "Descobrindo o Mundo", feeling: "Aventura e Alegria", titlePrefixes: ["Nosso Primeiro Horizonte:", "Explorando o Mundo Comigo:"] },
  aniversario: { chapter: "Comemorando a Vida", feeling: "Felicidade Plena", titlePrefixes: ["Celebrando Seu Brilho:", "O Tempo Voa:"] },
  mes: { chapter: "O Primeiro Ano de Vida", feeling: "Gratidão", titlePrefixes: ["Mais Um Mês de Magia:", "O Crescimento Diário:"] },
};

/**
 * Transforma uma lembrança crua em uma página de livro literária com IA editorial.
 */
export async function draftLiteraryPage(
  rawText: string,
  date: string,
  place?: string
): Promise<EditorialPageDraft> {
  // Simulador de processamento literário de alta precisão (funciona instantaneamente offline ou online)
  await new Promise((r) => setTimeout(r, 1200)); // Tempo de contemplação editorial da IA

  const cleanText = rawText.trim();
  const lower = cleanText.toLowerCase();

  // Encontrar tema predominante ou usar tema editorial padrão
  let matchedTheme = {
    chapter: "Nossa Doce Rotina",
    feeling: "Amor e Gratidão",
    titlePrefixes: ["Lembrança Inesquecível:", "Um Dia Para Guardar:", "Memória do Coração:"],
  };

  for (const [key, val] of Object.entries(CHAPTER_THEMES)) {
    if (lower.includes(key)) {
      matchedTheme = val;
      break;
    }
  }

  // Extrair palavras significativas para título poético e tags
  const words = cleanText
    .replace(/[.,/#!$%^&*;:{}=-_`~()]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !["para", "com", "uma", "esse", "esta", "foi", "estava", "quando", "muito", "hoje", "ontem"].includes(w.toLowerCase()));

  const mainSubject = words.length > 0
    ? words[0].charAt(0).toUpperCase() + words[0].slice(1) + (words.length > 1 ? ` e ${words[1]}` : "")
    : "A Doçura Deste Momento";

  const randomPrefix = matchedTheme.titlePrefixes[Math.floor(Math.random() * matchedTheme.titlePrefixes.length)];
  const generatedTitle = `${randomPrefix} ${mainSubject}`;

  // Geração de Prosa Literária de Legado
  let literaryProsa = "";
  if (cleanText.length < 40) {
    literaryProsa = `Foi em um dia iluminado que guardamos para sempre esta lembrança: "${cleanText}". Entre sorrisos e olhares atentos, percebemos como o tempo corre depressa, transformando pequenos gestos nos capítulos mais valiosos da nossa história. Cada segundo ao seu lado é uma dádiva que se eterniza nas páginas do nosso coração.`;
  } else {
    literaryProsa = `${cleanText}\n\nAo revisitar este dia, sentimos um calor imenso no peito. A pureza de cada detalhe nos lembra de como somos abençoados por testemunhar a sua evolução. Que esta página do seu livro viva para sempre como um lembrete do amor incondicional que construímos ao seu redor.`;
  }

  if (place && place.trim()) {
    literaryProsa += ` O cenário desse momento especial foi em ${place.trim()}, um lugar que ficará marcado em nossas memórias.`;
  }

  const generatedTags = Array.from(new Set([
    matchedTheme.feeling.toLowerCase(),
    ...(place ? [place.trim().toLowerCase()] : []),
    ...words.slice(0, 4).map((w) => w.toLowerCase()),
  ]));

  return {
    title: generatedTitle,
    story_text: literaryProsa,
    chapter_title: matchedTheme.chapter,
    feeling: matchedTheme.feeling,
    tags: generatedTags,
    happened_on: date || new Date().toISOString().slice(0, 10),
    place: place?.trim() || undefined,
  };
}

/**
 * Co-escrita conversacional: O usuário pede para a Editora IA refinar a narrativa.
 */
export async function refineWithEditor(
  currentDraft: EditorialPageDraft,
  instruction: string
): Promise<EditorialPageDraft> {
  await new Promise((r) => setTimeout(r, 900));

  const lowerInst = instruction.toLowerCase();
  let newText = currentDraft.story_text;
  let newTitle = currentDraft.title;
  let newFeeling = currentDraft.feeling;

  if (lowerInst.includes("curto") || lowerInst.includes("resumo") || lowerInst.includes("conciso")) {
    const firstSentence = newText.split(".")[0];
    newText = `${firstSentence}. Um instante poético e singular que resume todo o nosso amor em poucas palavras.`;
  } else if (lowerInst.includes("poético") || lowerInst.includes("emocionante") || lowerInst.includes("poesia")) {
    newTitle = `✨ ${currentDraft.title.replace(/[:✨]/g, "")}`;
    newText = `Entre a leveza do tempo e a profundidade do nosso carinho, testemunhamos a beleza pura deste instante: ${currentDraft.story_text.split("\n")[0]} Como páginas douradas de um livro sagrado, este dia permanecerá intocável pelo tempo, guardado na alma da nossa família.`;
    newFeeling = "Poesia e Ternura";
  } else if (lowerInst.includes("divertido") || lowerInst.includes("engraçado") || lowerInst.includes("alegre")) {
    newTitle = `😄 ${currentDraft.title.replace(/[:😄]/g, "")}`;
    newText = `Se tem algo que nos faz sorrir de orelha a orelha é lembrar exatamente de como isso aconteceu: ${currentDraft.story_text.split("\n")[0]} A sua alegria contagiosa iluminou o dia de todo mundo! É impossível ler esta página sem soltar uma boa risada de felicidade.`;
    newFeeling = "Pura Alegria";
  } else {
    // Refinamento genérico com base na instrução do usuário
    newText = `${currentDraft.story_text}\n\n[Nota do Editor: Incorporando carinhosamente: "${instruction}"]`;
  }

  return {
    ...currentDraft,
    title: newTitle,
    story_text: newText,
    feeling: newFeeling,
  };
}
