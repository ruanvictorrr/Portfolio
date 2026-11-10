// Reservas de exemplo para o painel do dono não abrir vazio.
// São geradas uma vez, para hoje e os próximos 6 dias, só nos horários em que o restaurante abre.

import { agoraRecife, horariosDoDia } from "./agenda.js";

const NOMES = [
  "Joana Cavalcanti", "Edson Bezerra", "Luciana Torres", "Marcos Vinícius Lira", "Patrícia Moura",
  "Raimundo Araújo", "Gabriela Siqueira", "Fernando Amorim", "Tatiane Barros", "Severino Alves",
  "Mirela Tenório", "Carlos Henrique Brito", "Débora Lins", "Hugo Pessoa", "Aline Farias", "Valdir Correia",
];
const OBS = ["", "", "", "Aniversário, se puder trazer uma vela", "Mesa perto da janela", "Uma pessoa vegetariana", "Vamos com uma criança, precisa de cadeirão", ""];

function rng(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

function somarDias(iso, n) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return dt.toISOString().slice(0, 10);
}

export function gerarExemplos(horarios, proximoCodigo) {
  const r = rng(4711);
  const hoje = agoraRecife().data;
  const lista = [];
  let codigo = proximoCodigo;
  for (let dia = 0; dia < 7; dia++) {
    const data = somarDias(hoje, dia);
    const slots = horariosDoDia(horarios, data);
    if (!slots.length) continue;
    const quantas = 3 + Math.floor(r() * 5);
    for (let i = 0; i < quantas; i++) {
      const horario = slots[Math.floor(r() * slots.length)];
      const telefone = `8199${String(Math.floor(1000000 + r() * 8999999))}`;
      lista.push({
        codigo: codigo++,
        nome: NOMES[Math.floor(r() * NOMES.length)],
        telefone,
        pessoas: 2 + Math.floor(r() * 5),
        data,
        horario,
        observacao: OBS[Math.floor(r() * OBS.length)],
        status: "confirmada",
        origem: r() > 0.3 ? "site" : "telefone",
        criadaEm: new Date().toISOString(),
      });
    }
  }
  lista.sort((a, b) => (a.data + a.horario).localeCompare(b.data + b.horario));
  return { reservas: lista, proximoCodigo: codigo };
}
