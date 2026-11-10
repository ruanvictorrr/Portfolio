// Painel da pizzaria: o pedido fechado no WhatsApp aparece aqui na hora.

import { api } from "./api.js";
import { el, dinheiro } from "./dom.js";
import { LOCALE } from "../../shared/js/idioma.js";

const lista = document.getElementById("orders");
let vistos = null;

const hora = (iso) => new Date(iso).toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit" });

export async function atualizarPainel() {
  try {
    const [{ pedidos }, numeros] = await Promise.all([api.pedidos(), api.painel()]);
    document.getElementById("s-conversas").textContent = numeros.conversas;
    document.getElementById("s-robo").textContent = numeros.resolvidasPeloRobo;
    document.getElementById("s-equipe").textContent = numeros.transferidas;

    const novos = vistos ? pedidos.filter((p) => !vistos.has(p.numero)) : [];
    vistos = new Set(pedidos.map((p) => p.numero));
    lista.replaceChildren(...pedidos.map((p) => el("li", { class: `order ${novos.includes(p) ? "is-new" : ""}` },
      el("span", { class: "order__num", text: `#${p.numero}` }),
      el("span", { class: "order__who", text: `${p.cliente}, ${hora(p.criadoEm)}` }),
      el("span", { class: "order__total", text: dinheiro(p.total) }),
      el("span", { class: "order__status", text: p.status }),
      el("span", { class: "order__items", text: `${p.itens.map((i) => i.nome).join(", ")}. ${p.entrega.tipo === "entrega" ? `Entrega no ${p.entrega.bairro}` : "Retirada"}, ${p.pagamento}.` })
    )));
  } catch {
    /* painel é secundário: se falhar, o chat continua */
  }
}
