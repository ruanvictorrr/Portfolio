// Ponto de entrada da página: status de aberto/fechado, horários, avaliações e animações.

import { api } from "./api.js";
import { DIAS, el } from "./format.js";
import { iniciarCardapio } from "./cardapio.js";
import { iniciarReserva } from "./reserva.js";

async function iniciarInfo() {
  const status = document.getElementById("status");
  try {
    const info = await api.info();
    status.classList.add(info.status.aberto ? "is-open" : "is-closed");
    status.querySelector(".status__text").textContent = info.status.texto;
    status.title = info.status.texto;

    document.getElementById("visit-address").textContent = info.endereco;
    document.getElementById("visit-route").href =
      `https://www.openstreetmap.org/directions?to=${info.mapa.lat}%2C${info.mapa.lng}`;
    document.getElementById("footer-contact").textContent = `${info.telefone} | ${info.instagram}`;

    // Lista de segunda a domingo, com o dia de hoje destacado
    const ordem = [1, 2, 3, 4, 5, 6, 0];
    document.getElementById("hours").replaceChildren(...ordem.flatMap((d) => {
      const turnos = info.horarios[d];
      const cls = d === info.hoje ? "is-today" : "";
      return [
        el("dt", { class: cls, text: d === info.hoje ? `${DIAS[d]} (hoje)` : DIAS[d] }),
        el("dd", { class: cls, text: turnos.length ? turnos.map(([a, b]) => `${a} às ${b}`).join(" e ") : "Fechado" }),
      ];
    }));
  } catch {
    status.querySelector(".status__text").textContent = "Horário indisponível";
  }
}

async function iniciarAvaliacoes() {
  const texto = document.getElementById("review-text");
  const quem = document.getElementById("review-who");
  let i = 0;
  let lista = [];
  const mostrar = () => {
    const a = lista[i];
    texto.classList.add("is-swapping");
    setTimeout(() => {
      texto.textContent = `“${a.texto}”`;
      quem.replaceChildren(el("strong", { text: a.nome }), ` via ${a.origem}, nota ${a.nota} de 5`);
      texto.classList.remove("is-swapping");
    }, 180);
  };
  try {
    ({ avaliacoes: lista } = await api.avaliacoes());
    mostrar();
    document.getElementById("review-prev").onclick = () => { i = (i - 1 + lista.length) % lista.length; mostrar(); };
    document.getElementById("review-next").onclick = () => { i = (i + 1) % lista.length; mostrar(); };
  } catch {
    document.getElementById("reviews").hidden = true;
  }
}

function iniciarRevelar() {
  const alvos = document.querySelectorAll(".menu__head, .ambience__media, .ambience__copy, .booking__intro, .booking__form, .visit__map, .visit__info");
  alvos.forEach((a) => a.classList.add("reveal"));
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
  }), { rootMargin: "0px 0px -10% 0px" });
  alvos.forEach((a) => io.observe(a));
}

iniciarInfo();
iniciarCardapio();
iniciarReserva();
iniciarAvaliacoes();
iniciarRevelar();
