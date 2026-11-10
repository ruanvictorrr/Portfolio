// Formatação no idioma escolhido (preços sempre em reais).

import { LOCALE, LOCALE_MOEDA } from "../../shared/js/idioma.js";

const brl = new Intl.NumberFormat(LOCALE_MOEDA, { style: "currency", currency: "BRL" });
export const dinheiro = (v) => brl.format(v);

export const DIAS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export function dataLonga(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(LOCALE, { weekday: "long", day: "numeric", month: "long" });
}

export function hojeISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// (81) 9 9642-3187 enquanto a pessoa digita
export function mascaraTelefone(valor) {
  const n = valor.replace(/\D/g, "").slice(0, 11);
  if (n.length <= 2) return n.length ? `(${n}` : "";
  if (n.length <= 6) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
  if (n.length <= 10) return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`;
  return `(${n.slice(0, 2)}) ${n.slice(2, 3)} ${n.slice(3, 7)}-${n.slice(7)}`;
}

// Cria elemento com texto seguro (sem innerHTML para dados vindos da API)
export function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) node.setAttribute(k, v === true ? "" : v);
  }
  node.append(...children.filter(Boolean));
  return node;
}
