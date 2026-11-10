// Ponto de entrada: filtros controlam todos os números e gráficos ao mesmo tempo.

import "./i18n.js";
import { LOCALE } from "../../../shared/js/idioma.js";
import { api } from "./api.js";
import { el, icon, dinheiro, inteiro, pct, diaLongo, diaCurto } from "./format.js";
import { graficoLinha, barrasHorizontais, colunas, barraEmpilhada } from "./charts.js";
import { iniciarEstoque } from "./estoque.js";

const app = document.getElementById("app");
const filtros = document.getElementById("filters");
const selCategoria = document.getElementById("categoria");
let pedido = 0;

function delta(alvo, v, { pontos = false, invertido = false } = {}) {
  const box = document.getElementById(alvo);
  if (v == null) { box.replaceChildren(); return; }
  const sobe = v > 0;
  const bom = invertido ? !sobe : sobe;
  const texto = pontos ? `${sobe ? "+" : ""}${v.toLocaleString(LOCALE)} p.p.` : `${sobe ? "+" : ""}${pct(v)}`;
  box.replaceChildren(
    el("span", { class: v === 0 ? "" : bom ? "up" : "down" }, icon(v === 0 ? "minus" : sobe ? "arrow-up-right" : "arrow-down-right"), el("strong", { text: texto })),
    " vs. período anterior"
  );
}

function desenhar(r) {
  document.getElementById("loja").textContent = r.loja;
  document.getElementById("periodo-texto").textContent = `${r.bairro}. De ${diaLongo(r.desde)} a ${diaLongo(r.ate)}${r.categoria ? `, só ${r.categoria}` : ""}.`;

  document.getElementById("k-faturamento").textContent = dinheiro(r.kpis.faturamento.valor);
  document.getElementById("k-pedidos").textContent = inteiro(r.kpis.pedidos.valor);
  document.getElementById("k-ticket").textContent = dinheiro(r.kpis.ticket.valor);
  document.getElementById("k-margem").textContent = pct(r.kpis.margem.valor);
  delta("d-faturamento", r.kpis.faturamento.variacao);
  delta("d-pedidos", r.kpis.pedidos.variacao);
  delta("d-ticket", r.kpis.ticket.variacao);
  delta("d-margem", r.kpis.margem.variacao, { pontos: true });

  graficoLinha(document.getElementById("chart-serie"), r.serie);
  document.querySelector("#t-serie tbody").replaceChildren(...r.serie.map((d) =>
    el("tr", {}, el("td", { text: diaCurto(d.data) }), el("td", { class: "num", text: dinheiro(d.valor) }), el("td", { class: "num", text: d.anterior != null ? dinheiro(d.anterior) : "-" }))));

  barrasHorizontais(document.getElementById("chart-cat"), r.porCategoria, {
    ativa: r.categoria,
    aoClicar: (c) => { selCategoria.value = c; carregar(); },
  });
  colunas(document.getElementById("chart-hora"), r.porHora);
  barraEmpilhada(document.getElementById("chart-pag"), r.porPagamento);

  document.getElementById("t-top").replaceChildren(...r.topProdutos.map((p) => el("tr", {},
    el("td", {}, el("span", { class: "prod", text: p.nome }), el("span", { class: "cat", text: p.categoria })),
    el("td", { class: "num", text: inteiro(p.unidades) }),
    el("td", { class: "num", text: dinheiro(p.faturamento) }),
    el("td", { class: `num ${p.variacao > 0 ? "delta-up" : p.variacao < 0 ? "delta-down" : ""}`, text: p.variacao == null ? "-" : `${p.variacao > 0 ? "+" : ""}${pct(p.variacao)}` })
  )));
}

async function carregar() {
  const id = ++pedido;
  const periodo = new FormData(filtros).get("periodo");
  app.classList.add("is-loading"); // mantém o desenho anterior, só esmaece
  try {
    const r = await api.resumo(periodo, selCategoria.value);
    if (id !== pedido) return;
    if (selCategoria.options.length === 1) {
      selCategoria.append(...r.categorias.map((c) => el("option", { value: c, text: c })));
      selCategoria.value = r.categoria || "";
    }
    desenhar(r);
  } catch (err) {
    document.getElementById("periodo-texto").textContent = err.message;
  } finally {
    if (id === pedido) app.classList.remove("is-loading");
  }
}

filtros.addEventListener("change", carregar);
carregar();
iniciarEstoque();
