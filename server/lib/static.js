// Entrega de arquivos estáticos (HTML, CSS, JS, imagens) com proteção contra "../".

import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { join, normalize, extname, sep } from "node:path";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

export async function serveStatic(res, root, relPath) {
  const safe = normalize(decodeURIComponent(relPath)).replace(/^([/\\])+/, "");
  let file = join(root, safe);
  if (!file.startsWith(root + sep) && file !== root) return false;

  try {
    let info = await stat(file);
    if (info.isDirectory()) {
      file = join(file, "index.html");
      info = await stat(file);
    }
    // "no-cache" + Last-Modified: o navegador guarda o arquivo, mas sempre confere se ele mudou.
    // Assim uma imagem trocada aparece no próximo carregamento, sem precisar limpar o cache.
    const modificado = info.mtime.toUTCString();
    const headers = {
      "Content-Type": MIME[extname(file).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-cache",
      "Last-Modified": modificado,
    };
    const desde = res.req?.headers["if-modified-since"];
    if (desde && Math.floor(info.mtimeMs / 1000) <= Math.floor(Date.parse(desde) / 1000)) {
      res.writeHead(304, headers);
      res.end();
      return true;
    }
    res.writeHead(200, { ...headers, "Content-Length": info.size });
    createReadStream(file).pipe(res);
    return true;
  } catch {
    return false;
  }
}
