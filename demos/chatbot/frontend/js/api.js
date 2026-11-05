// Cliente da API do ChatBot.

const BASE = "/api/chatbot";

async function request(path, { method = "GET", body } = {}) {
  let res;
  try {
    res = await fetch(BASE + path, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new Error("Sem conexão com o servidor.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.erro || "Algo deu errado."), { status: res.status });
  return data;
}

export const api = {
  abrir: () => request("/conversas", { method: "POST" }),
  enviar: (conversa, entrada) => request(`/conversas/${conversa}/mensagens`, { method: "POST", body: entrada }),
  pedidos: () => request("/pedidos"),
  painel: () => request("/painel"),
};
