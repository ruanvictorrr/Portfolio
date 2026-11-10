// Cardápio: categorias, busca com atraso curto e estados de carregando, vazio e erro.

import { api } from "./api.js";
import { dinheiro, el } from "./format.js";
import { IDIOMA, t } from "../../shared/js/idioma.js";

const normalizar = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
// Em outro idioma a busca é feita aqui, no texto traduzido (a API só conhece o português)
function filtrarTraduzido(itens, termo) {
  if (IDIOMA === "pt-BR" || !termo) return itens;
  const alvo = normalizar(termo);
  return itens.filter((i) => normalizar([i.nome, i.descricao, ...i.tags].flatMap((x) => [x, t(x)]).join(" ")).includes(alvo));
}

const lista = document.getElementById("menu-list");
const cats = document.getElementById("menu-cats");
const busca = document.getElementById("menu-search");

let categoria = "todos";
let pedidoAtual = 0;

function skeleton() {
  lista.replaceChildren(...Array.from({ length: 6 }, () =>
    el("div", { class: "dish dish--no-photo dish--skeleton", "aria-hidden": "true" },
      el("div", {}, el("div", { class: "sk", style: "height:20px;width:60%" }), el("div", { class: "sk", style: "height:14px;width:90%;margin-top:10px" })),
      el("div", { class: "sk", style: "height:20px;width:64px" }))
  ));
}

function itemDish(item) {
  const meta = el("div", { class: "dish__meta" },
    el("span", { text: item.serve > 1 ? `Serve ${item.serve}` : "Individual" }),
    ...item.tags.map((t) => el("span", { class: "dish__tag", text: t }))
  );
  return el("article", { class: `dish ${item.foto ? "" : "dish--no-photo"}` },
    item.foto ? el("img", { class: "dish__thumb", src: item.foto.replace(/\.jpg$/, "-thumb.jpg"), alt: "", width: 72, height: 72, loading: "lazy" }) : null,
    el("div", {}, el("h3", { class: "dish__name", text: item.nome }), el("p", { class: "dish__desc", text: item.descricao }), meta),
    el("p", { class: "dish__price", text: dinheiro(item.preco) })
  );
}

function vazio(mensagem, icone = "ph-bowl-food") {
  return el("div", { class: "empty" }, el("i", { class: `ph ${icone}`, "aria-hidden": "true" }), el("p", { text: mensagem }));
}

async function carregar() {
  const id = ++pedidoAtual;
  lista.setAttribute("aria-busy", "true");
  try {
    const termo = busca.value.trim();
    const resposta = await api.cardapio(categoria, IDIOMA === "pt-BR" ? termo : "");
    const { categorias } = resposta;
    const itens = filtrarTraduzido(resposta.itens, termo);
    if (id !== pedidoAtual) return; // chegou uma resposta mais nova
    if (!cats.childElementCount) desenharCategorias(categorias);
    lista.replaceChildren(...(itens.length ? itens.map(itemDish) : [vazio(`Nada encontrado para "${busca.value.trim()}". Tente "queijo" ou "vegetariano".`, "ph-magnifying-glass")]));
  } catch (err) {
    if (id === pedidoAtual) lista.replaceChildren(vazio(err.message, "ph-wifi-slash"));
  } finally {
    if (id === pedidoAtual) lista.setAttribute("aria-busy", "false");
  }
}

function desenharCategorias(categorias) {
  const todas = [{ id: "todos", nome: "Tudo" }, ...categorias];
  cats.replaceChildren(...todas.map((c) =>
    el("button", {
      class: "chip", type: "button", role: "tab", "aria-selected": String(c.id === categoria), text: c.nome,
      onclick: (e) => {
        categoria = c.id;
        cats.querySelectorAll(".chip").forEach((b) => b.setAttribute("aria-selected", String(b === e.currentTarget)));
        carregar();
      },
    })
  ));
}

export function iniciarCardapio() {
  skeleton();
  let t;
  busca.addEventListener("input", () => { clearTimeout(t); t = setTimeout(carregar, 220); });
  carregar();
}
