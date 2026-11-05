// Utilitários HTTP do servidor Node (ler o corpo e responder JSON).
// As partes que também rodam no navegador ficam em http-core.js.

import { HttpError } from "./http-core.js";

export { HttpError, withStatus, isWithStatus, latency } from "./http-core.js";

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
