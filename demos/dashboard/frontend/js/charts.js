// Gráficos em SVG feitos à mão: linha com comparação, barras horizontais, colunas e barra empilhada.
// Regras seguidas: um eixo só, marcas finas, grade discreta, tooltip com crosshair na linha,
// tooltip por marca nas barras, e redesenho quando o cartão muda de tamanho.

import { svg, el, dinheiro, dinheiroCurto, diaCurto, diaLongo, pct } from "./format.js";
import { mostrarTooltip, esconderTooltip } from "./tooltip.js";

function escalaBonita(max, passos = 4) {
  const bruto = max / passos;
  const mag = 10 ** Math.floor(Math.log10(bruto || 1));
  const passo = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((p) => p >= bruto) || bruto;
  return { topo: passo * passos, passo };
}

const observadores = new WeakMap();
function aoRedimensionar(container, desenhar) {
  observadores.get(container)?.disconnect();
  let largura = 0;
  const ro = new ResizeObserver(([e]) => {
    const w = Math.round(e.contentRect.width);
    if (w && w !== largura) { largura = w; desenhar(w, container.clientHeight); }
  });
  ro.observe(container);
  observadores.set(container, ro);
}

export function graficoLinha(container, serie) {
  aoRedimensionar(container, (W, H) => {
    const m = { t: 12, r: 64, b: 26, l: 52 };
    const w = W - m.l - m.r;
    const h = H - m.t - m.b;
    const maxV = Math.max(...serie.map((d) => Math.max(d.valor, d.anterior || 0)));
    const { topo, passo } = escalaBonita(maxV);
    const x = (i) => m.l + (serie.length === 1 ? w / 2 : (i / (serie.length - 1)) * w);
    const y = (v) => m.t + h - (v / topo) * h;

    const grade = svg("g", { class: "grid" });
    for (let v = 0; v <= topo + 0.001; v += passo) {
      grade.append(svg("line", { x1: m.l, x2: m.l + w, y1: y(v), y2: y(v) }), svg("text", { x: m.l - 8, y: y(v) + 4, "text-anchor": "end" }, dinheiroCurto(v)));
    }
    const rotulos = svg("g");
    const salto = Math.ceil(serie.length / Math.max(2, Math.floor(w / 70)));
    serie.forEach((d, i) => {
      if ((i % salto === 0 && serie.length - 1 - i >= salto * 0.6) || i === serie.length - 1) {
        rotulos.append(svg("text", { x: x(i), y: H - 6, "text-anchor": i === serie.length - 1 ? "end" : i === 0 ? "start" : "middle" }, diaCurto(d.data)));
      }
    });

    const caminho = (campo) => serie.map((d, i) => d[campo] == null ? "" : `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d[campo]).toFixed(1)}`).join("");
    const area = `${caminho("valor")}L${x(serie.length - 1)},${y(0)}L${x(0)},${y(0)}Z`;
    const ultimo = serie.at(-1);

    const cross = svg("line", { class: "crosshair", y1: m.t, y2: m.t + h, visibility: "hidden" });
    const dot = svg("circle", { class: "dot", r: 4.5, visibility: "hidden" });
    const dotPrev = svg("circle", { class: "dot dot--prev", r: 4, visibility: "hidden" });
    const hit = svg("rect", { class: "hit", x: m.l, y: m.t, width: w, height: h, tabindex: 0, "aria-label": "Passe o mouse ou use as setas para ver cada dia" });

    let atual = serie.length - 1;
    const mostrar = (i, cx, cy) => {
      atual = i;
      const d = serie[i];
      cross.setAttribute("x1", x(i)); cross.setAttribute("x2", x(i)); cross.setAttribute("visibility", "visible");
      dot.setAttribute("cx", x(i)); dot.setAttribute("cy", y(d.valor)); dot.setAttribute("visibility", "visible");
      if (d.anterior != null) { dotPrev.setAttribute("cx", x(i)); dotPrev.setAttribute("cy", y(d.anterior)); dotPrev.setAttribute("visibility", "visible"); }
      const linhas = [{ valor: dinheiro(d.valor), nome: "Este período" }];
      if (d.anterior != null) linhas.push({ valor: dinheiro(d.anterior), nome: "Período anterior", prev: true });
      const r = container.getBoundingClientRect();
      mostrarTooltip(cx ?? r.left + x(i), cy ?? r.top + y(d.valor), diaLongo(d.data), linhas);
    };
    const esconder = () => { [cross, dot, dotPrev].forEach((n) => n.setAttribute("visibility", "hidden")); esconderTooltip(); };
    hit.addEventListener("pointermove", (e) => {
      const r = container.getBoundingClientRect();
      const i = Math.round(((e.clientX - r.left - m.l) / w) * (serie.length - 1));
      mostrar(Math.max(0, Math.min(serie.length - 1, i)), e.clientX, e.clientY);
    });
    hit.addEventListener("pointerleave", esconder);
    hit.addEventListener("blur", esconder);
    hit.addEventListener("focus", () => mostrar(atual));
    hit.addEventListener("keydown", (e) => {
      const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (d) { e.preventDefault(); mostrar(Math.max(0, Math.min(serie.length - 1, atual + d))); }
    });

    container.replaceChildren(svg("svg", { viewBox: `0 0 ${W} ${H}`, width: W, height: H },
      grade, rotulos,
      svg("line", { class: "baseline", x1: m.l, x2: m.l + w, y1: y(0), y2: y(0) }),
      svg("path", { class: "area", d: area }),
      svg("path", { class: "line line--prev", d: caminho("anterior") }),
      svg("path", { class: "line", d: caminho("valor") }),
      svg("text", { class: "label-end", x: x(serie.length - 1) + 8, y: y(ultimo.valor) + 4 }, dinheiroCurto(ultimo.valor)),
      cross, dotPrev, dot, hit));
  });
}

