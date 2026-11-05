// Um único tooltip para a página. Conteúdo montado com textContent (dados nunca viram HTML).

import { el } from "./format.js";

const tip = document.getElementById("tooltip");

export function mostrarTooltip(x, y, titulo, linhas) {
  tip.replaceChildren(
    el("p", { class: "tooltip__title", text: titulo }),
    ...linhas.map((l) => el("div", { class: "tooltip__row" },
      el("span", { class: `tooltip__key ${l.prev ? "tooltip__key--prev" : ""}`, style: l.cor ? `background:${l.cor}` : null }),
      el("strong", { text: l.valor }),
      el("span", { text: l.nome })))
  );
  tip.hidden = false;
  const r = tip.getBoundingClientRect();
  const left = Math.min(window.innerWidth - r.width - 8, Math.max(8, x + 14));
  const top = y - r.height - 12 < 8 ? y + 16 : y - r.height - 12;
  tip.style.left = `${left}px`;
  tip.style.top = `${top}px`;
}

export function esconderTooltip() {
  tip.hidden = true;
}
