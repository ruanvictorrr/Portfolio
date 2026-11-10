// Formatação no idioma escolhido (valores sempre em reais) e helpers de DOM.

import { LOCALE, LOCALE_MOEDA } from "../../shared/js/idioma.js";

const brl = new Intl.NumberFormat(LOCALE_MOEDA, { style: "currency", currency: "BRL" });
const brlCurto = new Intl.NumberFormat(LOCALE_MOEDA, { style: "currency", currency: "BRL", notation: "compact", maximumFractionDigits: 1 });
export const dinheiro = (v) => brl.format(v);
export const dinheiroCurto = (v) => (Math.abs(v) >= 10000 ? brlCurto.format(v) : brl.format(Math.round(v)).replace(/[.,]00(?!\d)/, ""));
export const inteiro = (v) => Math.round(v).toLocaleString(LOCALE);
export const pct = (v, casas = 1) => `${v.toLocaleString(LOCALE, { minimumFractionDigits: casas, maximumFractionDigits: casas })}%`;

export function diaCurto(iso) {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}
export function diaLongo(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(LOCALE, { weekday: "short", day: "numeric", month: "short" });
}

export function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else if (k === "style") node.style.cssText = v;
    else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) node.setAttribute(k, v === true ? "" : v);
  }
  node.append(...children.filter((c) => c != null && c !== false));
  return node;
}

const SVG = "http://www.w3.org/2000/svg";
export function svg(tag, attrs = {}, ...children) {
  const node = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) node.setAttribute(k, v);
  node.append(...children.filter(Boolean));
  return node;
}

export const icon = (name, fill = false) => el("i", { class: `${fill ? "ph-fill" : "ph"} ph-${name}`, "aria-hidden": "true" });
