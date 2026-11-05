// API da demo "Casa Barro" (site de restaurante).
//
//   GET  /api/site/info                          dados do restaurante + aberto agora
//   GET  /api/site/cardapio?categoria=&busca=    itens do cardápio
//   GET  /api/site/disponibilidade?data=&pessoas= horários livres no dia
//   POST /api/site/reservas                      cria uma reserva
//   GET  /api/site/reservas/:codigo              consulta uma reserva
//
// Painel do dono (precisa do token devolvido em /painel/entrar):
//   POST  /api/site/painel/entrar                 { pin } -> { token }
//   GET   /api/site/painel/reservas?data=         reservas do dia + resumo
//   POST  /api/site/painel/reservas               reserva feita por telefone ou no balcão
//   PATCH /api/site/painel/reservas/:codigo       { status: confirmada | chegou | nao-veio | cancelada }

import { HttpError, latency, withStatus } from "../../../server/lib/http-core.js";
import { statusAgora, disponibilidade, agoraRecife } from "./services/agenda.js";
import { gerarExemplos } from "./services/exemplos.js";

let restaurante, reservasDb;

// PIN de demonstração do painel (num projeto real: login com senha de cada usuário)
const PIN_PAINEL = "2026";
const STATUS = ["confirmada", "chegou", "nao-veio", "cancelada"];
const tokens = new Set();

// Na primeira leitura, preenche o "banco" com reservas de exemplo para hoje e a semana
async function lerReservas() {
  const db = await reservasDb.read();
  if (db.exemplosGerados) return db;
  return reservasDb.update((d) => {
    if (d.exemplosGerados) return d;
    const { reservas, proximoCodigo } = gerarExemplos(restaurante.horarios, d.proximoCodigo);
    d.reservas.push(...reservas);
    d.proximoCodigo = proximoCodigo;
    d.exemplosGerados = true;
    return d;
  });
}

function exigirPainel(headers = {}) {
  const token = (headers.authorization || "").replace(/^Bearer /, "");
  if (!tokens.has(token)) throw new HttpError(401, "Sessão expirada. Entre de novo no painel.");
}

const normalizar = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const DATA_RE = /^\d{4}-\d{2}-\d{2}$/;

function validarReserva(body) {
  const erros = {};
  const nome = String(body.nome || "").trim();
  const telefone = String(body.telefone || "").replace(/\D/g, "");
  const pessoas = Number(body.pessoas);
  const { data, horario } = body;
  const observacao = String(body.observacao || "").trim().slice(0, 280);

  if (nome.length < 3) erros.nome = "Informe seu nome completo.";
  if (telefone.length < 10 || telefone.length > 11) erros.telefone = "Informe um telefone com DDD.";
  if (!Number.isInteger(pessoas) || pessoas < 1 || pessoas > 12) erros.pessoas = "Reservas de 1 a 12 pessoas. Para grupos maiores, fale no WhatsApp.";
  if (!DATA_RE.test(data || "")) erros.data = "Escolha uma data.";
  else if (data < agoraRecife().data) erros.data = "Escolha uma data a partir de hoje.";
  if (!/^\d{2}:\d{2}$/.test(horario || "")) erros.horario = "Escolha um horário.";

  return { erros, valores: { nome, telefone, pessoas, data, horario, observacao } };
}

function textoWhatsApp(r) {
  const [y, m, d] = r.data.split("-");
  return encodeURIComponent(
    `Olá, Casa Barro! Fiz a reserva #${r.codigo} pelo site.\n` +
    `Nome: ${r.nome}\nData: ${d}/${m}/${y} às ${r.horario}\nPessoas: ${r.pessoas}` +
    (r.observacao ? `\nObservação: ${r.observacao}` : "")
  );
}

