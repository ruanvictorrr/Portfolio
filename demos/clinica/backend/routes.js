// API da demo "Clínica Sorriso Agreste" (site profissional com várias páginas).
//
//   GET  /api/clinica/info                 dados de contato, horários, tratamentos e períodos
//   GET  /api/clinica/convenios?busca=     planos e convênios aceitos
//   POST /api/clinica/agendamentos         pedido de avaliação vindo da página de contato

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { HttpError, readJson, latency, withStatus } from "../../../server/lib/http.js";
import { createStore } from "../../../server/lib/json-store.js";

const dataDir = new URL("./data/", import.meta.url);
const clinica = JSON.parse(await readFile(new URL("clinica.json", dataDir), "utf8"));
const db = createStore(
  fileURLToPath(new URL("agendamentos.seed.json", dataDir)),
  fileURLToPath(new URL("agendamentos.db.json", dataDir))
);

const normalizar = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function validar(body) {
  const erros = {};
  const nome = String(body.nome || "").trim();
  const telefone = String(body.telefone || "").replace(/\D/g, "");
  const tratamento = String(body.tratamento || "");
  const periodo = String(body.periodo || "");
  const mensagem = String(body.mensagem || "").trim().slice(0, 600);
  const consentimento = body.consentimento === true;

  if (nome.length < 3) erros.nome = "Informe seu nome completo.";
  if (telefone.length < 10 || telefone.length > 11) erros.telefone = "Informe um WhatsApp com DDD.";
  if (!clinica.tratamentos.some((t) => t.id === tratamento)) erros.tratamento = "Escolha o que você precisa.";
  if (!clinica.periodos.includes(periodo)) erros.periodo = "Escolha o melhor período.";
  if (!consentimento) erros.consentimento = "Precisamos da sua autorização para entrar em contato.";
  return { erros, valores: { nome, telefone, tratamento, periodo, mensagem } };
}

export default function register(router) {
  router.get("/info", () => {
    const { convenios, ...info } = clinica;
    return info;
  });

  router.get("/convenios", async ({ query }) => {
    await latency(120);
    const busca = normalizar(query.get("busca") || "");
    const itens = busca ? clinica.convenios.filter((c) => normalizar(`${c.nome} ${c.tipo}`).includes(busca)) : clinica.convenios;
    return { itens, total: clinica.convenios.length };
  });

  router.post("/agendamentos", async ({ req }) => {
    await latency(350);
    const { erros, valores } = validar(await readJson(req));
    if (Object.keys(erros).length) throw new HttpError(422, "Confira os campos destacados.", erros);
    const pedido = await db.update((d) => {
      const novo = { protocolo: d.proximoProtocolo++, ...valores, status: "novo", criadoEm: new Date().toISOString() };
      d.agendamentos.push(novo);
      return novo;
    });
    const tratamento = clinica.tratamentos.find((t) => t.id === pedido.tratamento).nome;
    return withStatus(201, {
      protocolo: pedido.protocolo,
      mensagem: `Recebemos seu pedido de ${tratamento.toLowerCase()}. Nossa recepção chama você no WhatsApp ainda hoje para combinar o horário (preferência: ${pedido.periodo.toLowerCase()}).`,
    });
  });
}
