// O que as rotas das demos recebem quando rodam no Node:
// leitura dos dados fixos e "bancos" gravados em arquivo JSON.
// (No navegador, demos/shared/js/plataforma-navegador.js oferece a mesma coisa com localStorage.)

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createStore } from "./json-store.js";

export function plataformaNode(pastaDados) {
  return {
    lerDados: async (arquivo) => JSON.parse(await readFile(join(pastaDados, arquivo), "utf8")),
    criarStore: (nome) => createStore(join(pastaDados, `${nome}.seed.json`), join(pastaDados, `${nome}.db.json`)),
  };
}
