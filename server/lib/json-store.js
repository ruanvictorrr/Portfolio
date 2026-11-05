// "Banco de dados" em arquivo JSON para as demos.
// O arquivo semente (*.seed.json) fica versionado; a cópia de trabalho (*.json) é criada
// na primeira leitura e pode ser apagada a qualquer momento para voltar ao estado inicial.

import { readFile, writeFile, copyFile, access } from "node:fs/promises";

export function createStore(seedPath, workPath) {
  let cache = null;
  let queue = Promise.resolve();

  async function load() {
    if (cache) return cache;
    try {
      await access(workPath);
    } catch {
      await copyFile(seedPath, workPath);
    }
    cache = JSON.parse(await readFile(workPath, "utf8"));
    return cache;
  }

  return {
    read: load,

    // Escritas em fila para não corromper o arquivo com requisições simultâneas.
    update(mutator) {
      // Se o mutator lançar erro, nada é gravado e a fila segue para a próxima escrita.
      const run = queue.then(async () => {
        const data = await load();
        const snapshot = JSON.stringify(data);
        try {
          const result = await mutator(data);
          await writeFile(workPath, JSON.stringify(data, null, 2));
          return result;
        } catch (err) {
          cache = JSON.parse(snapshot); // desfaz mudanças parciais
          throw err;
        }
      });
      queue = run.catch(() => {});
      return run;
    },

    async reset() {
      await copyFile(seedPath, workPath);
      cache = null;
      return load();
    },
  };
}
