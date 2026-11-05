// Partes de HTTP que não dependem do Node: rodam no servidor e no navegador
// (no GitHub Pages as rotas das demos rodam dentro do navegador).

export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// Para responder com outro status além de 200: return withStatus(201, { ... })
const RESPONSE = Symbol("response");
export const withStatus = (status, body) => ({ [RESPONSE]: true, status, body });
export const isWithStatus = (v) => Boolean(v && v[RESPONSE]);

// Pequeno atraso para o front mostrar os estados de carregamento como numa API real.
export const latency = (ms = 250) => new Promise((r) => setTimeout(r, ms + Math.random() * ms));
