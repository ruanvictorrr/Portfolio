// Cliente da API do restaurante. Erros viram ApiError com a mensagem e os campos inválidos.

import { apiFetch } from "../../shared/js/api.js";

const BASE = "/api/site";

export class ApiError extends Error {
  constructor(message, status, detalhes) {
    super(message);
    this.status = status;
    this.detalhes = detalhes || {};
  }
}

async function request(path, options = {}) {
  let res;
  try {
    res = await apiFetch(BASE + path, {
      headers: { "Content-Type": "application/json" },
      ...options,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError("Sem conexão com o servidor. Tente de novo.", 0);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.erro || "Algo deu errado.", res.status, data.detalhes);
  return data;
}

export const api = {
  info: () => request("/info"),
  cardapio: (categoria, busca) => request(`/cardapio?${new URLSearchParams({ categoria, busca })}`),
  avaliacoes: () => request("/avaliacoes"),
  disponibilidade: (data, pessoas) => request(`/disponibilidade?${new URLSearchParams({ data, pessoas })}`),
  reservar: (dados) => request("/reservas", { method: "POST", body: dados }),
};
