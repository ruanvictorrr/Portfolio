// Lista de fluxos (com liga/desliga) e o canvas que mostra os passos acendendo durante a execução.

import { api } from "./api.js";
import { el, icon, numero, espera } from "./ui.js";

const lista = document.getElementById("flows");
const passosBox = document.getElementById("steps");
const form = document.getElementById("run-form");
const campos = document.getElementById("run-fields");
const botao = document.getElementById("run-btn");
const msg = document.getElementById("run-msg");

let estado = { fluxos: [], selecionado: null, rodando: false };
let aoExecutar = () => {};

function desenharLista() {
  lista.setAttribute("aria-busy", "false");
  lista.replaceChildren(...estado.fluxos.map((f) => {
    const toggle = el("input", {
      type: "checkbox", role: "switch", "aria-label": `Ligar ${f.nome}`, checked: f.ativo,
      onclick: (e) => e.stopPropagation(),
      onchange: async (e) => {
        const ativo = e.target.checked;
        try {
          await api.alternar(f.id, ativo);
          f.ativo = ativo;
          desenharLista();
          if (estado.selecionado?.id === f.id) desenharCanvas();
          aoExecutar({ apenasPainel: true });
        } catch (err) {
          e.target.checked = !ativo;
          msg.textContent = err.message;
        }
      },
    });
    return el("li", {},
      el("div", {
        class: `flow ${f.ativo ? "" : "is-off"}`, tabindex: "0", role: "button",
        "aria-current": String(estado.selecionado?.id === f.id),
        onclick: () => selecionar(f.id),
        onkeydown: (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selecionar(f.id); } },
      },
        el("p", { class: "flow__name", text: f.nome }),
        el("p", { class: "flow__meta", text: f.ativo ? `${numero(f.execucoesMes)} execuções no mês` : "Desligado" }),
        el("label", { class: "switch" }, toggle, el("span", { "aria-hidden": "true" }))
      ));
  }));
}

function desenharPassos(resultados = []) {
  const f = estado.selecionado;
  passosBox.replaceChildren(...f.passos.map((p, i) => {
    const r = resultados[i];
    return el("li", { class: `step ${r ? `is-${r.status}` : ""}`, "data-i": i },
      el("div", { class: "step__node" },
        el("span", { class: "step__icon" }, icon(p.icone)),
        el("div", {}, el("p", { class: "step__title", text: p.titulo }), el("p", { class: "step__app", text: p.app }))
      ),
      el("p", { class: "step__result" }, ...(r ? [el("strong", { text: r.resumo }), r.detalhe, el("span", { class: "step__time", text: `${(r.ms / 1000).toFixed(1)} s` })] : []))
    );
  }));
}

function desenharCanvas() {
  const f = estado.selecionado;
  document.getElementById("c-trigger").replaceChildren(icon("lightning", true), f.gatilho);
  document.getElementById("c-title").textContent = f.nome;
  document.getElementById("c-desc").textContent = f.descricao;
  campos.hidden = f.id !== "novo-pedido";
  botao.disabled = !f.ativo || estado.rodando;
  msg.textContent = f.ativo ? "" : "Fluxo desligado. Ligue na lista para executar.";
  desenharPassos();
}

function selecionar(id) {
  if (estado.rodando) return;
  estado.selecionado = estado.fluxos.find((f) => f.id === id);
  desenharLista();
  desenharCanvas();
}

async function executar(e) {
  e.preventDefault();
  if (estado.rodando) return;
  const f = estado.selecionado;
  estado.rodando = true;
  botao.disabled = true;
  msg.textContent = "";
  desenharPassos();

  const entrada = f.id === "novo-pedido"
    ? { cliente: form.cliente.value || undefined, sku: form.sku.value || undefined, qtd: Number(form.qtd.value) }
    : {};

  // Primeiro passo já "rodando" enquanto a API responde
  passosBox.children[0]?.classList.add("is-running");
  try {
    const { execucao } = await api.executar(f.id, entrada);
    for (let i = 0; i < execucao.passos.length; i++) {
      const li = passosBox.children[i];
      li.classList.add("is-running");
      await espera(Math.min(execucao.passos[i].ms, 900));
      desenharPassos(execucao.passos.slice(0, i + 1));
      passosBox.children[i + 1]?.classList.add("is-running");
    }
    f.execucoesMes += 1;
    desenharLista();
    aoExecutar({ execucao });
  } catch (err) {
    desenharPassos();
    msg.textContent = err.message;
  } finally {
    estado.rodando = false;
    botao.disabled = !f.ativo;
  }
}

export function iniciarFluxos(painel, callback) {
  aoExecutar = callback;
  estado.fluxos = painel.fluxos;
  estado.selecionado = estado.selecionado
    ? painel.fluxos.find((f) => f.id === estado.selecionado.id)
    : painel.fluxos[0];

  const selCliente = document.getElementById("f-cliente");
  const selSku = document.getElementById("f-sku");
  selCliente.replaceChildren(el("option", { value: "", text: "Sortear cliente" }), ...painel.clientes.map((c) => el("option", { value: c.nome, text: `${c.nome} (${c.loja.split(",")[0]})` })));
  selSku.replaceChildren(el("option", { value: "", text: "Sortear produtos" }), ...painel.produtos.map((p) => el("option", { value: p.sku, text: p.nome })));

  if (!form.dataset.ligado) {
    form.addEventListener("submit", executar);
    form.dataset.ligado = "1";
  }
  desenharLista();
  desenharCanvas();
}
