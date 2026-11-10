// Ponto de entrada: carrega o painel, liga fluxos, dados, histórico e a calculadora.

import "./i18n.js";
import { api } from "./api.js";
import { el, icon, contar, quando, dinheiro, numero } from "./ui.js";
import { iniciarFluxos } from "./fluxos.js";
import { atualizarDados } from "./dados.js";

function desenharNumeros(n) {
  contar(document.getElementById("k-horas"), n.horasEconomizadas, 1);
  contar(document.getElementById("k-exec"), n.execucoesMes);
  contar(document.getElementById("k-ativos"), n.fluxosAtivos);
  contar(document.getElementById("k-msg"), n.mensagensEnviadas);
}

function desenharHistorico(execucoes) {
  const box = document.getElementById("history");
  if (!execucoes.length) {
    box.replaceChildren(el("li", { class: "empty", text: "Ainda não rodou nada nesta demonstração." }));
    return;
  }
  box.replaceChildren(...execucoes.map((x) => el("li", { class: x.status === "erro" ? "is-erro" : "" },
    icon(x.status === "erro" ? "x-circle" : "check-circle", true),
    el("p", { class: "history__what" }, el("strong", { text: x.nome }), `. ${x.resumo}`),
    el("span", { class: "history__when", text: quando(x.em) })
  )));
}

async function carregar(evento = {}) {
  const painel = await api.painel();
  desenharNumeros(painel.numeros);
  desenharHistorico(painel.execucoes);
  if (!evento.apenasPainel && !evento.execucao) iniciarFluxos(painel, carregar);
  if (!evento.apenasPainel) await atualizarDados(evento.execucao);
}

function iniciarCalculadora() {
  const form = document.getElementById("calc");
  const calc = () => {
    const v = (n) => Math.max(0, Number(form[n].value) || 0);
    const horas = (v("vezes") * v("min") * v("dias")) / 60;
    document.getElementById("calc-horas").textContent = `${numero(horas, horas < 10 ? 1 : 0)} h`;
    document.getElementById("calc-valor").textContent = dinheiro(horas * v("hora"));
  };
  form.addEventListener("input", calc);
  calc();
}

const resetBtn = document.getElementById("reset");
resetBtn.addEventListener("click", async () => {
  resetBtn.disabled = true;
  try {
    await api.reiniciar();
    await carregar({ reiniciou: true });
  } finally {
    resetBtn.disabled = false;
  }
});

iniciarCalculadora();
carregar().catch((err) => {
  document.getElementById("c-title").textContent = err.message;
});
