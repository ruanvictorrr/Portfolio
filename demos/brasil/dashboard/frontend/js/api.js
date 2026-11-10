// Cliente da API do dashboard.

import { apiFetch } from "../../../shared/js/api.js";

const BASE = "/api/brasil/dashboard";

async function request(path, { method = "GET", body } = {}) {
  let res;
  try {
    res = await apiFetch(BASE + path, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new Error("Sem conexão com o servidor.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.erro || "Algo deu errado.");
  return data;
}

export const api = {
  resumo: (periodo, categoria) => request(`/resumo?${new URLSearchParams({ periodo, categoria })}`),
  estoque: (status, busca) => request(`/estoque?${new URLSearchParams({ status, busca })}`),
  repor: (id, quantidade) => request(`/estoque/${id}/repor`, { method: "POST", body: { quantidade } }),
  reiniciar: () => request("/reiniciar", { method: "POST" }),
};
