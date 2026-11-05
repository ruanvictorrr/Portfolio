// Gera o histórico de vendas do mercadinho (dados fictícios, mas com cara de real)
// e calcula os números do painel para qualquer período e categoria.
//
// O histórico é determinístico (mesma semente, mesmos números) e sempre termina ontem,
// então a demo nunca fica com dados "velhos".

const DIAS_HISTORICO = 200;

// Gerador pseudoaleatório com semente (mulberry32)
function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FATOR_SEMANA = [0.72, 0.86, 0.9, 0.96, 1.0, 1.16, 1.38]; // dom..sáb
// Formato do movimento ao longo do dia (7h às 21h)
const HORAS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
const PESO_HORA = [3, 6, 8, 9, 10, 8, 5, 4, 5, 7, 11, 13, 10, 6, 3];
const PAGAMENTOS = [["Pix", 0.44], ["Débito", 0.25], ["Crédito", 0.19], ["Dinheiro", 0.12]];

const isoDia = (d) => d.toISOString().slice(0, 10);

function fatorDoMes(dia) {
  if (dia >= 5 && dia <= 10) return 1.2; // começo do mês, salário
  if (dia <= 4) return 1.06;
  if (dia >= 21) return 0.9;
  return 1;
}

export function gerarHistorico(produtos, hoje = new Date()) {
  const r = rng(20261104);
  const ontem = new Date(Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 1));
  const dias = [];
  for (let i = DIAS_HISTORICO - 1; i >= 0; i--) {
    const d = new Date(ontem);
    d.setUTCDate(ontem.getUTCDate() - i);
    const idx = DIAS_HISTORICO - 1 - i;
    const tendencia = 0.86 + idx * 0.0011; // loja crescendo devagar
    const fator = FATOR_SEMANA[d.getUTCDay()] * fatorDoMes(d.getUTCDate()) * tendencia * (0.9 + r() * 0.2);

    const itens = {};
    for (const p of produtos) {
      const ruido = 0.75 + r() * 0.5;
      itens[p.id] = Math.max(0, Math.round(p.vendaDia * fator * ruido));
    }
    const faturamento = produtos.reduce((s, p) => s + itens[p.id] * p.preco, 0);
    const ticketBase = 38 + r() * 9;
    const pedidos = Math.max(1, Math.round(faturamento / ticketBase));

    const pesoHoras = PESO_HORA.map((w) => w * (0.8 + r() * 0.4));
    const somaH = pesoHoras.reduce((a, b) => a + b, 0);
    const porHora = pesoHoras.map((w) => (faturamento * w) / somaH);

    const pesoPag = PAGAMENTOS.map(([, w]) => w * (0.85 + r() * 0.3));
    const somaP = pesoPag.reduce((a, b) => a + b, 0);
    const porPagamento = pesoPag.map((w) => (faturamento * w) / somaP);

    dias.push({ data: isoDia(d), itens, pedidos, porHora, porPagamento });
  }
  return dias;
}

const arred = (v, c = 2) => Math.round(v * 10 ** c) / 10 ** c;
const variacao = (atual, antes) => (antes ? arred(((atual - antes) / antes) * 100, 1) : null);

function somar(dias, produtos) {
  let faturamento = 0, custo = 0, pedidos = 0;
  for (const d of dias) {
    pedidos += d.pedidos;
    for (const p of produtos) {
      faturamento += d.itens[p.id] * p.preco;
      custo += d.itens[p.id] * p.custo;
    }
  }
  return { faturamento, custo, pedidos };
}

export function resumo({ historico, produtos, periodo, categoria }) {
  const filtrados = categoria ? produtos.filter((p) => p.categoria === categoria) : produtos;
  const atual = historico.slice(-periodo);
  const anterior = historico.slice(-periodo * 2, -periodo);
  const a = somar(atual, filtrados);
  const b = somar(anterior, filtrados);
  // Pedidos e ticket só fazem sentido proporcionalmente à categoria
  const fracao = (lista, base) => (somar(lista, produtos).faturamento ? base / somar(lista, produtos).faturamento : 0);
  const pedidosA = Math.round(a.pedidos * fracao(atual, a.faturamento));
  const pedidosB = Math.round(b.pedidos * fracao(anterior, b.faturamento));

  const kpis = {
    faturamento: { valor: arred(a.faturamento), variacao: variacao(a.faturamento, b.faturamento) },
    pedidos: { valor: pedidosA, variacao: variacao(pedidosA, pedidosB) },
    ticket: { valor: arred(a.faturamento / Math.max(1, pedidosA)), variacao: variacao(a.faturamento / Math.max(1, pedidosA), b.faturamento / Math.max(1, pedidosB)) },
    margem: { valor: arred(((a.faturamento - a.custo) / Math.max(1, a.faturamento)) * 100, 1), variacao: arred(((a.faturamento - a.custo) / Math.max(1, a.faturamento) - (b.faturamento - b.custo) / Math.max(1, b.faturamento)) * 100, 1) },
  };

  const serie = atual.map((d, i) => ({
    data: d.data,
    valor: arred(filtrados.reduce((s, p) => s + d.itens[p.id] * p.preco, 0)),
    anterior: anterior[i] ? arred(filtrados.reduce((s, p) => s + anterior[i].itens[p.id] * p.preco, 0)) : null,
  }));

  const porCategoria = [...new Set(produtos.map((p) => p.categoria))].map((c) => ({
    categoria: c,
    valor: arred(somar(atual, produtos.filter((p) => p.categoria === c)).faturamento),
  })).sort((x, y) => y.valor - x.valor);

  const escala = a.faturamento / Math.max(1, somar(atual, produtos).faturamento);
  const porHora = HORAS.map((h, i) => ({ hora: h, valor: arred((atual.reduce((s, d) => s + d.porHora[i], 0) / atual.length) * escala) }));
  const porPagamento = PAGAMENTOS.map(([nome], i) => ({ forma: nome, valor: arred(atual.reduce((s, d) => s + d.porPagamento[i], 0) * escala) }));

  const topProdutos = filtrados.map((p) => {
    const unidades = atual.reduce((s, d) => s + d.itens[p.id], 0);
    const unidadesAntes = anterior.reduce((s, d) => s + d.itens[p.id], 0);
    return { id: p.id, nome: p.nome, categoria: p.categoria, unidades, faturamento: arred(unidades * p.preco), variacao: variacao(unidades, unidadesAntes) };
  }).sort((x, y) => y.faturamento - x.faturamento).slice(0, 8);

  return { periodo, categoria: categoria || null, ate: atual.at(-1).data, desde: atual[0].data, kpis, serie, porCategoria, porHora, porPagamento, topProdutos };
}

export function situacaoEstoque({ historico, produtos }) {
  const ult30 = historico.slice(-30);
  return produtos.map((p) => {
    const mediaDia = ult30.reduce((s, d) => s + d.itens[p.id], 0) / ult30.length;
    const cobertura = mediaDia ? p.estoque / mediaDia : Infinity;
    const status = cobertura < 3 || p.estoque < p.minimo * 0.5 ? "critico" : p.estoque < p.minimo || cobertura < 7 ? "baixo" : "ok";
    return {
      id: p.id, nome: p.nome, categoria: p.categoria, estoque: p.estoque, minimo: p.minimo,
      mediaDia: arred(mediaDia, 1), coberturaDias: Number.isFinite(cobertura) ? arred(cobertura, 1) : null, status,
      sugestaoCompra: status === "ok" ? 0 : Math.max(0, Math.ceil(mediaDia * 14 - p.estoque)),
    };
  });
}
