// Tela do WhatsApp: desenha as mensagens do bot (texto, imagem, botões, lista),
// mostra "digitando..." entre elas e envia o que o cliente escreve ou clica.

import { api } from "./api.js";
import { traduzirMensagem } from "./i18n.js";
import { el, icon, textoWhatsApp, horaAgora, reduzMovimento } from "./dom.js";

const chat = document.getElementById("chat");
const form = document.getElementById("composer");
const input = document.getElementById("msg");
const enviarBtn = form.querySelector(".wa-send");
const status = document.getElementById("wa-status");
const sheet = document.getElementById("sheet");
const sheetBody = document.getElementById("sheet-body");
const sheetTitle = document.getElementById("sheet-title");

let conversa = null;
let ocupado = false;
let aoResponder = () => {};

const espera = (ms) => new Promise((r) => setTimeout(r, reduzMovimento ? 0 : ms));
const rolar = () => { chat.scrollTop = chat.scrollHeight; };

function meta(saida) {
  return el("span", { class: "bubble__meta" }, horaAgora(), saida ? icon("checks") : null);
}

function bolha(lado, ...conteudo) {
  return el("div", { class: "bubble" }, ...conteudo, meta(lado === "out"));
}

function desativarAcoesAnteriores() {
  chat.querySelectorAll(".wa-btn:not(:disabled)").forEach((b) => { b.disabled = true; });
}

function renderMensagem(original) {
  // já traduzida aqui; translate="no" evita que o tradutor da página mexa de novo
  const m = traduzirMensagem(original);
  const no = desenhar(m);
  no.setAttribute("translate", "no");
  return no;
}

function desenhar(m) {
  switch (m.tipo) {
    case "imagem":
      return el("div", { class: "msg msg--in" },
        bolha("in", el("img", { src: m.url, alt: m.legenda || "", width: 300, height: 300, loading: "lazy" }), m.legenda ? textoWhatsApp(m.legenda) : null));
    case "botoes":
      return el("div", { class: "msg msg--in" },
        bolha("in", textoWhatsApp(m.texto)),
        el("div", { class: "wa-actions" }, ...m.botoes.map((b) =>
          el("button", { type: "button", class: "wa-btn", text: b.titulo, onclick: () => enviar({ id: b.id, texto: b.titulo }) }))));
    case "lista":
      return el("div", { class: "msg msg--in msg--list" },
        bolha("in", textoWhatsApp(m.texto)),
        el("button", { type: "button", class: "wa-btn", onclick: () => abrirLista(m) }, icon("list-bullets"), m.botao));
    default:
      return el("div", { class: "msg msg--in" }, bolha("in", textoWhatsApp(m.texto)));
  }
}

function abrirLista(m) {
  sheetTitle.textContent = m.botao; // m já veio traduzida
  sheetTitle.setAttribute("translate", "no");
  sheetBody.setAttribute("translate", "no");
  sheetBody.replaceChildren(...m.secoes.flatMap((s) => [
    el("p", { class: "sheet__section", text: s.titulo }),
    ...s.linhas.map((l) => el("button", {
      type: "button", class: "sheet__row",
      onclick: () => { fecharLista(); enviar({ id: l.id, texto: l.titulo }); },
    }, el("span", {}, el("strong", { text: l.titulo }), l.descricao ? el("small", { text: l.descricao }) : null), el("span", { class: "sheet__radio", "aria-hidden": "true" }))),
  ]));
  sheet.hidden = false;
  sheetBody.querySelector("button")?.focus();
}

function fecharLista() {
  sheet.hidden = true;
  input.focus({ preventScroll: true });
}

async function mostrarRespostas(mensagens) {
  for (const m of mensagens) {
    status.textContent = "digitando...";
    status.classList.add("is-typing");
    const digitando = el("div", { class: "typing", "aria-hidden": "true" }, el("span"), el("span"), el("span"));
    chat.append(digitando);
    rolar();
    const tamanho = (m.texto || m.legenda || "").length;
    await espera(Math.min(1300, 450 + tamanho * 6));
    digitando.remove();
    chat.append(renderMensagem(m));
    rolar();
  }
  status.textContent = "online";
  status.classList.remove("is-typing");
}

function travar(sim) {
  ocupado = sim;
  input.disabled = sim;
  enviarBtn.disabled = sim;
  document.querySelectorAll("#suggestions .chip").forEach((c) => { c.disabled = sim; });
}

export async function enviar({ id, texto }) {
  if (ocupado || !conversa || !(texto || "").trim()) return;
  desativarAcoesAnteriores();
  chat.append(el("div", { class: "msg msg--out", translate: "no" }, bolha("out", document.createTextNode(texto))));
  rolar();
  travar(true);
  try {
    const { mensagens } = await api.enviar(conversa, id ? { id, texto } : { texto });
    await mostrarRespostas(mensagens);
    aoResponder();
  } catch (err) {
    if (err.status === 404) await abrirConversa();
    else chat.append(el("p", { class: "wa-notice", text: err.message }));
  } finally {
    travar(false);
    if (matchMedia("(hover: hover)").matches) input.focus({ preventScroll: true });
  }
}

export async function abrirConversa() {
  chat.querySelectorAll(".msg, .typing").forEach((n) => n.remove());
  travar(true);
  try {
    const r = await api.abrir();
    conversa = r.conversa;
    await mostrarRespostas(r.mensagens);
    aoResponder();
  } catch (err) {
    chat.append(el("p", { class: "wa-notice", text: err.message }));
  } finally {
    travar(false);
  }
}

export function iniciarChat(callback) {
  aoResponder = callback;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const texto = input.value;
    input.value = "";
    enviar({ texto });
  });
  sheet.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) fecharLista(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !sheet.hidden) fecharLista(); });
  document.querySelectorAll("#suggestions .chip").forEach((c) => c.addEventListener("click", () => enviar({ texto: c.textContent })));
  document.getElementById("restart").addEventListener("click", abrirConversa);
  abrirConversa();
}
