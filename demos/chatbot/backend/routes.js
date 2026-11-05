// API da demo "Forno Tomazzi" (ChatBot de WhatsApp).
//
//   POST /api/chatbot/conversas                 abre uma conversa e recebe as boas-vindas
//   POST /api/chatbot/conversas/:id/mensagens   envia { texto } ou { id, texto } (clique em botão)
//   GET  /api/chatbot/pedidos                   pedidos que chegaram (painel da pizzaria)
//   GET  /api/chatbot/painel                    números do atendimento

import { HttpError, withStatus } from "../../../server/lib/http-core.js";
import { criarBot } from "./services/bot.js";

let cardapio, pedidosDb;
let bot;
let proximoNumeroReservado;

// Conversas ficam em memória (como uma sessão). Somem depois de 2h paradas.
const conversas = new Map();
const stats = { conversas: 0, mensagens: 0, resolvidasPeloRobo: 0, transferidas: 0 };
const limpeza = setInterval(() => {
  const limite = Date.now() - 2 * 60 * 60 * 1000;
  for (const [id, s] of conversas) if (s.vistaEm < limite) conversas.delete(id);
}, 10 * 60 * 1000);
limpeza.unref?.(); // no Node, não segura o processo aberto

function pegarConversa(id) {
  const s = conversas.get(id);
  if (!s) throw new HttpError(404, "Conversa expirada. Recarregue a página.");
  s.vistaEm = Date.now();
  return s;
}

export default async function register(router, { lerDados, criarStore }) {
  cardapio = await lerDados("pizzaria.json");
  bot = criarBot(cardapio);
  pedidosDb = criarStore("pedidos");
  // Número do próximo pedido, carregado do banco ao iniciar
  proximoNumeroReservado = (await pedidosDb.read()).proximoNumero;

  router.post("/conversas", () => {
    const s = { id: crypto.randomUUID(), vistaEm: Date.now() };
    conversas.set(s.id, s);
    stats.conversas += 1;
    return withStatus(201, { conversa: s.id, mensagens: bot.boasVindas(s) });
  });

  router.post("/conversas/:id/mensagens", async ({ body, headers, params }) => {
    const s = pegarConversa(params.id);

    const texto = String(body.texto || "").slice(0, 400);
    const id = body.id ? String(body.id).slice(0, 60) : undefined;
    if (!texto.trim() && !id) throw new HttpError(422, "Mensagem vazia.");
    stats.mensagens += 1;

    const pendentes = [];
    const estavaComAtendente = s.atendente;
    const mensagens = bot.responder(s, { texto, id }, (sessao) => {
      // Salvar é assíncrono; o número é reservado já aqui para a resposta sair na hora
      const taxa = sessao.entrega.taxa || 0;
      const pedido = {
        cliente: sessao.nome,
        criadoEm: new Date().toISOString(),
        status: "Recebido",
        itens: [...sessao.carrinho],
        entrega: { ...sessao.entrega },
        pagamento: sessao.pagamento + (sessao.troco ? ` (troco para R$ ${sessao.troco})` : ""),
        total: sessao.carrinho.reduce((t, i) => t + i.preco, 0) + taxa,
        atendidoPor: "robô",
      };
      pendentes.push(pedido);
      pedido.numero = proximoNumeroReservado++;
      return pedido;
    });

    if (pendentes.length) {
      stats.resolvidasPeloRobo += 1;
      await pedidosDb.update((db) => {
        for (const p of pendentes) db.pedidos.push(p);
        db.proximoNumero = Math.max(db.proximoNumero, proximoNumeroReservado);
      });
    }
    if (!estavaComAtendente && s.atendente) stats.transferidas += 1;
    if (s.estado !== "atendente") s.atendente = false;

    return { mensagens, estado: s.estado };
  });

  router.get("/pedidos", async () => {
    const { pedidos } = await pedidosDb.read();
    return { pedidos: [...pedidos].reverse().slice(0, 10) };
  });

  router.get("/painel", async () => {
    const { pedidos } = await pedidosDb.read();
    return { ...stats, conversasAbertas: conversas.size, pedidos: pedidos.length };
  });
}
