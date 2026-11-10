// Lista as demos da pasta demos/, organizadas por país: demos/<pais>/<demo>/.
//
// Dois tipos de demo:
// - com sistema: tem frontend/ (o que o navegador vê) e, se gravar algo, backend/ (rotas da API)
// - site estático: só arquivos (index.html, img/...), entregues como estão
//
// demos/shared/ não é país: guarda o que todas as demos com sistema usam.

import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";

async function ehPasta(caminho) {
  try {
    return (await stat(caminho)).isDirectory();
  } catch {
    return false;
  }
}

export async function listarDemos(raiz) {
  const pastaDemos = join(raiz, "demos");
  const demos = [];
  for (const pais of (await readdir(pastaDemos)).sort()) {
    if (pais === "shared" || pais.startsWith(".") || !(await ehPasta(join(pastaDemos, pais)))) continue;
    for (const nome of (await readdir(join(pastaDemos, pais))).sort()) {
      const pasta = join(pastaDemos, pais, nome);
      if (nome.startsWith(".") || !(await ehPasta(pasta))) continue;
      const temFrontend = await ehPasta(join(pasta, "frontend"));
      demos.push({
        pais,
        nome,
        id: `${pais}/${nome}`, // também é o caminho na URL: /demos/<id>/ e /api/<id>/
        pasta,
        publica: temFrontend ? join(pasta, "frontend") : pasta,
        backend: temFrontend && (await ehPasta(join(pasta, "backend"))) ? join(pasta, "backend") : null,
      });
    }
  }
  return demos;
}

// Antes de separar por país as demos ficavam em /demos/<demo>/. Links antigos já enviados
// continuam funcionando: /demos/<demo>/... redireciona para /demos/brasil/<demo>/...
export const PAIS_DAS_URLS_ANTIGAS = "brasil";