export default async function register(router, { lerDados, criarStore }) {
  restaurante = await lerDados("restaurante.json");
  reservasDb = criarStore("reservas");

  router.get("/info", () => {
    const { cardapio, avaliacoes, ...info } = restaurante;
    return { ...info, status: statusAgora(restaurante.horarios), hoje: agoraRecife().diaSemana };
  });

  router.get("/cardapio", async ({ query }) => {
    await latency(150);
    const categoria = query.get("categoria");
    const busca = normalizar(query.get("busca") || "");
    let itens = restaurante.cardapio;
    if (categoria && categoria !== "todos") itens = itens.filter((i) => i.categoria === categoria);
    if (busca) itens = itens.filter((i) => normalizar(`${i.nome} ${i.descricao} ${i.tags.join(" ")}`).includes(busca));
    return { categorias: restaurante.categorias, itens };
  });

  router.get("/avaliacoes", () => ({ avaliacoes: restaurante.avaliacoes }));

  router.get("/disponibilidade", async ({ query }) => {
    await latency(200);
    const data = query.get("data");
    const pessoas = Math.max(1, Number(query.get("pessoas")) || 2);
    if (!DATA_RE.test(data || "")) throw new HttpError(400, "Data inválida.");
    const { reservas } = await lerReservas();
    const horarios = disponibilidade({
      horarios: restaurante.horarios, capacidade: restaurante.capacidadePorHorario, reservas, dataISO: data, pessoas,
    });
    return { data, pessoas, fechado: horarios.length === 0, horarios };
  });

  router.post("/reservas", async ({ body, headers }) => {
    await latency(400);
    const { erros, valores } = validarReserva(body);
    if (Object.keys(erros).length) throw new HttpError(422, "Confira os campos destacados.", erros);

    await lerReservas();
    const reserva = await reservasDb.update((db) => {
      const slots = disponibilidade({
        horarios: restaurante.horarios, capacidade: restaurante.capacidadePorHorario,
        reservas: db.reservas, dataISO: valores.data, pessoas: valores.pessoas,
      });
      const slot = slots.find((s) => s.horario === valores.horario);
      if (!slot || !slot.disponivel) {
        throw new HttpError(409, "Esse horário acabou de lotar. Escolha outro.", { horario: "Horário indisponível." });
      }
      const nova = { codigo: db.proximoCodigo++, ...valores, status: "confirmada", origem: "site", criadaEm: new Date().toISOString() };
      db.reservas.push(nova);
      return nova;
    });

    return withStatus(201, {
      reserva,
      whatsappUrl: `https://wa.me/${restaurante.whatsapp}?text=${textoWhatsApp(reserva)}`,
    });
  });

  router.get("/reservas/:codigo", async ({ params }) => {
    const { reservas } = await lerReservas();
    const r = reservas.find((x) => String(x.codigo) === params.codigo);
    if (!r) throw new HttpError(404, "Reserva não encontrada.");
    return { reserva: { ...r, telefone: r.telefone.replace(/\d(?=\d{4})/g, "*") } };
  });

  // ---------- Painel do dono ----------

  router.post("/painel/entrar", async ({ body, headers }) => {
    const { pin } = body;
    await latency(300);
    if (String(pin || "") !== PIN_PAINEL) throw new HttpError(401, "PIN incorreto.");
    const token = crypto.randomUUID();
    tokens.add(token);
    return { token, restaurante: restaurante.nome };
  });

  router.get("/painel/reservas", async ({ headers, query }) => {
    exigirPainel(headers);
    const data = query.get("data") || agoraRecife().data;
    if (!DATA_RE.test(data)) throw new HttpError(400, "Data inválida.");
    const { reservas } = await lerReservas();
    const doDia = reservas.filter((r) => r.data === data).sort((a, b) => a.horario.localeCompare(b.horario) || a.codigo - b.codigo);
    const ativas = doDia.filter((r) => r.status !== "cancelada");
    const porHorario = disponibilidade({
      horarios: restaurante.horarios, capacidade: restaurante.capacidadePorHorario, reservas, dataISO: data, pessoas: 1,
    }).map((h) => ({ horario: h.horario, ocupados: restaurante.capacidadePorHorario - h.restantes, capacidade: restaurante.capacidadePorHorario }));
    const semana = [];
    for (let i = 0; i < 7; i++) {
      const [y, m, d] = agoraRecife().data.split("-").map(Number);
      const dia = new Date(Date.UTC(y, m - 1, d + i)).toISOString().slice(0, 10);
      const lista = reservas.filter((r) => r.data === dia && r.status !== "cancelada");
      semana.push({ data: dia, reservas: lista.length, pessoas: lista.reduce((s, r) => s + r.pessoas, 0) });
    }
    return {
      data,
      reservas: doDia,
      resumo: {
        reservas: ativas.length,
        pessoas: ativas.reduce((s, r) => s + r.pessoas, 0),
        chegaram: doDia.filter((r) => r.status === "chegou").length,
        canceladas: doDia.filter((r) => r.status === "cancelada").length,
        pelosite: ativas.filter((r) => r.origem === "site").length,
      },
      porHorario,
      semana,
    };
  });

  router.post("/painel/reservas", async ({ body, headers }) => {
    exigirPainel(headers);
    const { erros, valores } = validarReserva(body);
    if (Object.keys(erros).length) throw new HttpError(422, "Confira os campos destacados.", erros);
    await lerReservas();
    const reserva = await reservasDb.update((db) => {
      const nova = { codigo: db.proximoCodigo++, ...valores, status: "confirmada", origem: "telefone", criadaEm: new Date().toISOString() };
      db.reservas.push(nova);
      return nova;
    });
    return withStatus(201, { reserva });
  });

  router.patch("/painel/reservas/:codigo", async ({ body, headers, params }) => {
    exigirPainel(headers);
    const { status } = body;
    if (!STATUS.includes(status)) throw new HttpError(422, "Situação inválida.");
    await lerReservas();
    const reserva = await reservasDb.update((db) => {
      const r = db.reservas.find((x) => String(x.codigo) === params.codigo);
      if (!r) throw new HttpError(404, "Reserva não encontrada.");
      r.status = status;
      return r;
    });
    return { reserva };
  });
}
