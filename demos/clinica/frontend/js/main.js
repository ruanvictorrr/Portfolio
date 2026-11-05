// Comportamentos do site da clínica, usados em todas as páginas:
// menu no celular, busca de convênios e o formulário de agendamento.
// Cada parte só liga se o elemento dela existir na página atual.

import { apiFetch } from "../../shared/js/api.js";

const API = "/api/clinica";

async function chamar(caminho, opcoes = {}) {
  let res;
  try {
    res = await apiFetch(API + caminho, {
      headers: { "Content-Type": "application/json" },
      ...opcoes,
      body: opcoes.body ? JSON.stringify(opcoes.body) : undefined,
    });
  } catch {
    throw Object.assign(new Error("Sem conexão. Tente de novo ou chame no WhatsApp."), { detalhes: {} });
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.erro || "Algo deu errado."), { detalhes: data.detalhes || {} });
  return data;
}

function el(tag, props = {}, ...filhos) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "class") n.className = v;
    else if (k === "text") n.textContent = v;
    else if (v !== false && v != null) n.setAttribute(k, v === true ? "" : v);
  }
  n.append(...filhos.filter(Boolean));
  return n;
}

// ---------- Menu no celular ----------
const toggle = document.querySelector(".menu-toggle");
const menu = document.getElementById("menu");
if (toggle && menu) {
  toggle.addEventListener("click", () => {
    const aberto = menu.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(aberto));
    toggle.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
  });
}

// ---------- Convênios ----------
const busca = document.getElementById("busca-convenio");
const planos = document.getElementById("planos");
if (busca && planos) {
  let pedido = 0;
  const carregar = async () => {
    const id = ++pedido;
    try {
      const { itens } = await chamar(`/convenios?busca=${encodeURIComponent(busca.value.trim())}`);
      if (id !== pedido) return;
      planos.replaceChildren(...(itens.length
        ? itens.map((c) => el("li", { class: "plan" },
            el("i", { class: "ph-fill ph-shield-check", "aria-hidden": "true" }),
            el("div", {}, el("strong", { text: c.nome }), el("small", { text: c.tipo }))))
        : [el("li", { class: "plans__empty", text: "Não atendemos esse plano, mas fazemos particular com preço fechado na avaliação." })]));
    } catch (err) {
      planos.replaceChildren(el("li", { class: "plans__empty", text: err.message }));
    }
  };
  let t;
  busca.addEventListener("input", () => { clearTimeout(t); t = setTimeout(carregar, 180); });
  carregar();
}

// ---------- Agendamento ----------
const form = document.getElementById("agendar");
if (form) {
  const status = document.getElementById("agendar-status");
  const botao = document.getElementById("agendar-btn");

  const mascara = (v) => {
    const n = v.replace(/\D/g, "").slice(0, 11);
    if (n.length <= 2) return n.length ? `(${n}` : "";
    if (n.length <= 6) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
    if (n.length <= 10) return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`;
    return `(${n.slice(0, 2)}) ${n.slice(2, 3)} ${n.slice(3, 7)}-${n.slice(7)}`;
  };
  form.telefone.addEventListener("input", () => { form.telefone.value = mascara(form.telefone.value); });

  const mostrarErros = (erros = {}) => {
    form.querySelectorAll("[data-error-for]").forEach((p) => {
      const msg = erros[p.dataset.errorFor];
      p.hidden = !msg;
      p.textContent = msg || "";
      p.closest(".field").classList.toggle("has-error", Boolean(msg));
    });
  };

  // Tratamentos e períodos vêm da API; ?tratamento=implante já deixa escolhido
  chamar("/info").then((info) => {
    const escolhido = new URLSearchParams(location.search).get("tratamento") || "";
    form.tratamento.replaceChildren(
      el("option", { value: "", text: "Escolha" }),
      ...info.tratamentos.map((t) => el("option", { value: t.id, text: t.nome, selected: t.id === escolhido }))
    );
    document.getElementById("periodos").replaceChildren(...info.periodos.map((p) =>
      el("label", {}, el("input", { type: "radio", name: "periodo", value: p }), el("span", { text: p }))));
  }).catch((err) => { status.textContent = err.message; });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.textContent = "";
    mostrarErros({});
    botao.disabled = true;
    botao.textContent = "Enviando...";
    try {
      const r = await chamar("/agendamentos", {
        method: "POST",
        body: {
          nome: form.nome.value, telefone: form.telefone.value, tratamento: form.tratamento.value,
          periodo: form.periodo?.value || "", mensagem: form.mensagem.value, consentimento: form.consentimento.checked,
        },
      });
      document.getElementById("ok-texto").textContent = r.mensagem;
      document.getElementById("ok-protocolo").textContent = `#${r.protocolo}`;
      form.hidden = true;
      const ok = document.getElementById("agendar-ok");
      ok.hidden = false;
      ok.focus();
    } catch (err) {
      mostrarErros(err.detalhes);
      status.textContent = err.message;
    } finally {
      botao.disabled = false;
      botao.textContent = "Pedir agendamento";
    }
  });
}
