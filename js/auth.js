// Autenticação do painel admin
const formLogin = document.getElementById("form-login");
const mensagemErro = document.getElementById("mensagem-erro");

// Se já estiver logado, vai direto para o dashboard
auth.onAuthStateChanged((usuario) => {
  if (usuario && window.location.pathname.endsWith("index.html") || (usuario && window.location.pathname === "/")) {
    window.location.href = "dashboard.html";
  }
});

formLogin.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  mensagemErro.textContent = "";

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;

  try {
    await auth.signInWithEmailAndPassword(email, senha);
    window.location.href = "dashboard.html";
  } catch (erro) {
    mensagemErro.textContent = "E-mail ou senha incorretos.";
  }
});

// Função utilitária para proteger páginas internas (usada em dashboard.html e cliente.html)
function exigirLogin() {
  auth.onAuthStateChanged((usuario) => {
    if (!usuario) {
      window.location.href = "index.html";
    }
  });
}

function sair() {
  auth.signOut().then(() => {
    window.location.href = "index.html";
  });
}
