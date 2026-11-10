// Helpers de interface: criação de elementos com texto seguro e formatação no idioma escolhido.

import { LOCALE, LOCALE_MOEDA } from "../../../shared/js/idioma.js";

export function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) node.setAttribute(k, v === true ? "" : v);
  }
  node.append(...children.filter((c) => c != null && c !== false));
  return node;
}

export const icon = (name, fill = false) => el("i", { class: `${fill ? "ph-fill" : "ph"} ph-${name}`, "aria-hidden": "true" });

const brl = new Intl.NumberFormat(LOCALE_MOEDA, { style: "currency", currency: "BRL" });
export const dinheiro = (v) => brl.format(v);
export const numero = (v, casas = 0) => v.toLocaleString(LOCALE, { minimumFractionDigits: casas, maximumFractionDigits: casas });
export const hora = (iso) => new Date(iso).toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit", timeZone: "America/Recife" });

export function quando(iso) {
  const s = Math.round((Date.now() - new Date(iso)) / 1000);
  if (s < 60) return "agora";
  if (s < 3600) return `há ${Math.floor(s / 60)} min`;
  return hora(iso);
}

// Conta de um número até outro (respeita "reduzir movimento")
const reduz = matchMedia("(prefers-reduced-motion: reduce)").matches;
export function contar(node, ate, casas = 0) {
  const de = Number(node.dataset.valor || 0);
  node.dataset.valor = ate;
  if (reduz || de === ate) { node.textContent = numero(ate, casas); return; }
  const t0 = performance.now();
  const passo = (t) => {
    const p = Math.min(1, (t - t0) / 700);
    node.textContent = numero(de + (ate - de) * (1 - Math.pow(1 - p, 3)), casas);
    if (p < 1) requestAnimationFrame(passo);
  };
  requestAnimationFrame(passo);
}

export const espera = (ms) => new Promise((r) => setTimeout(r, reduz ? 0 : ms));
