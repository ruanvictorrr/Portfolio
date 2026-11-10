// Monta a versão estática do site em _site/ para o GitHub Pages.
//
//   _site/                                 <- portfolio/
//   _site/demos/shared/                    <- demos/shared/
//   _site/demos/<pais>/<demo>/             <- demos/<pais>/<demo>/frontend/ (ou a pasta toda, se for site estático)
//   _site/_api/server/lib/                 <- núcleo do roteador (router.js, http-core.js)
//   _site/_api/demos/<pais>/<demo>/backend <- rotas, serviços e dados de cada demo com sistema
//   _site/demos/<demo>/                    <- só redireciona os links antigos para demos/brasil/<demo>/
//
// No Pages não existe servidor: demos/shared/js/api.js carrega as rotas de _api/
// e roda tudo no navegador. Rodar: npm run build:pages

import { cp, mkdir, rm, writeFile, readFile, readdir, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";
import { listarDemos, PAIS_DAS_URLS_ANTIGAS } from "../server/lib/demos.js";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const SAIDA = join(RAIZ, "_site");
const semLixo = (origem) => !origem.endsWith(".db.json") && !origem.endsWith(".DS_Store");

await rm(SAIDA, { recursive: true, force: true });
await mkdir(SAIDA, { recursive: true });

await cp(join(RAIZ, "portfolio"), SAIDA, { recursive: true, filter: semLixo });
await cp(join(RAIZ, "demos/shared"), join(SAIDA, "demos/shared"), { recursive: true, filter: semLixo });

const demos = await listarDemos(RAIZ);
for (const demo of demos) {
  await cp(demo.publica, join(SAIDA, "demos", demo.id), { recursive: true, filter: semLixo });
  if (demo.backend) {
    await cp(demo.backend, join(SAIDA, "_api/demos", demo.id, "backend"), { recursive: true, filter: semLixo });
  }
}

// Links antigos (/demos/<demo>/...) de antes da separação por país: uma página que
// redireciona para /demos/brasil/<demo>/... mantendo ?lang=... e #âncora.
async function paginasHtml(pasta) {
  const achadas = [];
  for (const nome of await readdir(pasta)) {
    const caminho = join(pasta, nome);
    if ((await stat(caminho)).isDirectory()) achadas.push(...(await paginasHtml(caminho)));
    else if (nome === "index.html") achadas.push(caminho);
  }
  return achadas;
}
// relativo: caminho da página nova a partir da antiga (para quem está sem JavaScript)
const redirecionar = (antigo, novo, relativo) => `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="robots" content="noindex">
<title>Redirecionando…</title>
<script>location.replace(location.href.replace(${JSON.stringify(antigo)}, ${JSON.stringify(novo)}));</script>
<noscript><meta http-equiv="refresh" content="0; url=${relativo}"></noscript>
</head>
<body><a href="${relativo}">Abrir a demonstração</a></body>
</html>
`;
for (const demo of demos.filter((d) => d.pais === PAIS_DAS_URLS_ANTIGAS && d.backend)) {
  for (const pagina of await paginasHtml(demo.publica)) {
    const sub = relative(demo.publica, dirname(pagina)).split("\\").join("/");
    const pastaSub = sub ? `${sub}/` : "";
    // De /demos/<demo>/<sub>/ até /demos/brasil/<demo>/<sub>/: sobe as pastas de <sub> e a da demo
    const relativo = "../".repeat(sub ? sub.split("/").length + 1 : 1) + `${demo.id}/${pastaSub}`;
    const destino = join(SAIDA, "demos", demo.nome, pastaSub, "index.html");
    await mkdir(dirname(destino), { recursive: true });
    await writeFile(destino, redirecionar(`/demos/${demo.nome}/`, `/demos/${demo.id}/`, relativo));
  }
}

await mkdir(join(SAIDA, "_api/server/lib"), { recursive: true });
for (const arquivo of ["router.js", "http-core.js"]) {
  await cp(join(RAIZ, "server/lib", arquivo), join(SAIDA, "_api/server/lib", arquivo));
}

// O Pages manda o navegador guardar CSS/JS por 10 min. Sem versão no link, logo depois de
// um deploy o HTML novo chegava com o CSS antigo (ex.: botão de idioma sem estilo).
// Acrescenta ?v=<commit> aos .css/.js locais citados em cada HTML.
const VERSAO = (process.env.GITHUB_SHA || Date.now().toString(36)).slice(0, 8);
async function versionar(pasta) {
  for (const nome of await readdir(pasta)) {
    const caminho = join(pasta, nome);
    if ((await stat(caminho)).isDirectory()) { await versionar(caminho); continue; }
    if (!nome.endsWith(".html")) continue;
    const html = await readFile(caminho, "utf8");
    await writeFile(caminho, html.replace(/((?:href|src)="(?!https?:|\/\/)[^"?#]+\.(?:css|js))"/g, `$1?v=${VERSAO}"`));
  }
}
await versionar(SAIDA);

// Sem isso o GitHub Pages (Jekyll) ignora pastas que começam com "_", como _api/
await writeFile(join(SAIDA, ".nojekyll"), "");

const contagem = {};
for (const demo of demos) contagem[demo.pais] = (contagem[demo.pais] || 0) + 1;
const porPais = Object.entries(contagem).map(([pais, total]) => `${pais}: ${total}`);
console.log(`_site/ pronto: portfólio + ${demos.length} demos (${porPais.join(", ")}).`);
