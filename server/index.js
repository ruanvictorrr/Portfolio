// Servidor do portfólio. Sem dependências: só Node.
//
//   /                      -> portfolio/
//   /demos/shared/...      -> demos/shared/
//   /demos/<demo>/...      -> demos/<demo>/frontend/
//   /api/<demo>/...        -> rotas de demos/<demo>/backend/routes.js
//
// Rodar: npm start   (porta 4321, ou PORT=xxxx npm start)

import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createRouter } from "./lib/router.js";
import { serveStatic } from "./lib/static.js";
import { sendJson, HttpError, isWithStatus } from "./lib/http.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.PORT) || 4321;
const DEMOS = ["site", "clinica", "automacao", "chatbot", "dashboard"];

// Cada demo registra suas rotas no próprio roteador.
const apis = {};
for (const demo of DEMOS) {
  const router = createRouter();
  try {
    const { default: register } = await import(`../demos/${demo}/backend/routes.js`);
    register(router);
    apis[demo] = router;
  } catch (err) {
    if (err.code !== "ERR_MODULE_NOT_FOUND") throw err;
    console.warn(`Demo "${demo}" sem backend/routes.js, API desativada.`);
  }
}

async function handleApi(req, res, url) {
  const [, , demo, ...rest] = url.pathname.split("/"); // ["", "api", demo, ...]
  const router = apis[demo];
  if (!router) throw new HttpError(404, "API não encontrada.");

  const found = router.match(req.method, "/" + rest.join("/"));
  if (!found) throw new HttpError(404, "Rota não encontrada.");
  if (found.methodNotAllowed) throw new HttpError(405, "Método não permitido.");

  const result = await found.handler({ req, res, params: found.params, query: url.searchParams });
  if (res.writableEnded) return;
  if (isWithStatus(result)) sendJson(res, result.status, result.body);
  else sendJson(res, 200, result ?? {});
}

async function handleStatic(req, res, url) {
  const path = url.pathname;

  // /demos/site -> /demos/site/ (para os caminhos relativos do HTML funcionarem)
  const bare = path.match(/^\/demos\/([^/]+)$/);
  if (bare) {
    res.writeHead(301, { Location: path + "/" });
    return res.end();
  }

  let served = false;
  if (path.startsWith("/demos/shared/")) {
    served = await serveStatic(res, join(ROOT, "demos/shared"), path.slice("/demos/shared/".length));
  } else if (path.startsWith("/demos/")) {
    const [, , demo, ...rest] = path.split("/");
    if (DEMOS.includes(demo)) {
      served = await serveStatic(res, join(ROOT, "demos", demo, "frontend"), rest.join("/"));
    }
  } else {
    served = await serveStatic(res, join(ROOT, "portfolio"), path);
  }

  if (!served) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Página não encontrada.");
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  try {
    if (url.pathname.startsWith("/api/")) await handleApi(req, res, url);
    else await handleStatic(req, res, url);
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    if (status === 500) console.error(err);
    if (!res.headersSent) {
      sendJson(res, status, { erro: status === 500 ? "Erro interno no servidor." : err.message, detalhes: err.details });
    } else {
      res.end();
    }
  }
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`A porta ${PORT} já está em uso (o portfólio provavelmente já está rodando).`);
    console.error(`Abra http://localhost:${PORT} ou rode em outra porta: PORT=4322 npm start`);
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, () => {
  console.log(`Portfólio rodando em http://localhost:${PORT}`);
});