export function barrasHorizontais(container, linhas, { ativa, aoClicar }) {
  const max = Math.max(...linhas.map((l) => l.valor)) || 1;
  container.replaceChildren(el("div", { class: "bars" }, ...linhas.map((l) => {
    const botao = el("button", {
      type: "button", class: `bar ${ativa === l.categoria ? "is-active" : ""} ${ativa && ativa !== l.categoria ? "is-dim" : ""}`,
      "aria-pressed": String(ativa === l.categoria), "aria-label": `${l.categoria}: ${dinheiro(l.valor)}. Filtrar por esta categoria`,
      onclick: () => aoClicar(ativa === l.categoria ? "" : l.categoria),
    },
      el("span", { class: "bar__label", text: l.categoria }),
      el("span", { class: "bar__track" }, el("span", { class: "bar__fill", style: `width:${(l.valor / max) * 100}%` })),
      el("span", { class: "bar__value", text: dinheiroCurto(l.valor) }));
    return botao;
  })));
}

export function colunas(container, dados) {
  aoRedimensionar(container, (W, H) => {
    const m = { t: 10, r: 4, b: 22, l: 44 };
    const w = W - m.l - m.r;
    const h = H - m.t - m.b;
    const { topo, passo } = escalaBonita(Math.max(...dados.map((d) => d.valor)), 3);
    const y = (v) => m.t + h - (v / topo) * h;
    const banda = w / dados.length;
    const larg = Math.max(4, banda - 4); // 2px de folga de cada lado
    const pico = dados.reduce((a, b) => (b.valor > a.valor ? b : a));

    const grade = svg("g", { class: "grid" });
    for (let v = 0; v <= topo + 0.001; v += passo) {
      grade.append(svg("line", { x1: m.l, x2: m.l + w, y1: y(v), y2: y(v) }), svg("text", { x: m.l - 8, y: y(v) + 4, "text-anchor": "end" }, dinheiroCurto(v)));
    }
    const grupo = svg("g");
    dados.forEach((d, i) => {
      const x0 = m.l + i * banda + (banda - larg) / 2;
      const altura = Math.max(1, y(0) - y(d.valor));
      const r = Math.min(4, larg / 2, altura);
      // Coluna com cantos arredondados só no topo
      const caminho = `M${x0},${y(0)}V${y(d.valor) + r}Q${x0},${y(d.valor)} ${x0 + r},${y(d.valor)}H${x0 + larg - r}Q${x0 + larg},${y(d.valor)} ${x0 + larg},${y(d.valor) + r}V${y(0)}Z`;
      const col = svg("path", { class: "col", d: caminho });
      const alvo = svg("rect", { class: "hit", x: m.l + i * banda, y: m.t, width: banda, height: h, tabindex: 0, "aria-label": `${d.hora}h: ${dinheiro(d.valor)} em média` });
      const mostrar = (e) => {
        grupo.querySelectorAll(".col").forEach((c) => c.classList.toggle("is-dim", c !== col));
        const rr = container.getBoundingClientRect();
        mostrarTooltip(e?.clientX ?? rr.left + x0 + larg / 2, e?.clientY ?? rr.top + y(d.valor), `${d.hora}h às ${d.hora + 1}h`, [{ valor: dinheiro(d.valor), nome: "média por dia" }]);
      };
      const esconder = () => { grupo.querySelectorAll(".col").forEach((c) => c.classList.remove("is-dim")); esconderTooltip(); };
      alvo.addEventListener("pointermove", mostrar);
      alvo.addEventListener("focus", () => mostrar());
      alvo.addEventListener("pointerleave", esconder);
      alvo.addEventListener("blur", esconder);
      grupo.append(col);
      if (i % 2 === 0) grupo.append(svg("text", { x: x0 + larg / 2, y: H - 6, "text-anchor": "middle" }, `${d.hora}h`));
      grupo.append(alvo);
    });
    const xp = m.l + dados.indexOf(pico) * banda + banda / 2;
    container.replaceChildren(svg("svg", { viewBox: `0 0 ${W} ${H}`, width: W, height: H },
      grade, svg("line", { class: "baseline", x1: m.l, x2: m.l + w, y1: y(0), y2: y(0) }), grupo,
      svg("text", { class: "label-end", x: xp, y: y(pico.valor) - 6, "text-anchor": "middle" }, "pico")));
  });
}

export function barraEmpilhada(container, dados) {
  const total = dados.reduce((s, d) => s + d.valor, 0) || 1;
  const cores = ["var(--cat-1)", "var(--cat-2)", "var(--cat-3)", "var(--cat-4)"];
  const barra = el("div", { class: "stack__bar", role: "img", "aria-label": dados.map((d) => `${d.forma} ${pct((d.valor / total) * 100, 0)}`).join(", ") },
    ...dados.map((d, i) => {
      const seg = el("span", { class: "stack__seg", style: `flex-basis:${(d.valor / total) * 100}%;background:${cores[i]}` });
      seg.addEventListener("pointermove", (e) => mostrarTooltip(e.clientX, e.clientY, d.forma, [{ valor: pct((d.valor / total) * 100), nome: dinheiro(d.valor), cor: cores[i] }]));
      seg.addEventListener("pointerleave", esconderTooltip);
      return seg;
    }));
  const legenda = el("ul", { class: "stack__legend" }, ...dados.map((d, i) =>
    el("li", {}, el("span", { class: "key", style: `background:${cores[i]}` }), el("span", { text: d.forma }),
      el("span", { class: "pct", text: pct((d.valor / total) * 100, 0) }), el("span", { class: "val", text: dinheiroCurto(d.valor) }))));
  container.replaceChildren(barra, legenda);
}
