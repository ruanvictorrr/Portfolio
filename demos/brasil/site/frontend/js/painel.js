// Painel do dono: entrar com PIN, ver as reservas do dia, marcar chegada ou falta,
// cancelar e lançar reserva feita por telefone. Tudo gravado na API da demo.

import "./i18n.js";
import { apiFetch } from "../../../shared/js/api.js";
import { LOCALE } from "../../../shared/js/idioma.js";

import { el, mascaraTelefone, hojeISO } from "./format.js";

const API = "/api/brasil/site";
const SESSAO = "casabarro-painel";

let token = null;
try { token = sessionStorage.getItem(SESSAO); } catch { /* navegação privada */ }
let dia = hojeISO();
let pedido = 0;
let ultimoAlterado = null;

const $ = (id) => document.getElementById(id);

async function chamar(caminho, { method = "GET", body } = {}) {
  let res;
  try {
    res = await apiFetch(API + caminho, {
      method,
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw Object.assign(new Error("Sem conexão com o servidor."), { status: 0 });
  }
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && caminho !== "/painel/entrar") sair();
  if (!res.ok) throw Object.assign(new Error(data.erro || "Algo deu errado."), { status: res.status, detalhes: data.detalhes || {} });
  return data;
}

// ---------- Datas ----------
function somarDias(iso, n) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d + n);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}
const dataObj = (iso) => { const [y, m, d] = iso.split("-").map(Number); return new Date(y, m - 1, d); };
const rotuloDia = (iso) => (iso === hojeISO() ? "Hoje, " : "") + dataObj(iso).toLocaleDateString(LOCALE, { weekday: "long", day: "numeric", month: "long" });

// ---------- Entrada ----------
function mostrarApp(sim) {
  $("login").hidden = sim;
  $("app").hidden = !sim;
}

function sair() {
  token = null;
  try { sessionStorage.removeItem(SESSAO); } catch { /* ignora */ }
  mostrarApp(false);
  $("pin").value = "";
}

$("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const erro = $("pin-error");
  erro.hidden = true;
  try {
    const r = await chamar("/painel/entrar", { method: "POST", body: { pin: $("pin").value } });
    token = r.token;
    try { sessionStorage.setItem(SESSAO, token); } catch { /* ignora */ }
    mostrarApp(true);
    carregar();
  } catch (err) {
    erro.textContent = err.message;
    erro.hidden = false;
    $("pin").select();
  }
});
$("sair").addEventListener("click", sair);

// ---------- Desenho ----------
const ROTULO = { confirmada: "Confirmada", chegou: "Chegou", "nao-veio": "Não veio", cancelada: "Cancelada" };

function acoes(r) {
  const botao = (texto, status, estilo = "btn--ghost") =>
    el("button", { type: "button", class: `btn ${estilo}`, text: texto, onclick: () => mudarStatus(r.codigo, status) });
  if (r.status === "confirmada") return [botao("Chegou", "chegou", "btn--accent"), botao("Não veio", "nao-veio"), botao("Cancelar", "cancelada")];
  return [botao("Desfazer", "confirmada")];
}

function itemReserva(r) {
  const tel = r.telefone.replace(/\D/g, "");
  return el("li", { class: `res is-${r.status} ${r.codigo === ultimoAlterado ? "is-updated" : ""}` },
    el("p", { class: "res__hora", text: r.horario }),
    el("p", { class: "res__nome", text: `${r.nome}, ${r.pessoas} ${r.pessoas > 1 ? "pessoas" : "pessoa"}` }),
    el("p", { class: "res__meta" },
      el("a", { href: `https://wa.me/55${tel}`, target: "_blank", rel: "noopener" }, el("i", { class: "ph ph-whatsapp-logo", "aria-hidden": "true" }), mascaraTelefone(tel)),
      el("span", { text: `#${r.codigo}` }),
      el("span", { text: r.origem === "telefone" ? "por telefone" : "pelo site" }),
      r.status !== "confirmada" ? el("span", { class: `badge badge--${r.status}`, text: ROTULO[r.status] }) : null),
    r.observacao ? el("p", { class: "res__obs" }, el("i", { class: "ph-fill ph-note", "aria-hidden": "true" }), r.observacao) : null,
    el("div", { class: "res__acoes" }, ...acoes(r))
  );
}

