# painel-central
Painel central de gerenciamento de clientes Creator Mobile

## Configuração do comando por voz (Fase 2)

O comando por voz depende de um Cloudflare Worker que interpreta o texto via API da Anthropic (Claude).

1. Crie um Worker no Cloudflare e cole o conteúdo de `worker/index.js`.
2. Configure a variável de ambiente `ANTHROPIC_API_KEY` no Worker com sua chave da API da Anthropic.
3. Copie a URL gerada pelo Worker (ex.: `https://painel-central-voz.SEU-SUBDOMINIO.workers.dev`).
4. Atualize a constante `WORKER_URL` em `js/firebase-config.js` com essa URL.
