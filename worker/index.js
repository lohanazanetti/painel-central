/**
 * Cloudflare Worker - Painel Central
 * Recebe um texto transcrito (comando de voz), envia para a API da Anthropic (Claude)
 * e devolve um JSON estruturado com os dados do conteúdo a ser criado.
 *
 * Variável de ambiente necessária: ANTHROPIC_API_KEY
 */

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_MODEL = "claude-sonnet-4-6";

const ALLOWED_TIPOS = ["Reels", "Carrossel", "Stories", "Feed", "Captação"];
const ALLOWED_STATUS = ["Publicado", "Programado", "Planejamento", "Ideia"];
const ALLOWED_ACOES = ["criar", "editar"];

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(),
    },
  });
}

function buildPrompt(texto, hojeISO) {
  return `Você é um assistente que interpreta comandos de voz em português do Brasil para um painel de gestão de conteúdo de redes sociais.

A data de hoje é ${hojeISO} (formato AAAA-MM-DD).

Primeiro, identifique a "acao" do comando:
- "criar": o usuário quer adicionar um novo conteúdo ao calendário.
- "editar": o usuário quer alterar/corrigir o último conteúdo registrado. Frases como "corrige o último", "muda o status do último para publicado", "edita o último post", "o título do último é..." indicam "editar".

A partir do texto do comando, extraia as seguintes informações:
- "acao": "criar" ou "editar", conforme definido acima.
- "data": data do conteúdo no formato AAAA-MM-DD.
  - Se "acao" for "criar": se o comando não mencionar o ano, use o ano atual a partir da data de hoje; se não houver data nenhuma mencionada, use a data de hoje.
  - Se "acao" for "editar": use null, a menos que o comando mencione explicitamente uma nova data para o conteúdo.
- "tipo": o tipo de conteúdo. Deve ser EXATAMENTE um destes valores: "Reels", "Carrossel", "Stories", "Feed" ou "Captação".
  - Se "acao" for "criar" e não conseguir identificar, use "Feed".
  - Se "acao" for "editar", use null, a menos que o comando mencione explicitamente um novo tipo.
- "titulo": um título curto e descritivo para o conteúdo, baseado no que foi dito.
  - Se "acao" for "editar", use null, a menos que o comando mencione explicitamente um novo título.
- "status": o status do conteúdo. Deve ser EXATAMENTE um destes valores: "Publicado", "Programado", "Planejamento" ou "Ideia".
  - Se "acao" for "criar" e não conseguir identificar, use "Planejamento".
  - Se "acao" for "editar", use null, a menos que o comando mencione explicitamente um novo status.

Responda APENAS com um objeto JSON puro, sem nenhum texto adicional, sem markdown, sem explicações. Exemplos de resposta:
{"acao":"criar","data":"2026-06-03","tipo":"Carrossel","titulo":"Personal do Inverno","status":"Publicado"}
{"acao":"editar","data":null,"tipo":null,"titulo":null,"status":"Publicado"}

Texto do comando: "${texto}"`;
}

function extractJson(text) {
  // Remove possíveis blocos de markdown (```json ... ```)
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("Resposta do Claude não contém JSON válido");
  }
  return JSON.parse(match[0]);
}

function validateResult(result) {
  const erros = [];

  if (!ALLOWED_ACOES.includes(result.acao)) {
    erros.push(`Campo 'acao' inválido: ${result.acao}`);
    return erros;
  }

  const ehEdicao = result.acao === "editar";

  if (result.data !== null && (!result.data || !/^\d{4}-\d{2}-\d{2}$/.test(result.data))) {
    erros.push("Campo 'data' inválido");
  }
  if (ehEdicao && result.data === undefined) {
    erros.push("Campo 'data' ausente");
  }

  if (result.tipo !== null && !ALLOWED_TIPOS.includes(result.tipo)) {
    erros.push(`Campo 'tipo' inválido: ${result.tipo}`);
  }

  if (result.titulo !== null && (typeof result.titulo !== "string" || !result.titulo.trim())) {
    erros.push("Campo 'titulo' inválido");
  }

  if (result.status !== null && !ALLOWED_STATUS.includes(result.status)) {
    erros.push(`Campo 'status' inválido: ${result.status}`);
  }

  if (!ehEdicao) {
    if (!result.data) erros.push("Campo 'data' ausente para criação");
    if (!result.tipo) erros.push("Campo 'tipo' ausente para criação");
    if (!result.titulo) erros.push("Campo 'titulo' ausente para criação");
    if (!result.status) erros.push("Campo 'status' ausente para criação");
  }

  return erros;
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }

    if (request.method !== "POST") {
      return jsonResponse({ error: "Método não permitido. Use POST." }, 405);
    }

    if (!env.ANTHROPIC_API_KEY) {
      return jsonResponse({ error: "ANTHROPIC_API_KEY não configurada no Worker" }, 500);
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return jsonResponse({ error: "Corpo da requisição inválido. Esperado JSON." }, 400);
    }

    const texto = (body.texto || "").trim();
    if (!texto) {
      return jsonResponse({ error: "Campo 'texto' é obrigatório" }, 400);
    }

    const hojeISO = new Date().toISOString().slice(0, 10);
    const prompt = buildPrompt(texto, hojeISO);

    let anthropicResponse;
    try {
      anthropicResponse = await fetch(ANTHROPIC_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: ANTHROPIC_MODEL,
          max_tokens: 300,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      });
    } catch (e) {
      return jsonResponse({ error: "Falha ao conectar com a API da Anthropic", detalhes: e.message }, 502);
    }

    if (!anthropicResponse.ok) {
      const errBody = await anthropicResponse.text();
      return jsonResponse(
        { error: "Erro na API da Anthropic", status: anthropicResponse.status, detalhes: errBody },
        502
      );
    }

    const anthropicData = await anthropicResponse.json();
    const textoResposta = anthropicData?.content?.[0]?.text || "";

    let resultado;
    try {
      resultado = extractJson(textoResposta);
    } catch (e) {
      return jsonResponse(
        { error: "Não foi possível interpretar a resposta do Claude", detalhes: textoResposta },
        502
      );
    }

    const erros = validateResult(resultado);
    if (erros.length > 0) {
      return jsonResponse({ error: "Resposta do Claude com campos inválidos", detalhes: erros, resultado }, 502);
    }

    return jsonResponse({
      acao: resultado.acao,
      data: resultado.data,
      tipo: resultado.tipo,
      titulo: resultado.titulo ? resultado.titulo.trim() : null,
      status: resultado.status,
    });
  },
};
