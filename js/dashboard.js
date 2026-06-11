exigirLogin();

const containerCards = document.getElementById("cards-clientes");

function totalPacoteMensal(pacote) {
  return Object.values(pacote).reduce((soma, qtd) => soma + qtd, 0);
}

function mesAtualISO() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  return `${ano}-${mes}`;
}

async function buscarResumoCliente(clienteId) {
  const prefixoMes = mesAtualISO();
  const snapshot = await db
    .collection("clientes")
    .doc(clienteId)
    .collection("posts")
    .where("status", "==", "Publicado")
    .get();

  let publicadosNoMes = 0;
  snapshot.forEach((doc) => {
    const post = doc.data();
    if (post.data && post.data.startsWith(prefixoMes)) {
      publicadosNoMes += 1;
    }
  });

  return { publicadosNoMes };
}

function criarCard(cliente, resumo) {
  const total = totalPacoteMensal(cliente.pacoteMensal);
  const link = document.createElement("a");
  link.className = "card-cliente";
  link.style.setProperty("--cor-cliente", cliente.corPrimaria);
  link.href = `cliente.html?cliente=${cliente.id}`;

  link.innerHTML = `
    <p class="nome">${cliente.nome}</p>
    <p class="segmento">${cliente.segmento} · ${cliente.responsavel}</p>
    <div class="resumo">
      <div>
        <strong>${resumo.publicadosNoMes}/${total}</strong>
        posts no mês
      </div>
    </div>
    <div class="acoes">
      <button type="button" data-acao="link">Link público</button>
      <button type="button" data-acao="relatorio">Relatório do mês</button>
    </div>
  `;

  link.querySelectorAll("button").forEach((botao) => {
    botao.addEventListener("click", (evento) => {
      evento.preventDefault();
      evento.stopPropagation();
      const acao = botao.dataset.acao;
      if (acao === "link") {
        const url = `${window.location.origin}${window.location.pathname.replace("dashboard.html", "")}publico.html?cliente=${cliente.id}`;
        navigator.clipboard.writeText(url).then(() => {
          alert(`Link público copiado:\n${url}`);
        }).catch(() => {
          prompt("Copie o link público:", url);
        });
      } else if (acao === "relatorio") {
        window.location.href = `cliente.html?cliente=${cliente.id}&relatorio=1`;
      }
    });
  });

  return link;
}

async function carregarDashboard() {
  for (const clienteId of Object.keys(CLIENTES)) {
    const cliente = CLIENTES[clienteId];
    const resumo = await buscarResumoCliente(clienteId);
    containerCards.appendChild(criarCard(cliente, resumo));
  }
}

carregarDashboard();
