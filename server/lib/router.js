// Roteador mínimo: GET/POST/PATCH/DELETE com parâmetros no caminho (ex.: /pedidos/:id).

export function createRouter() {
  const routes = [];

  const add = (method) => (path, handler) => {
    const keys = [];
    const pattern = new RegExp(
      "^" + path.replace(/\/:([a-zA-Z]+)/g, (_, k) => (keys.push(k), "/([^/]+)")) + "/?$"
    );
    routes.push({ method, pattern, keys, handler });
  };

  return {
    get: add("GET"),
    post: add("POST"),
    patch: add("PATCH"),
    delete: add("DELETE"),

    match(method, path) {
      let pathExists = false;
      for (const r of routes) {
        const m = path.match(r.pattern);
        if (!m) continue;
        pathExists = true;
        if (r.method !== method) continue;
        const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
        return { handler: r.handler, params };
      }
      return pathExists ? { methodNotAllowed: true } : null;
    },
  };
}
