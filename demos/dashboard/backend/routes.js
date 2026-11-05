// API da demo "Mercadinho São Bento" (dashboard de vendas e estoque).
//
//   GET  /api/dashboard/resumo?periodo=7|30|90&categoria=   números, gráficos e mais vendidos
//   GET  /api/dashboard/estoque?busca=&status=               situação do estoque
//   POST /api/dashboard/estoque/:id/repor                    registra entrada  { quantidade }
//   POST /api/dashboard/reiniciar                            volta o estoque ao inicial

import { fileURLToPath } from "node:url";
import { HttpError, readJson, latency } from "../../../server/lib/http.js";
import { createStore } from "../../../server/lib/json-store.js";
import { gerarHistorico, resumo, situacaoEstoque } from "./services/vendas.js";

const dataDir = new URL("./data/", import.meta.url);
const db = createStore(
  fileURLToPath(new URL("mercadinho.seed.json", dataDir)),
  fileURLToPath(new URL("mercadinho.db.json", dataDir))
);

// Histórico recalculado uma vez por dia (sempre termina ontem)
let cache = { dia: null, historico: null };
async function historico() {
  const hoje = new Date().toDateString();
  if (cache.dia !== hoje) {
    const { produtos } = await db.read();
    cache = { dia: hoje, historico: gerarHistorico(produtos) };
  }
  return cache.historico;
}

const normalizar = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default function register(router) {
  router.get("/resumo", async ({ query }) => {
    await latency(180);
    const periodo = Number(query.get("periodo")) || 30;
    if (![7, 30, 90].includes(periodo)) throw new HttpError(400, "Período deve ser 7, 30 ou 90 dias.");
    const { loja, bairro, categorias, produtos } = await db.read();
    const categoria = query.get("categoria") || "";
    if (categoria && !categorias.includes(categoria)) throw new HttpError(400, "Categoria inválida.");
    return { loja, bairro, categorias, ...resumo({ historico: await historico(), produtos, periodo, categoria }) };
  });

  router.get("/estoque", async ({ query }) => {
    const { produtos } = await db.read();
    let itens = situacaoEstoque({ historico: await historico(), produtos });
    const busca = normalizar(query.get("busca") || "");
    const status = query.get("status");
    const contagem = { critico: 0, baixo: 0, ok: 0 };
    itens.forEach((i) => contagem[i.status]++);
    if (busca) itens = itens.filter((i) => normalizar(`${i.nome} ${i.categoria}`).includes(busca));
    if (status && status !== "todos") itens = itens.filter((i) => i.status === status);
    const peso = { critico: 0, baixo: 1, ok: 2 };
    itens.sort((a, b) => peso[a.status] - peso[b.status] || (a.coberturaDias ?? 999) - (b.coberturaDias ?? 999));
    return { itens, contagem };
  });

  router.post("/estoque/:id/repor", async ({ req, params }) => {
    const { quantidade } = await readJson(req);
    const q = Number(quantidade);
    if (!Number.isInteger(q) || q < 1 || q > 10000) throw new HttpError(422, "Informe uma quantidade entre 1 e 10.000.");
    await latency(250);
    const produto = await db.update((d) => {
      const p = d.produtos.find((x) => String(x.id) === params.id);
      if (!p) throw new HttpError(404, "Produto não encontrado.");
      p.estoque += q;
      return p;
    });
    const [item] = situacaoEstoque({ historico: await historico(), produtos: [produto] });
    return { item };
  });

  router.post("/reiniciar", async () => {
    await db.reset();
    return { ok: true };
  });
}
