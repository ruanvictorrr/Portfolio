// Ponte entre o frontend das demos e a API.
//
// Os frontends chamam apiFetch("/api/<demo>/rota", opcoes), com a mesma assinatura do fetch.
// - Se existe servidor (npm start), a chamada vai para ele.
// - Se não existe (GitHub Pages, que só hospeda arquivos), as mesmas rotas de
//   demos/<demo>/backend/routes.js rodam aqui no navegador, com os dados no localStorage.
//
// Para testar o modo navegador com o servidor ligado, abra a demo com ?modo=local na URL.

import { plataformaNavegador } from "./plataforma-navegador.js";

// Raiz do site: este arquivo fica em <raiz>/demos/shared/js/api.js
const RAIZ = new URL("../../../", import.meta.url);
// Onde ficam as rotas e os dados para rodar no navegador (o build do Pages copia para cá)
const PASTA_API = new URL("_api/", RAIZ);

let modo = null;
function detectarModo() {
  if (modo) return modo;
  const forcado = new URLSearchParams(location.search).get("modo");
  // GitHub Pages nunca tem servidor: nem tenta (evita um 404 no console)
  if (forcado === "local" || location.hostname.endsWith("github.io")) return (modo = Promise.resolve("local"));
  modo = fetch(new URL("api/health", RAIZ), { cache: "no-store" })
    .then(async (res) => {
      if (!res.ok || !(res.headers.get("content-type") || "").includes("json")) return "local";
      const data = await res.json().catch(() => ({}));
      return data.ok ? "servidor" : "local";
    })
    .catch(() => "local");
  return modo;
}

const motores = {};
let nucleo = null;

function carregarNucleo() {
  nucleo ??= Promise.all([
    import(new URL("server/lib/router.js", PASTA_API).href),
    import(new URL("server/lib/http-core.js", PASTA_API).href),
  ]).then(([router, http]) => ({ createRouter: router.createRouter, HttpError: http.HttpError, isWithStatus: http.isWithStatus }));
  return nucleo;
}

function motor(demo) {
  motores[demo] ??= (async () => {
    const { createRouter } = await carregarNucleo();
    const pasta = new URL(`demos/${demo}/backend/`, PASTA_API);
    const { default: register } = await import(new URL("routes.js", pasta).href);
    const router = createRouter();
    await register(router, plataformaNavegador(demo, new URL("data/", pasta)));
    return router;
  })();
  return motores[demo];
}

function resposta(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json; charset=utf-8" } });
}

function cabecalhos(headers) {
  const saida = {};
  new Headers(headers || {}).forEach((valor, nome) => { saida[nome.toLowerCase()] = valor; });
  return saida;
}

async function chamarLocal(caminho, init) {
  const { HttpError, isWithStatus } = await carregarNucleo();
  const url = new URL(caminho, "http://local");
  const [, , demo, ...resto] = url.pathname.split("/"); // ["", "api", demo, ...]
  try {
    const router = await motor(demo);
    const metodo = (init.method || "GET").toUpperCase();
    const achou = router.match(metodo, "/" + resto.join("/"));
    if (!achou) throw new HttpError(404, "Rota não encontrada.");
    if (achou.methodNotAllowed) throw new HttpError(405, "Método não permitido.");
    let body = {};
    if (init.body) {
      try { body = JSON.parse(init.body); } catch { throw new HttpError(400, "JSON inválido."); }
    }
    const result = await achou.handler({ params: achou.params, query: url.searchParams, body, headers: cabecalhos(init.headers) });
    return isWithStatus(result) ? resposta(result.status, result.body) : resposta(200, result ?? {});
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    if (status === 500) console.error(err);
    return resposta(status, { erro: status === 500 ? "Algo deu errado nesta demonstração." : err.message, detalhes: err.details });
  }
}

export async function apiFetch(caminho, init = {}) {
  if ((await detectarModo()) === "servidor") {
    return fetch(new URL(caminho.replace(/^\//, ""), RAIZ), init);
  }
  return chamarLocal(caminho, init);
}
