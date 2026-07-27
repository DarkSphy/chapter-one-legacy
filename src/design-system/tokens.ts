/**
 * O Livro Vivo — Design System Tokens
 * Inspirado em Apple, Linear, Notion, Airbnb e Arc Browser.
 * 
 * Filosofia: Muito espaço em branco, tipografia impecável, poucas cores e
 * detalhes em Ouro Editorial (Champagne Gold) aplicados como gravação a quente em livro de luxo.
 */

export const EDITORIAL_TOKENS = {
  colors: {
    paper: {
      light: "#FAF9F6", // Seda editorial off-white
      pure: "#FFFFFF",
      subtle: "#F3F2EE",
      border: "#E8E6DF",
    },
    obsidian: {
      pure: "#0F0F11", // Tinta obsidiana
      text: "#18181B",
      muted: "#71717A",
      subtle: "#A1A1AA",
    },
    gold: {
      primary: "#C5A059", // Ouro Champagne clássico
      bright: "#D4AF37",
      soft: "#F8F5EC",
      border: "#E2D3B3",
      glow: "rgba(197, 160, 89, 0.15)",
    },
  },
  typography: {
    serif: "'Playfair Display', 'Lora', 'Newsreader', Georgia, serif",
    sans: "'Inter', 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  shadows: {
    book: "0 20px 40px -15px rgba(15, 15, 17, 0.08), 0 0 1px 1px rgba(15, 15, 17, 0.03)",
    bookHover: "0 25px 50px -12px rgba(15, 15, 17, 0.12), 0 0 1px 1px rgba(197, 160, 89, 0.2)",
    floatBar: "0 12px 32px -8px rgba(15, 15, 17, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.6)",
    sheet: "0 30px 60px -15px rgba(15, 15, 17, 0.15)",
  },
  transitions: {
    smooth: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
    spring: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
} as const;
