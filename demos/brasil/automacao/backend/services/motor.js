// Motor de automação: executa os passos de um fluxo em ordem, um de cada vez,
// passando um "contexto" de um passo para o outro (ex.: o pedido criado no 1º passo
// é usado pelos seguintes). Cada passo devolve um resumo legível e o tempo gasto.
//
// Tudo aqui é simulado (planilha, banco, WhatsApp), mas os dados mudam de verdade
// no "banco" JSON, então a planilha e o estoque da tela refletem cada execução.

const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const sorteio = (lista) => lista[Math.floor(Math.random() * lista.length)];
const agoraISO = () => new Date().toISOString();

function enviarMensagem(db, para, texto, canal = "WhatsApp") {
  const msg = { id: db.mensagens.length + 1, para, texto, canal, enviadaEm: agoraISO() };
  db.mensagens.unshift(msg);
  db.mensagens = db.mensagens.slice(0, 40);
  return msg;
}

// Pedido escolhido na tela ou sorteado
function montarPedido(db, entrada = {}) {
  const cliente = db.clientes.find((c) => c.nome === entrada.cliente) || sorteio(db.clientes);
  let itens;
  if (entrada.sku) {
    const p = db.produtos.find((x) => x.sku === entrada.sku);
    if (!p) throw new Error("Produto não encontrado.");
    itens = [{ sku: p.sku, nome: p.nome, qtd: Math.max(1, Math.min(60, Number(entrada.qtd) || 6)), preco: p.preco }];
  } else {
    const n = 1 + Math.floor(Math.random() * 2);
    const escolhidos = [...db.produtos].sort(() => Math.random() - 0.5).slice(0, n);
    itens = escolhidos.map((p) => ({ sku: p.sku, nome: p.nome, qtd: 6 * (1 + Math.floor(Math.random() * 3)), preco: p.preco }));
  }
  const total = Math.round(itens.reduce((s, i) => s + i.qtd * i.preco, 0) * 100) / 100;
  return { numero: db.proximoPedido++, cliente, itens, total, origem: sorteio(["Site", "WhatsApp"]) };
}

