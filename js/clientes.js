// Dados dos clientes atendidos pela Creator Mobile
// id: usado como chave de coleção no Firestore e em rotas (?cliente=id)
const CLIENTES = {
  foccus: {
    id: "foccus",
    nome: "FOCCUS",
    segmento: "Academia",
    responsavel: "Roque",
    corPrimaria: "#1f2937",
    corSecundaria: "#f59e0b",
    painelExterno: "https://lohanazanetti.github.io/foccus-painel/",
    pacoteMensal: {
      Reels: 4,
      Carrossel: 4,
      Stories: 8,
      Feed: 4,
      Encarte: 2
    },
    desde: "2024-01-01"
  },
  dolce: {
    id: "dolce",
    nome: "Dolce Donut",
    segmento: "Doceria",
    responsavel: "Marcos",
    corPrimaria: "#9d174d",
    corSecundaria: "#fbcfe8",
    painelExterno: "https://lohanazanetti.github.io/dolce-donut-painel/",
    pacoteMensal: {
      Reels: 4,
      Carrossel: 4,
      Stories: 8,
      Feed: 4,
      Encarte: 2
    },
    desde: "2024-01-01"
  },
  descontofacil: {
    id: "descontofacil",
    nome: "Farmácia Desconto Fácil",
    segmento: "Farmácia",
    responsavel: "Roselia",
    corPrimaria: "#065f46",
    corSecundaria: "#a7f3d0",
    painelExterno: null,
    pacoteMensal: {
      Reels: 4,
      Carrossel: 4,
      Stories: 8,
      Feed: 4,
      Encarte: 2
    },
    desde: "2025-01-01"
  },
  brasilpoupalar: {
    id: "brasilpoupalar",
    nome: "Farmácia Brasil Poupa Lar",
    segmento: "Farmácia",
    responsavel: "Glaucia",
    corPrimaria: "#1e40af",
    corSecundaria: "#bfdbfe",
    painelExterno: null,
    pacoteMensal: {
      Reels: 4,
      Carrossel: 4,
      Stories: 8,
      Feed: 4,
      Encarte: 2
    },
    desde: "2026-06-01"
  }
};

// Tipos de conteúdo e status possíveis para um post
const TIPOS_CONTEUDO = ["Reels", "Carrossel", "Stories", "Feed", "Encarte"];
const STATUS_CONTEUDO = ["Publicado", "Programado", "Planejamento", "Ideia"];
