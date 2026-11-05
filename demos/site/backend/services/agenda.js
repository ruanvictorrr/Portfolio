// Regras de horário do restaurante: aberto agora, horários livres para reserva.
// Tudo calculado no fuso de Recife, independente de onde o servidor estiver.

const TZ = "America/Recife";

const toMin = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
const toHHMM = (min) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

// Data e hora atuais em Recife: { data: "2026-11-04", diaSemana: 3, minutos: 812 }
export function agoraRecife(date = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23", weekday: "short",
    }).formatToParts(date).map((p) => [p.type, p.value])
  );
  const dias = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return {
    data: `${parts.year}-${parts.month}-${parts.day}`,
    diaSemana: dias[parts.weekday],
    minutos: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

export function diaDaSemana(dataISO) {
  const [y, m, d] = dataISO.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function statusAgora(horarios, agora = agoraRecife()) {
  const turnosHoje = horarios[agora.diaSemana] || [];
  for (const [ini, fim] of turnosHoje) {
    if (agora.minutos >= toMin(ini) && agora.minutos < toMin(fim)) {
      return { aberto: true, texto: `Aberto agora, até ${fim.replace(":00", "h")}` };
    }
  }
  const proximo = turnosHoje.find(([ini]) => toMin(ini) > agora.minutos);
  if (proximo) return { aberto: false, texto: `Fechado agora, abre às ${proximo[0].replace(":00", "h")}` };

  for (let i = 1; i <= 7; i++) {
    const dia = (agora.diaSemana + i) % 7;
    const turnos = horarios[dia] || [];
    if (turnos.length) {
      const nomes = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
      const quando = i === 1 ? "amanhã" : nomes[dia];
      return { aberto: false, texto: `Fechado agora, abre ${quando} às ${turnos[0][0].replace(":00", "h")}` };
    }
  }
  return { aberto: false, texto: "Fechado" };
}

// Horários de 30 em 30 min, até 1h antes de fechar cada turno.
export function horariosDoDia(horarios, dataISO) {
  const turnos = horarios[diaDaSemana(dataISO)] || [];
  const slots = [];
  for (const [ini, fim] of turnos) {
    for (let t = toMin(ini); t <= toMin(fim) - 60; t += 30) slots.push(toHHMM(t));
  }
  return slots;
}

export function disponibilidade({ horarios, capacidade, reservas, dataISO, pessoas }) {
  const agora = agoraRecife();
  const ocupados = {};
  for (const r of reservas) {
    if (r.data === dataISO && r.status !== "cancelada") ocupados[r.horario] = (ocupados[r.horario] || 0) + r.pessoas;
  }
  return horariosDoDia(horarios, dataISO).map((horario) => {
    const passou = dataISO === agora.data && toMin(horario) <= agora.minutos + 30;
    const restantes = capacidade - (ocupados[horario] || 0);
    return { horario, restantes: Math.max(0, restantes), disponivel: !passou && restantes >= pessoas };
  });
}
