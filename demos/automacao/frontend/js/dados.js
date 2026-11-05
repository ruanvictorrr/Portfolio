// Abas com o que os fluxos mexeram: planilha de pedidos, estoque e mensagens enviadas.

import { api } from "./api.js";
import { el, icon, dinheiro, hora } from "./ui.js";

const tabs = [...document.querySelectorAll(".tab")];
let ultimoPedido = 0;
let estoqueAnterior = {};

function ativarAba(i, foco = false) {
  tabs.forEach((t, j) => {
    const on = i === j;
    t.setAttribute("aria-selected", String(on));
    t.tabIndex = on ? 0 : -1;
    document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
  });
  if (foco) tabs[i].focus();
}

tabs.forEach((t, i) => {
  t.addEventListener("click", () => ativarAba(i));
  t.addEventListener("keydown", (e) => {
    const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (d) ativarAba((i + d + tabs.length) % tabs.length, true);
  });
});

async function planilha() {
  const { linhas, total } = await api.planilha();
  document.getElementById("n-planilha").textContent = total;
  const maior = Math.max(...linhas.map((l) => l.pedido));
  document.getElementById("sheet-body").replaceChildren(...linhas.map((l) =>
    el("tr", { class: ultimoPedido && l.pedido > ultimoPedido ? "is-new" : "" },
      el("td", { class: "mono", text: `#${l.pedido}` }),
      el("td", { class: "mono", text: hora(l.data) }),
      el("td", { text: l.cliente }),
      el("td", { text: l.itens }),
      el("td", { class: "num", text: dinheiro(l.total) }),
      el("td", {}, el("span", { class: `pill ${l.pagamento === "Pago" ? "pill--ok" : "pill--wait"}` }, icon(l.pagamento === "Pago" ? "check" : "hourglass"), l.pagamento)),
      el("td", { text: l.origem })
    )));
  ultimoPedido = maior;
}

async function estoque() {
  const { produtos } = await api.estoque();
  const baixos = produtos.filter((p) => p.estoque < p.minimo).length;
  document.getElementById("n-estoque").textContent = baixos ? `${baixos} baixo${baixos > 1 ? "s" : ""}` : "";
  document.getElementById("stock").replaceChildren(...produtos.map((p) => {
    const mudou = estoqueAnterior[p.sku] !== undefined && estoqueAnterior[p.sku] !== p.estoque;
    const baixo = p.estoque < p.minimo;
    return el("li", { class: `${baixo ? "is-low" : ""} ${mudou ? "is-changed" : ""}` },
      el("p", { class: "stock__name", text: p.nome }),
      el("p", { class: "stock__qty", text: `${p.estoque} un.` }),
      el("p", { class: "stock__min", text: baixo ? `Abaixo do mínimo de ${p.minimo}` : `Mínimo ${p.minimo}` })
    );
  }));
  estoqueAnterior = Object.fromEntries(produtos.map((p) => [p.sku, p.estoque]));
}

async function mensagens() {
  const { mensagens } = await api.mensagens();
  document.getElementById("n-mensagens").textContent = mensagens.length || "";
  const box = document.getElementById("msgs");
  if (!mensagens.length) {
    box.replaceChildren(el("li", { class: "empty", text: "Nenhuma mensagem ainda. Execute um fluxo e as mensagens aparecem aqui." }));
    return;
  }
  box.replaceChildren(...mensagens.map((m) => el("li", { class: "msg" },
    el("p", { class: "msg__to" }, icon("whatsapp-logo"), `Para ${m.para}, ${hora(m.enviadaEm)}`),
    el("p", { class: "msg__bubble", text: m.texto })
  )));
}

export async function atualizarDados(execucao) {
  await Promise.all([planilha(), estoque(), mensagens()]);
  // Depois de rodar, mostra a aba que mais mudou
  if (execucao?.fluxo === "novo-pedido") ativarAba(0);
  else if (execucao) ativarAba(2);
}
