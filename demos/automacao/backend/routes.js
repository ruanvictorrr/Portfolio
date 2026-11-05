// API da demo "Moura Modas" (fluxos automatizados).
//
//   GET   /api/automacao/painel            números do mês, fluxos, últimas execuções
//   PATCH /api/automacao/fluxos/:id        liga ou desliga um fluxo  { ativo: true|false }
//   POST  /api/automacao/fluxos/:id/executar  roda o fluxo agora  { cliente?, sku?, qtd? }
//   GET   /api/automacao/planilha          linhas da planilha de pedidos
//   GET   /api/automacao/estoque           produtos e estoque
//   GET   /api/automacao/mensagens         mensagens que os fluxos enviaram
//   POST  /api/automacao/reiniciar         volta tudo ao estado inicial

import { HttpError, latency } from "../../../server/lib/http-core.js";
import { executarFluxo } from "./services/motor.js";

let db;

function painel(d) {
  const minutos = d.fluxos.reduce((s, f) => s + f.minutosPorExecucao * f.execucoesMes, 0);
  return {
    empresa: d.empresa,
    numeros: {
      execucoesMes: d.fluxos.reduce((s, f) => s + f.execucoesMes, 0),
      horasEconomizadas: Math.round(minutos / 6) / 10,
      fluxosAtivos: d.fluxos.filter((f) => f.ativo).length,
      mensagensEnviadas: d.mensagens.length,
    },
    fluxos: d.fluxos,
    execucoes: d.execucoes.slice(0, 8),
    clientes: d.clientes.map(({ nome, loja }) => ({ nome, loja })),
    produtos: d.produtos.map(({ sku, nome, estoque }) => ({ sku, nome, estoque })),
  };
}

export default async function register(router, { lerDados, criarStore }) {
  db = criarStore("loja");

  router.get("/painel", async () => painel(await db.read()));

  router.patch("/fluxos/:id", async ({ body, headers, params }) => {
    const { ativo } = body;
    if (typeof ativo !== "boolean") throw new HttpError(422, "Envie { ativo: true | false }.");
    return db.update((d) => {
      const f = d.fluxos.find((x) => x.id === params.id);
      if (!f) throw new HttpError(404, "Fluxo não encontrado.");
      f.ativo = ativo;
      return { id: f.id, ativo: f.ativo };
    });
  });

  router.post("/fluxos/:id/executar", async ({ body, headers, params }) => {
    const entrada = body;
    await latency(200);
    const execucao = await db.update((d) => {
      const f = d.fluxos.find((x) => x.id === params.id);
      if (!f) throw new HttpError(404, "Fluxo não encontrado.");
      if (!f.ativo) throw new HttpError(409, "Esse fluxo está desligado. Ligue para executar.");
      return executarFluxo(d, f, entrada);
    });
    return { execucao };
  });

  router.get("/planilha", async () => {
    const d = await db.read();
    return { linhas: [...d.planilha].reverse().slice(0, 12), total: d.planilha.length };
  });

  router.get("/estoque", async () => ({ produtos: (await db.read()).produtos }));

  router.get("/mensagens", async () => ({ mensagens: (await db.read()).mensagens.slice(0, 12) }));

  router.post("/reiniciar", async () => painel(await db.reset()));
}
