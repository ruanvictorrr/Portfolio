// Cliente da API de automações.

import { apiFetch } from "../../shared/js/api.js";

const BASE = "/api/automacao";

async function request(path, { method = "GET", body } = {}) {
  let res;
  try {
    res = await apiFetch(BASE + path, {
      method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Sem conexão com o servidor.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.erro || "Algo deu errado.");
  return data;
}

export const api = {
  painel: () => request("/painel"),
  alternar: (id, ativo) => request(`/fluxos/${id}`, { method: "PATCH", body: { ativo } }),
  executar: (id, entrada) => request(`/fluxos/${id}/executar`, { method: "POST", body: entrada }),
  planilha: () => request("/planilha"),
  estoque: () => request("/estoque"),
  mensagens: () => request("/mensagens"),
  reiniciar: () => request("/reiniciar", { method: "POST" }),
};
