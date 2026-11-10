// Helpers de DOM. Texto do bot pode ter *negrito* no estilo WhatsApp:
// convertemos para <strong> criando nós, sem usar innerHTML.

import { LOCALE } from "../../shared/js/idioma.js";

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

export function textoWhatsApp(texto) {
  const frag = document.createDocumentFragment();
  texto.split(/(\*[^*\n]+\*)/g).forEach((parte) => {
    if (/^\*[^*]+\*$/.test(parte)) frag.append(el("strong", { text: parte.slice(1, -1) }));
    else if (parte) frag.append(document.createTextNode(parte));
  });
  return frag;
}

export const horaAgora = () => new Date().toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit" });
export const dinheiro = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const reduzMovimento = matchMedia("(prefers-reduced-motion: reduce)").matches;
