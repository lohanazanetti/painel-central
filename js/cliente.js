exigirLogin();

const params = new URLSearchParams(window.location.search);
const clienteId = params.get("cliente");
const cliente = CLIENTES[clienteId];

if (!cliente) {
  alert("Cliente não encontrado.");
  window.location.href = "dashboard.html";
}

// Aplica cor temática e dados do cabeçalho
document.documentElement.style.setProperty("--cor-cliente", cliente.corPrimaria);
document.getElementById("nome-cliente").textContent = cliente.nome;
document.getElementById("info-cliente").textContent = `${cliente.segmento} · ${cliente.responsavel}`;

const colecaoPosts = db.collection("clientes").doc(clienteId).collection("posts");

// Estado do mês exibido no calendário
const hoje = new Date();
let anoExibido = hoje.getFullYear();
let mesExibido = hoje.getMonth(); // 0-11

const NOMES_MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

function mesAtualISO() {
  const mes = String(mesExibido + 1).padStart(2, "0");
  return `${anoExibido}-${mes}`;
}

function formatarDataExibicao(dataISO) {
  if (!dataISO) return "Sem data definida";
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

function classeBadge(status) {
  switch (status) {
    case "Publicado": return "badge-publicado";
    case "Programado": return "badge-programado";
    case "Planejamento": return "badge-planejamento";
    default: return "badge-ideia";
  }
}

// --- Abas ---
document.querySelectorAll(".aba-botao").forEach((botao) => {
  botao.addEventListener("click", () => {
    document.querySelectorAll(".aba-botao").forEach((b) => b.classList.remove("ativa"));
    document.querySelectorAll(".aba-conteudo").forEach((c) => c.classList.remove("ativa"));
    botao.classList.add("ativa");
    document.getElementById(`aba-${botao.dataset.aba}`).classList.add("ativa");
  });
});

// --- Calendário ---
const tituloMes = document.getElementById("titulo-mes");
const listaPosts = document.getElementById("lista-posts");

document.getElementById("mes-anterior").addEventListener("click", () => {
  mesExibido -= 1;
  if (mesExibido < 0) {
    mesExibido = 11;
    anoExibido -= 1;
  }
  carregarPosts();
});

document.getElementById("mes-proximo").addEventListener("click", () => {
  mesExibido += 1;
  if (mesExibido > 11) {
    mesExibido = 0;
    anoExibido += 1;
  }
  carregarPosts();
});

async function carregarPosts() {
  tituloMes.textContent = `${NOMES_MESES[mesExibido]} de ${anoExibido}`;
  listaPosts.innerHTML = "<p>Carregando...</p>";

  const prefixoMes = mesAtualISO();
  const snapshot = await colecaoPosts.orderBy("data").get();

  const posts = [];
  snapshot.forEach((doc) => {
    const post = { id: doc.id, ...doc.data() };
    if (!post.data && mesExibido === hoje.getMonth() && anoExibido === hoje.getFullYear()) {
      // Ideias sem data aparecem no mês atual
      posts.push(post);
    } else if (post.data && post.data.startsWith(prefixoMes)) {
      posts.push(post);
    }
  });

  if (posts.length === 0) {
    listaPosts.innerHTML = "<p>Nenhum conteúdo neste mês.</p>";
  } else {
    listaPosts.innerHTML = "";
    posts.forEach((post) => listaPosts.appendChild(criarItemPost(post)));
  }

  atualizarSaldo(snapshot, prefixoMes);
}

function criarItemPost(post) {
  const item = document.createElement("div");
  item.className = "post-item";
  item.innerHTML = `
    <div class="info">
      <h3>${post.titulo}</h3>
      <p>${post.tipo} · ${formatarDataExibicao(post.data)}</p>
    </div>
    <span class="badge ${classeBadge(post.status)}">${post.status}</span>
    <button class="btn-excluir-post" title="Excluir">🗑️</button>
  `;
  item.addEventListener("click", () => abrirModalPost(post));
  item.querySelector(".btn-excluir-post").addEventListener("click", async (evento) => {
    evento.stopPropagation();
    if (confirm(`Excluir "${post.titulo}"?`)) {
      await colecaoPosts.doc(post.id).delete();
      carregarPosts();
    }
  });
  return item;
}

// --- Saldo financeiro ---
const saldoResumo = document.getElementById("saldo-resumo");

function atualizarSaldo(snapshot, prefixoMes) {
  const entregue = {};
  TIPOS_CONTEUDO.forEach((tipo) => (entregue[tipo] = 0));

  snapshot.forEach((doc) => {
    const post = doc.data();
    if (post.status === "Publicado" && post.data && post.data.startsWith(prefixoMes)) {
      entregue[post.tipo] = (entregue[post.tipo] || 0) + 1;
    }
  });

  saldoResumo.innerHTML = "";
  TIPOS_CONTEUDO.forEach((tipo) => {
    const contratado = cliente.pacoteMensal[tipo] || 0;
    const feito = entregue[tipo] || 0;
    const percentual = contratado > 0 ? Math.min(100, Math.round((feito / contratado) * 100)) : 0;

    const card = document.createElement("div");
    card.className = "saldo-card";
    card.innerHTML = `
      <div class="valor">${feito}/${contratado}</div>
      <div class="rotulo">${tipo}</div>
      <div class="barra-progresso"><div class="preenchido" style="width: ${percentual}%"></div></div>
    `;
    saldoResumo.appendChild(card);
  });
}

// --- Modal de novo/editar post ---
const modalPost = document.getElementById("modal-post");
const formPost = document.getElementById("form-post");
const selectTipo = document.getElementById("post-tipo");
const selectStatus = document.getElementById("post-status");

TIPOS_CONTEUDO.forEach((tipo) => {
  const opcao = document.createElement("option");
  opcao.value = tipo;
  opcao.textContent = tipo;
  selectTipo.appendChild(opcao);
});

STATUS_CONTEUDO.forEach((status) => {
  const opcao = document.createElement("option");
  opcao.value = status;
  opcao.textContent = status;
  selectStatus.appendChild(opcao);
});

function abrirModalNovoPost() {
  document.getElementById("modal-titulo").textContent = "Novo conteúdo";
  document.getElementById("post-id").value = "";
  document.getElementById("post-data").value = "";
  document.getElementById("post-titulo").value = "";
  selectTipo.value = "Feed";
  selectStatus.value = "Planejamento";
  modalPost.classList.remove("escondido");
}

function abrirModalPost(post) {
  document.getElementById("modal-titulo").textContent = "Editar conteúdo";
  document.getElementById("post-id").value = post.id;
  document.getElementById("post-data").value = post.data || "";
  document.getElementById("post-titulo").value = post.titulo;
  selectTipo.value = post.tipo;
  selectStatus.value = post.status;
  modalPost.classList.remove("escondido");
}

document.getElementById("btn-novo-post").addEventListener("click", abrirModalNovoPost);
document.getElementById("btn-cancelar-post").addEventListener("click", () => {
  modalPost.classList.add("escondido");
});

formPost.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const id = document.getElementById("post-id").value;
  const dados = {
    data: document.getElementById("post-data").value.trim() || null,
    tipo: selectTipo.value,
    titulo: document.getElementById("post-titulo").value.trim(),
    status: selectStatus.value
  };

  if (id) {
    await colecaoPosts.doc(id).update(dados);
  } else {
    await colecaoPosts.add(dados);
  }

  modalPost.classList.add("escondido");
  carregarPosts();
});