function desenhar(d) {
  $("dia-label").textContent = rotuloDia(d.data);
  $("s-reservas").textContent = d.resumo.reservas;
  $("s-pessoas").textContent = d.resumo.pessoas;
  $("s-chegaram").textContent = d.resumo.chegaram;
  $("s-site").textContent = d.resumo.pelosite;

  $("semana").replaceChildren(...d.semana.map((s) => {
    const fechado = !s.reservas && dataObj(s.data).getDay() === 1;
    return el("li", {},
      el("button", {
        type: "button", class: `day ${fechado ? "day--closed" : ""}`, "aria-current": s.data === d.data ? "date" : false,
        onclick: () => { dia = s.data; carregar(); },
      },
        el("span", { class: "day__name", text: s.data === hojeISO() ? "hoje" : dataObj(s.data).toLocaleDateString(LOCALE, { weekday: "short", day: "numeric" }) }),
        el("span", { class: "day__count", text: fechado ? "Fechado" : `${s.reservas}` }),
        fechado ? null : el("span", { class: "day__people", text: `${s.pessoas} pessoas` })));
  }));

  const msg = $("lista-msg");
  if (!d.porHorario.length) msg.textContent = "O restaurante não abre neste dia.";
  else if (!d.reservas.length) msg.textContent = "Nenhuma reserva para este dia ainda.";
  else msg.textContent = "";
  $("reservas").replaceChildren(...d.reservas.map(itemReserva));

  $("ocupacao").replaceChildren(...(d.porHorario.length ? d.porHorario.map((h) => {
    const cheio = h.ocupados >= h.capacidade;
    return el("li", { class: `occ ${cheio ? "is-full" : ""}` },
      el("span", { text: h.horario }),
      el("span", { class: "occ__bar" }, el("span", { class: "occ__fill", style: `width:${(h.ocupados / h.capacidade) * 100}%` })),
      el("span", { class: "occ__num", text: cheio ? "lotado" : `${h.ocupados}/${h.capacidade}` }));
  }) : [el("li", { class: "list__msg", text: "Sem horários neste dia." })]));
}

async function carregar() {
  const id = ++pedido;
  $("main").classList.add("is-loading");
  try {
    const d = await chamar(`/painel/reservas?data=${dia}`);
    if (id !== pedido) return;
    desenhar(d);
  } catch (err) {
    if (id === pedido && err.status !== 401) $("lista-msg").textContent = err.message;
  } finally {
    if (id === pedido) $("main").classList.remove("is-loading");
  }
}

async function mudarStatus(codigo, status) {
  try {
    await chamar(`/painel/reservas/${codigo}`, { method: "PATCH", body: { status } });
    ultimoAlterado = codigo;
    await carregar();
  } catch (err) {
    $("lista-msg").textContent = err.message;
  }
}

$("dia-anterior").addEventListener("click", () => { dia = somarDias(dia, -1); carregar(); });
$("dia-seguinte").addEventListener("click", () => { dia = somarDias(dia, 1); carregar(); });
$("dia-hoje").addEventListener("click", () => { dia = hojeISO(); carregar(); });

// ---------- Nova reserva ----------
const dialogo = $("nova");
const form = $("nova-form");

async function carregarHorariosForm() {
  const sel = form.horario;
  try {
    const r = await chamar(`/disponibilidade?data=${form.data.value}&pessoas=${form.pessoas.value || 1}`);
    sel.replaceChildren(...(r.horarios.length
      ? r.horarios.map((h) => el("option", { value: h.horario, text: `${h.horario}  (${h.restantes} lugares)` }))
      : [el("option", { value: "", text: "Fechado neste dia" })]));
  } catch {
    sel.replaceChildren(el("option", { value: "", text: "Não foi possível carregar" }));
  }
}

$("abrir-nova").addEventListener("click", () => {
  form.reset();
  form.data.value = dia < hojeISO() ? hojeISO() : dia;
  form.data.min = hojeISO();
  form.querySelectorAll("[data-error-for]").forEach((p) => { p.hidden = true; });
  $("nova-status").textContent = "";
  carregarHorariosForm();
  dialogo.showModal();
  form.nome.focus();
});
dialogo.addEventListener("click", (e) => { if (e.target === dialogo || e.target.closest("[data-fechar]")) dialogo.close(); });
form.data.addEventListener("change", carregarHorariosForm);
form.pessoas.addEventListener("change", carregarHorariosForm);
form.telefone.addEventListener("input", () => { form.telefone.value = mascaraTelefone(form.telefone.value); });

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const salvar = $("nova-salvar");
  salvar.disabled = true;
  form.querySelectorAll("[data-error-for]").forEach((p) => { p.hidden = true; p.closest(".field").classList.remove("has-error"); });
  try {
    const { reserva } = await chamar("/painel/reservas", {
      method: "POST",
      body: { nome: form.nome.value, telefone: form.telefone.value, data: form.data.value, horario: form.horario.value, pessoas: Number(form.pessoas.value), observacao: form.observacao.value },
    });
    dialogo.close();
    dia = reserva.data;
    ultimoAlterado = reserva.codigo;
    carregar();
  } catch (err) {
    Object.entries(err.detalhes || {}).forEach(([campo, texto]) => {
      const p = form.querySelector(`[data-error-for="${campo}"]`);
      if (p) { p.textContent = texto; p.hidden = false; p.closest(".field").classList.add("has-error"); }
    });
    $("nova-status").textContent = err.message;
  } finally {
    salvar.disabled = false;
  }
});

// ---------- Início ----------
if (token) { mostrarApp(true); carregar(); } else { mostrarApp(false); }
