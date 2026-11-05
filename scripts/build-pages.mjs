// Monta a versão estática do site em _site/ para o GitHub Pages.
//
//   _site/                         <- portfolio/
//   _site/demos/shared/            <- demos/shared/
//   _site/demos/<demo>/            <- demos/<demo>/frontend/
//   _site/_api/server/lib/         <- núcleo do roteador (router.js, http-core.js)
//   _site/_api/demos/<demo>/backend <- rotas, serviços e dados de cada demo
//
// No Pages não existe servidor: demos/shared/js/api.js carrega as rotas de _api/
// e roda tudo no navegador. Rodar: npm run build:pages

import { cp, mkdir, rm, writeFile, readdir, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const SAIDA = join(RAIZ, "_site");
const semLixo = (origem) => !origem.endsWith(".db.json") && !origem.endsWith(".DS_Store");

await rm(SAIDA, { recursive: true, force: true });
await mkdir(SAIDA, { recursive: true });

await cp(join(RAIZ, "portfolio"), SAIDA, { recursive: true, filter: semLixo });
await cp(join(RAIZ, "demos/shared"), join(SAIDA, "demos/shared"), { recursive: true, filter: semLixo });

const demos = [];
for (const nome of await readdir(join(RAIZ, "demos"))) {
  const pasta = join(RAIZ, "demos", nome);
  if (nome === "shared" || !(await stat(pasta)).isDirectory()) continue;
  await cp(join(pasta, "frontend"), join(SAIDA, "demos", nome), { recursive: true, filter: semLixo });
  await cp(join(pasta, "backend"), join(SAIDA, "_api/demos", nome, "backend"), { recursive: true, filter: semLixo });
  demos.push(nome);
}

await mkdir(join(SAIDA, "_api/server/lib"), { recursive: true });
for (const arquivo of ["router.js", "http-core.js"]) {
  await cp(join(RAIZ, "server/lib", arquivo), join(SAIDA, "_api/server/lib", arquivo));
}

// Sem isso o GitHub Pages (Jekyll) ignora pastas que começam com "_", como _api/
await writeFile(join(SAIDA, ".nojekyll"), "");

console.log(`_site/ pronto: portfólio + ${demos.length} demos (${demos.join(", ")}).`);
