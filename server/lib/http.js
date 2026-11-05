// Utilitários de requisição e resposta HTTP usados por todas as rotas.

export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload),
    "Cache-Control": "no-store",
  });
  res.end(payload);
}

const MAX_BODY = 64 * 1024; // 64 KB é mais que suficiente para os formulários das demos

export function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(new HttpError(413, "Requisição grande demais."));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      if (!chunks.length) return resolve({});
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch {
        reject(new HttpError(400, "JSON inválido."));
      }
    });
    req.on("error", reject);
  });
}

// Pequeno atraso para o front mostrar os estados de carregamento como numa API real.
export const latency = (ms = 250) => new Promise((r) => setTimeout(r, ms + Math.random() * ms));

// Para responder com outro status além de 200: return withStatus(201, { ... })
const RESPONSE = Symbol("response");
export const withStatus = (status, body) => ({ [RESPONSE]: true, status, body });
export const isWithStatus = (v) => Boolean(v && v[RESPONSE]);
