// Reserva de mesa: carrega horários livres do dia, valida e envia para a API.

import { api } from "./api.js";
import { dataLonga, hojeISO, mascaraTelefone, el } from "./format.js";

const form = document.getElementById("booking-form");
const slotsBox = document.getElementById("slots");
const statusMsg = document.getElementById("booking-status");
const submit = document.getElementById("booking-submit");
const done = document.getElementById("booking-done");

let horarioEscolhido = null;
let pedidoSlots = 0;

function mostrarErros(erros = {}) {
  form.querySelectorAll("[data-error-for]").forEach((p) => {
    const msg = erros[p.dataset.errorFor];
    p.hidden = !msg;
    p.textContent = msg || "";
    p.closest(".field").classList.toggle("has-error", Boolean(msg));
  });
}

async function carregarHorarios() {
  const id = ++pedidoSlots;
  const data = form.data.value;
  const pessoas = Number(form.pessoas.value) || 1;
  if (!data) return;
  slotsBox.replaceChildren(...Array.from({ length: 8 }, () => el("span", { class: "slot slot--skeleton", "aria-hidden": "true" })));
  try {
    const res = await api.disponibilidade(data, pessoas);
    if (id !== pedidoSlots) return;
    if (res.fechado) {
      horarioEscolhido = null;
      slotsBox.replaceChildren(el("p", { class: "slots__msg" }, el("i", { class: "ph ph-moon", "aria-hidden": "true" }), "Não abrimos nesse dia. Escolha outra data."));
      return;
    }
    const livres = res.horarios.filter((h) => h.disponivel);
    if (!livres.some((h) => h.horario === horarioEscolhido)) horarioEscolhido = null;
    slotsBox.replaceChildren(
      ...res.horarios.map((h) => el("button", {
        type: "button", class: "slot", text: h.horario, disabled: !h.disponivel,
        "aria-pressed": String(h.horario === horarioEscolhido),
        "aria-label": h.disponivel ? `${h.horario}, ${h.restantes} lugares livres` : `${h.horario}, indisponível`,
        onclick: (e) => {
          horarioEscolhido = h.horario;
          slotsBox.querySelectorAll(".slot").forEach((b) => b.setAttribute("aria-pressed", String(b === e.currentTarget)));
          mostrarErros({});
        },
      })),
      livres.length ? null : el("p", { class: "slots__msg", text: "Todos os horários estão lotados para esse dia." })
    );
  } catch (err) {
    if (id === pedidoSlots) slotsBox.replaceChildren(el("p", { class: "slots__msg", text: err.message }));
  }
}

function validarLocal() {
  const erros = {};
  if (form.nome.value.trim().length < 3) erros.nome = "Informe seu nome completo.";
  const tel = form.telefone.value.replace(/\D/g, "");
  if (tel.length < 10) erros.telefone = "Informe um WhatsApp com DDD.";
  if (!form.data.value) erros.data = "Escolha uma data.";
  if (!horarioEscolhido) erros.horario = "Escolha um horário.";
  return erros;
}

async function enviar(e) {
  e.preventDefault();
  statusMsg.textContent = "";
  const erros = validarLocal();
  mostrarErros(erros);
  if (Object.keys(erros).length) {
    statusMsg.textContent = "Confira os campos destacados.";
    return;
  }
  submit.disabled = true;
  submit.textContent = "Confirmando...";
  try {
    const { reserva, whatsappUrl } = await api.reservar({
      nome: form.nome.value, telefone: form.telefone.value, data: form.data.value,
      horario: horarioEscolhido, pessoas: Number(form.pessoas.value), observacao: form.observacao.value,
    });
    document.getElementById("done-code").textContent = `#${reserva.codigo}`;
    document.getElementById("done-summary").textContent =
      `${reserva.nome.split(" ")[0]}, sua mesa para ${reserva.pessoas} ${reserva.pessoas > 1 ? "pessoas" : "pessoa"} está guardada para ${dataLonga(reserva.data)}, às ${reserva.horario}.`;
    document.getElementById("done-whats").href = whatsappUrl;
    form.hidden = true;
    done.hidden = false;
    done.focus();
  } catch (err) {
    mostrarErros(err.detalhes);
    statusMsg.textContent = err.message;
    if (err.status === 409) carregarHorarios();
  } finally {
    submit.disabled = false;
    submit.textContent = "Confirmar reserva";
  }
}

export function iniciarReserva() {
  form.data.min = hojeISO();
  form.data.value = hojeISO();

  form.querySelectorAll("[data-step]").forEach((b) => b.addEventListener("click", () => {
    const n = Math.min(12, Math.max(1, (Number(form.pessoas.value) || 1) + Number(b.dataset.step)));
    form.pessoas.value = n;
    carregarHorarios();
  }));
  form.pessoas.addEventListener("change", carregarHorarios);
  form.data.addEventListener("change", carregarHorarios);
  form.telefone.addEventListener("input", () => { form.telefone.value = mascaraTelefone(form.telefone.value); });
  form.addEventListener("submit", enviar);

  document.getElementById("done-new").addEventListener("click", () => {
    form.reset();
    form.data.value = hojeISO();
    horarioEscolhido = null;
    done.hidden = true;
    form.hidden = false;
    carregarHorarios();
  });

  carregarHorarios();
}