const PASSOS = {
  gatilho_pedido(db, ctx) {
    ctx.pedido = montarPedido(db, ctx.entrada);
    const p = ctx.pedido;
    return {
      resumo: `Pedido #${p.numero} de ${p.cliente.nome} pelo ${p.origem}`,
      detalhe: p.itens.map((i) => `${i.qtd}x ${i.nome}`).join(", ") + `. Total ${brl(p.total)}.`,
    };
  },

  planilha_adicionar(db, ctx) {
    const p = ctx.pedido;
    db.planilha.push({
      pedido: p.numero, data: agoraISO(), cliente: p.cliente.nome,
      itens: p.itens.map((i) => `${i.qtd}x ${i.nome}`).join(", "),
      total: p.total, pagamento: "Aguardando Pix", origem: p.origem,
    });
    return { resumo: `Linha ${db.planilha.length + 1} adicionada na aba "Pedidos"`, detalhe: `Cliente, itens, total e origem preenchidos.` };
  },

  estoque_baixar(db, ctx) {
    const mudancas = [];
    const faltou = [];
    for (const item of ctx.pedido.itens) {
      const prod = db.produtos.find((x) => x.sku === item.sku);
      const antes = prod.estoque;
      if (item.qtd > antes) faltou.push(prod.nome);
      prod.estoque = Math.max(0, antes - item.qtd);
      mudancas.push(`${prod.nome}: ${antes} para ${prod.estoque}`);
    }
    ctx.estoqueMudou = true;
    return {
      resumo: faltou.length ? `Estoque baixado, mas faltou ${faltou.join(", ")}` : "Estoque atualizado",
      detalhe: mudancas.join(". ") + ".",
      alerta: faltou.length > 0,
    };
  },

  pix_gerar(db, ctx) {
    const txid = Math.random().toString(36).slice(2, 12).toUpperCase();
    ctx.pix = `00020126580014BR.GOV.BCB.PIX0136moura-modas-demo${txid}5204000053039865406${ctx.pedido.total.toFixed(2)}5802BR6007CARUARU`;
    return { resumo: `Cobrança de ${brl(ctx.pedido.total)} gerada`, detalhe: `Pix copia e cola com vencimento em 24h (identificador ${txid}).` };
  },

  whatsapp_cliente(db, ctx) {
    const p = ctx.pedido;
    const texto =
      `Oi, ${p.cliente.nome.split(" ")[0]}! Recebemos seu pedido #${p.numero} na Moura Modas.\n` +
      p.itens.map((i) => `• ${i.qtd}x ${i.nome}`).join("\n") +
      `\nTotal: ${brl(p.total)}\nO Pix copia e cola vai na próxima mensagem. Assim que pagar, separamos tudo.`;
    enviarMensagem(db, `${p.cliente.nome} (${p.cliente.whatsapp})`, texto);
    return { resumo: `Mensagem enviada para ${p.cliente.whatsapp}`, detalhe: "Resumo do pedido e Pix para pagar." };
  },

  avisar_expedicao(db, ctx) {
    const p = ctx.pedido;
    enviarMensagem(db, "Grupo Expedição", `Separar pedido #${p.numero} (${p.cliente.loja}) assim que o Pix cair.`);
    return { resumo: "Equipe avisada no grupo", detalhe: `Expedição sabe que o pedido #${p.numero} vem aí.` };
  },

  gatilho_agenda(db, ctx, passo) {
    return { resumo: `Disparado manualmente agora`, detalhe: `Normalmente roda sozinho: ${passo.titulo.toLowerCase()}.` };
  },

  estoque_conferir(db, ctx) {
    ctx.baixos = db.produtos.filter((p) => p.estoque < p.minimo);
    return {
      resumo: ctx.baixos.length ? `${ctx.baixos.length} produto(s) abaixo do mínimo` : "Tudo acima do mínimo",
      detalhe: ctx.baixos.length ? ctx.baixos.map((p) => `${p.nome} (${p.estoque} de mínimo ${p.minimo})`).join(". ") + "." : "Nenhuma compra necessária hoje.",
    };
  },

  lista_compra(db, ctx) {
    if (!ctx.baixos.length) return { resumo: "Sem lista hoje", detalhe: "Passo pulado porque o estoque está em dia.", pulado: true };
    const porFornecedor = {};
    for (const p of ctx.baixos) {
      const repor = p.minimo * 2 - p.estoque;
      (porFornecedor[p.fornecedor] ||= []).push(`${repor}x ${p.nome}`);
    }
    ctx.lista = porFornecedor;
    return {
      resumo: `Lista para ${Object.keys(porFornecedor).length} fornecedor(es)`,
      detalhe: Object.entries(porFornecedor).map(([f, itens]) => `${f}: ${itens.join(", ")}`).join(". ") + ".",
    };
  },

  whatsapp_dono(db, ctx) {
    if (!ctx.lista) return { resumo: "Nada para enviar", detalhe: "Sem produtos para repor.", pulado: true };
    const texto = "Estoque de hoje, precisa repor:\n" +
      Object.entries(ctx.lista).map(([f, itens]) => `${f}\n${itens.map((i) => `• ${i}`).join("\n")}`).join("\n\n");
    enviarMensagem(db, `${db.dono.nome} (${db.dono.whatsapp})`, texto);
    return { resumo: `Lista enviada para ${db.dono.nome}`, detalhe: "Com quantidades sugeridas para voltar ao dobro do mínimo." };
  },

  relatorio_calcular(db, ctx) {
    const hoje = new Date().toLocaleDateString("en-CA", { timeZone: "America/Recife" });
    const doDia = db.planilha.filter((l) => new Date(l.data).toLocaleDateString("en-CA", { timeZone: "America/Recife" }) === hoje);
    const total = doDia.reduce((s, l) => s + l.total, 0);
    const pagos = doDia.filter((l) => l.pagamento === "Pago").length;
    const contagem = {};
    for (const l of doDia) for (const parte of l.itens.split(", ")) {
      const [qtd, ...nome] = parte.split("x ");
      contagem[nome.join("x ")] = (contagem[nome.join("x ")] || 0) + Number(qtd);
    }
    const top = Object.entries(contagem).sort((a, b) => b[1] - a[1])[0];
    ctx.relatorio = { pedidos: doDia.length, total, pagos, top };
    return {
      resumo: `${doDia.length} pedidos, ${brl(total)} no dia`,
      detalhe: top ? `Mais vendido: ${top[0]} (${top[1]} peças). ${pagos} pedido(s) já pagos.` : "Nenhum pedido hoje ainda.",
    };
  },

  whatsapp_relatorio(db, ctx) {
    const r = ctx.relatorio;
    const texto = `Boa noite, ${db.dono.nome}! Resumo de hoje:\n• Pedidos: ${r.pedidos}\n• Vendido: ${brl(r.total)}\n• Já pagos: ${r.pagos}` +
      (r.top ? `\n• Campeão: ${r.top[0]} (${r.top[1]} peças)` : "");
    enviarMensagem(db, `${db.dono.nome} (${db.dono.whatsapp})`, texto);
    return { resumo: "Resumo enviado", detalhe: `${db.dono.nome} recebeu os números do dia no WhatsApp.` };
  },

  clientes_inativos(db, ctx) {
    ctx.inativos = db.clientes.filter((c) => c.ultimaCompraDias > 45);
    return {
      resumo: `${ctx.inativos.length} lojistas sem comprar há mais de 45 dias`,
      detalhe: ctx.inativos.map((c) => `${c.nome} (${c.ultimaCompraDias} dias)`).join(", ") + ".",
    };
  },

  whatsapp_campanha(db, ctx) {
    for (const c of ctx.inativos) {
      enviarMensagem(db, `${c.nome} (${c.whatsapp})`,
        `Oi, ${c.nome.split(" ")[0]}! Saiu a coleção de verão da Moura Modas. Para a ${c.loja.split(",")[0]}, tem 8% de desconto até sexta com o cupom VOLTA8. Quer ver as fotos?`);
    }
    return { resumo: `${ctx.inativos.length} convites enviados`, detalhe: "Cada um com o nome da loja e cupom de 8%." };
  },
};

export function executarFluxo(db, fluxo, entrada) {
  const ctx = { entrada };
  const inicio = Date.now();
  const passos = fluxo.passos.map((passo) => {
    const t0 = performance.now();
    try {
      const r = PASSOS[passo.tipo](db, ctx, passo);
      return { ...passo, status: r.pulado ? "pulado" : r.alerta ? "alerta" : "ok", ...r, ms: Math.round(performance.now() - t0) + 180 + Math.floor(Math.random() * 520) };
    } catch (err) {
      return { ...passo, status: "erro", resumo: "Falhou", detalhe: err.message, ms: 0 };
    }
  });

  const execucao = {
    id: `${fluxo.id}-${inicio}`,
    fluxo: fluxo.id,
    nome: fluxo.nome,
    em: agoraISO(),
    status: passos.some((p) => p.status === "erro") ? "erro" : "ok",
    passos,
  };
  fluxo.execucoesMes += 1;
  db.execucoes.unshift({ id: execucao.id, fluxo: fluxo.id, nome: fluxo.nome, em: execucao.em, status: execucao.status, resumo: passos[0].resumo });
  db.execucoes = db.execucoes.slice(0, 30);
  return execucao;
}
