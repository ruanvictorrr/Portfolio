// Lista de estoque: filtro por situação, busca e reposição que grava na API.

import { api } from "./api.js";
import { el, icon, inteiro } from "./format.js";

const lista = document.getElementById("stock-list");
const chips = [...document.querySelectorAll("#stock-status .chip")];
const busca = document.getElementById("stock-search");
let status = "critico";
let pedido = 0;

const ROTULO = { critico: "Crítico", baixo: "Baixo", ok: "Em dia" };
const ICONE = { critico: "warning-octagon", baixo: "warning", ok: "check-circle" };

function item(i, destacar = false) {
  const qtd = el("input", { type: "number", min: 1, max: 10000, value: i.sugestaoCompra || 10, inputmode: "numeric", "aria-label": `Quantidade para repor de ${i.nome}` });
  const erro = el("p", { class: "error", role: "alert" });
  const botao = el("button", { type: "submit", text: "Repor" });
  const li = el("li", { class: `stock-item ${destacar ? "is-updated" : ""}` },
    el("p", { class: "stock-item__name", text: i.nome }),
    el("form", {
      class: "restock",
      onsubmit: async (e) => {
        e.preventDefault();
        botao.disabled = true;
        erro.textContent = "";
        try {
          const { item: novo } = await api.repor(i.id, Number(qtd.value));
          const situacao = { critico: "ainda crítico", baixo: "ainda baixo", ok: "em dia" }[novo.status];
          document.getElementById("stock-msg").replaceChildren(
            icon("check-circle", true), ` ${novo.nome}: +${inteiro(Number(qtd.value))} unidades. Agora ${inteiro(novo.estoque)}, ${situacao}.`);
          await carregarEstoque(novo.id);
        } catch (err) {
          erro.textContent = err.message;
          botao.disabled = false;
        }
      },
    }, qtd, botao),
    el("p", { class: "stock-item__meta" },
      el("span", { class: `status status--${i.status}` }, icon(ICONE[i.status], true), ROTULO[i.status]),
      el("span", { text: `${inteiro(i.estoque)} em estoque` }),
      el("span", { text: i.coberturaDias != null ? `dura ~${i.coberturaDias.toLocaleString("pt-BR")} dias` : "sem venda recente" }),
      el("span", { text: `vende ${i.mediaDia.toLocaleString("pt-BR")}/dia` })),
    erro
  );
  if (i.status === "ok") li.querySelector(".restock input").value = 10;
  return li;
}

export async function carregarEstoque(destacarId) {
  const id = ++pedido;
  try {
    const { itens, contagem } = await api.estoque(status, busca.value.trim());
    if (id !== pedido) return;
    document.getElementById("n-critico").textContent = contagem.critico;
    document.getElementById("n-baixo").textContent = contagem.baixo;
    if (!itens.length) {
      lista.replaceChildren(el("li", { class: "empty" }, status === "todos" ? "Nenhum produto encontrado." : `Nenhum produto com estoque ${ROTULO[status].toLowerCase()}. Tudo em dia.`));
      return;
    }
    lista.replaceChildren(...itens.map((i) => item(i, i.id === destacarId)));
  } catch (err) {
    if (id === pedido) lista.replaceChildren(el("li", { class: "empty", text: err.message }));
  }
}

export function iniciarEstoque() {
  chips.forEach((c) => c.addEventListener("click", () => {
    status = c.dataset.status;
    chips.forEach((x) => x.setAttribute("aria-pressed", String(x === c)));
    carregarEstoque();
  }));
  let t;
  busca.addEventListener("input", () => {
    clearTimeout(t);
    t = setTimeout(() => {
      // Ao buscar, procura em todos os produtos
      if (busca.value.trim() && status !== "todos") {
        status = "todos";
        chips.forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.status === "todos")));
      }
      carregarEstoque();
    }, 200);
  });
  document.getElementById("reset-estoque").addEventListener("click", async () => {
    await api.reiniciar();
    carregarEstoque();
  });
  carregarEstoque();
}
