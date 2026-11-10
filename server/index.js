// Servidor do portfólio. Sem dependências: só Node.
//
//   /                             -> portfolio/
//   /demos/shared/...             -> demos/shared/
//   /demos/<pais>/<demo>/...      -> demos/<pais>/<demo>/frontend/ (ou a própria pasta, se for site estático)
//   /api/<pais>/<demo>/...        -> rotas de demos/<pais>/<demo>/backend/routes.js
//   /api/health                   -> avisa o navegador que existe servidor
//   /demos/<demo>/... (antigo)    -> redireciona para /demos/brasil/<demo>/...
//
// As rotas não dependem do Node: aqui recebem a plataforma de arquivos (server/lib/plataforma.js);
// no GitHub Pages o navegador roda as mesmas rotas com localStorage (demos/shared/js/).
//
// Rodar: npm start   (porta 4321, ou PORT=xxxx npm start)

import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createRouter } from "./lib/router.js";
import { serveStatic } from "./lib/static.js";
import { sendJson, readJson, HttpError, isWithStatus } from "./lib/http.js";
import { plataformaNode } from "./lib/plataforma.js";
import { listarDemos, PAIS_DAS_URLS_ANTIGAS } from "./lib/demos.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.PORT) || 4321;
const DEMOS = new Map((await listarDemos(ROOT)).map((demo) => [demo.id, demo]));
const PAISES = new Set([...DEMOS.values()].map((demo) => demo.pais));

// Cada demo com backend registra suas rotas no próprio roteador.
const apis = {};
for (const demo of DEMOS.values()) {
  if (!demo.backend) continue;
  const router = createRouter();
  try {
    const { default: register } = await import(`../demos/${demo.id}/backend/routes.js`);
    await register(router, plataformaNode(join(demo.backend, "data")));
    apis[demo.id] = router;
  } catch (err) {
    if (err.code !== "ERR_MODULE_NOT_FOUND") throw err;
    console.warn(`Demo "${demo.id}" sem backend/routes.js, API desativada.`);
  }
}

async function handleApi(req, res, url) {
  const [, , pais, demo, ...rest] = url.pathname.split("/"); // ["", "api", pais, demo, ...]
  if (pais === "health" && !demo) return sendJson(res, 200, { ok: true, modo: "servidor" });
  const router = apis[`${pais}/${demo}`];
  if (!router) throw new HttpError(404, "API não encontrada.");

  const found = router.match(req.method, "/" + rest.join("/"));
  if (!found) throw new HttpError(404, "Rota não encontrada.");
  if (found.methodNotAllowed) throw new HttpError(405, "Método não permitido.");

  const body = ["POST", "PUT", "PATCH", "DELETE"].includes(req.method) ? await readJson(req) : {};
  const result = await found.handler({ params: found.params, query: url.searchParams, body, headers: req.headers });
  if (res.writableEnded) return;
  if (isWithStatus(result)) sendJson(res, result.status, result.body);
  else sendJson(res, 200, result ?? {});
}

async function handleStatic(req, res, url) {
  const path = url.pathname;

  // Link antigo, de antes da separação por país: /demos/site/... -> /demos/brasil/site/...
  const antigo = path.match(/^\/demos\/([^/]+)(\/.*)?$/);
  if (antigo && !PAISES.has(antigo[1]) && antigo[1] !== "shared" && DEMOS.has(`${PAIS_DAS_URLS_ANTIGAS}/${antigo[1]}`)) {
    res.writeHead(301, { Location: `/demos/${PAIS_DAS_URLS_ANTIGAS}/${antigo[1]}${antigo[2] || "/"}${url.search}` });
    return res.end();
  }

  // /demos/brasil/site -> /demos/brasil/site/ (para os caminhos relativos do HTML funcionarem)
  if (/^\/demos\/[^/]+\/[^/]+$/.test(path)) {
    res.writeHead(301, { Location: path + "/" + url.search });
    return res.end();
  }

  let served = false;
  // /_api/: rotas e dados das demos para rodarem no navegador (como no GitHub Pages).
  // Só expõe o que o build do Pages também publica: o núcleo do roteador e a pasta backend
  // de cada demo, sem as cópias de trabalho *.db.json.
  const api = path.match(/^\/_api\/(server\/lib\/(router|http-core)\.js|demos\/([^/]+\/[^/]+)\/backend\/.+)$/);
  if (api) {
    if ((!api[3] || DEMOS.get(api[3])?.backend) && !path.endsWith(".db.json")) {
      served = await serveStatic(res, ROOT, api[1]);
    }
  } else if (path.startsWith("/demos/shared/")) {
    served = await serveStatic(res, join(ROOT, "demos/shared"), path.slice("/demos/shared/".length));
  } else if (path.startsWith("/demos/")) {
    const [, , pais, nome, ...rest] = path.split("/");
    const demo = DEMOS.get(`${pais}/${nome}`);
    if (demo) served = await serveStatic(res, demo.publica, rest.join("/"));
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