// --- Comando por voz ---
const btnVoz = document.getElementById("btn-voz");
const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognitionAPI) {
  btnVoz.title = "Seu navegador não suporta comando por voz";
} else {
  const reconhecimento = new SpeechRecognitionAPI();
  reconhecimento.lang = "pt-BR";
  reconhecimento.continuous = true;
  reconhecimento.interimResults = false;
  reconhecimento.maxAlternatives = 1;

  let escutando = false;
  let trechosFala = [];

  reconhecimento.addEventListener("start", () => {
    escutando = true;
    trechosFala = [];
    btnVoz.classList.add("gravando");
    btnVoz.title = "Gravando... toque novamente para finalizar";
  });

  reconhecimento.addEventListener("end", async () => {
    escutando = false;
    btnVoz.classList.remove("gravando");
    btnVoz.title = "Adicionar por voz";

    const texto = trechosFala.join(" ").trim();
    if (texto) {
      await processarComandoVoz(texto);
    }
  });

  reconhecimento.addEventListener("error", (evento) => {
    console.error("Erro no reconhecimento de voz:", evento.error);
    if (evento.error !== "no-speech" && evento.error !== "aborted") {
      alert("Não foi possível reconhecer o áudio. Tente novamente.");
    }
  });

  reconhecimento.addEventListener("result", (evento) => {
    for (let i = evento.resultIndex; i < evento.results.length; i++) {
      if (evento.results[i].isFinal) {
        trechosFala.push(evento.results[i][0].transcript);
      }
    }
  });

  btnVoz.addEventListener("click", () => {
    if (escutando) {
      reconhecimento.stop();
      return;
    }
    reconhecimento.start();
  });
}

async function processarComandoVoz(texto) {
  btnVoz.disabled = true;
  btnVoz.title = "Processando...";

  try {
    const resposta = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto })
    });

    const resultado = await resposta.json();

    if (!resposta.ok || resultado.error) {
      console.error("Erro do Worker:", resultado);
      alert(`Não foi possível interpretar o comando: ${resultado.error || "erro desconhecido"}`);
      return;
    }

    await colecaoPosts.add({
      data: resultado.data || null,
      tipo: resultado.tipo,
      titulo: resultado.titulo,
      status: resultado.status
    });

    carregarPosts();
    alert(`Conteúdo criado: "${resultado.titulo}" (${resultado.tipo}, ${resultado.status})`);
  } catch (erro) {
    console.error("Erro ao processar comando de voz:", erro);
    alert("Erro ao conectar com o serviço de interpretação de voz.");
  } finally {
    btnVoz.disabled = false;
    btnVoz.title = "Adicionar por voz";
  }
}

// --- Relatório (placeholder, implementado na Fase 3) ---
document.getElementById("btn-relatorio").addEventListener("click", () => {
  alert("Relatório de fechamento mensal será implementado na Fase 3.");
});

if (params.get("relatorio") === "1") {
  document.querySelector('[data-aba="saldo"]').click();
}

carregarPosts();
