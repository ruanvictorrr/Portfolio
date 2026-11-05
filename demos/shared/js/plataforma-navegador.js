// O que as rotas das demos recebem quando rodam dentro do navegador (GitHub Pages):
// os dados fixos vêm por fetch e os "bancos" ficam no localStorage de cada visitante.
// É a mesma interface de server/lib/plataforma.js (lerDados e criarStore).

const PREFIXO = "portfolio-ruan:";

function armazenamento() {
  try {
    const teste = `${PREFIXO}teste`;
    localStorage.setItem(teste, "1");
    localStorage.removeItem(teste);
    return localStorage;
  } catch {
    // navegação privada ou armazenamento bloqueado: guarda só enquanto a página estiver aberta
    const memoria = new Map();
    return {
      getItem: (k) => (memoria.has(k) ? memoria.get(k) : null),
      setItem: (k, v) => memoria.set(k, String(v)),
      removeItem: (k) => memoria.delete(k),
    };
  }
}

const storage = armazenamento();

function criarStoreLocal(chave, lerSemente) {
  let cache = null;
  let fila = Promise.resolve();

  async function carregar() {
    if (cache) return cache;
    const salvo = storage.getItem(chave);
    if (salvo) {
      try {
        cache = JSON.parse(salvo);
        return cache;
      } catch {
        storage.removeItem(chave);
      }
    }
    cache = await lerSemente();
    return cache;
  }

  return {
    read: carregar,

    // Mesmas regras do store em arquivo: escritas em fila e, se der erro, nada é gravado.
    update(mutator) {
      const run = fila.then(async () => {
        const data = await carregar();
        const snapshot = JSON.stringify(data);
        try {
          const result = await mutator(data);
          storage.setItem(chave, JSON.stringify(data));
          return result;
        } catch (err) {
          cache = JSON.parse(snapshot);
          throw err;
        }
      });
      fila = run.catch(() => {});
      return run;
    },

    async reset() {
      storage.removeItem(chave);
      cache = null;
      return carregar();
    },
  };
}

export function plataformaNavegador(demo, pastaDados) {
  const lerDados = async (arquivo) => {
    const res = await fetch(new URL(arquivo, pastaDados));
    if (!res.ok) throw new Error(`Não foi possível carregar ${arquivo}.`);
    return res.json();
  };
  return {
    lerDados,
    criarStore: (nome) => criarStoreLocal(`${PREFIXO}${demo}:${nome}`, () => lerDados(`${nome}.seed.json`)),
  };
}
