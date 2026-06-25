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
      Feed: 4
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
      Feed: 4
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
      Feed: 4
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
      Feed: 4
    },
    desde: "2026-06-01",
    // Perfil sem cobrança por produção: a aba Saldo mostra só quantidade entregue, sem valor em R$.
    semValorFinanceiro: true,
    plano:
      "Plano Crescimento, conteúdo estratégico pra atrair e vender.\n\n" +
      "4 Reels/mês (podendo substituir por carrossel), com texto estratégico, publicados no feed + stories.\n\n" +
      "Stories diários (seg a sáb), captação presencial de fotos dos produtos, criação de banco de imagens próprias.",
    // Métricas contabilizáveis com marcação manual, exibidas na aba Saldo no lugar do padrão por tipo.
    // Reels e Carrossel contam para uma meta combinada de 4/mês; Captação é só contagem, sem meta;
    // Stories não tem métrica (aparece só na descrição do plano e é sempre considerado cumprido).
    metricas: [
      { rotulo: "Reels ou Carrossel", tipos: ["Reels", "Carrossel"], meta: 4 },
      { rotulo: "Captações presenciais", tipos: ["Captação"], meta: null }
    ]
  }
};

// Tipos de conteúdo e status possíveis para um post
const TIPOS_CONTEUDO = ["Reels", "Carrossel", "Stories", "Feed", "Captação"];
const STATUS_CONTEUDO = ["Publicado", "Programado", "Planejamento", "Ideia"];

// Tipos de conteúdo sem quantidade contratada no pacote mensal (contagem aberta, sem meta)
const TIPOS_SEM_LIMITE = ["Stories", "Captação"];

// Valor em R$ de cada conteúdo produzido, usado no cálculo de Saldo
const PRECO_CONTEUDO = {
  Reels: 85,
  Carrossel: 50,
  Feed: 30,
  Stories: 15
};

// Cor de destaque por tipo de conteúdo (badges/tags)
const COR_TIPO = {
  Reels: "#fee2e2",
  Carrossel: "#dbeafe",
  Feed: "#dcfce7",
  Stories: "#ede9fe",
  Captação: "#fae8ff"
};
