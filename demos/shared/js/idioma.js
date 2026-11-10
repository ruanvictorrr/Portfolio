// Idioma das demos: mesmo botão e mesma escolha do portfólio (chave "idioma" no localStorage).
//
// Como traduz: cada demo tem um dicionário (js/i18n.js) com o texto em português e as
// traduções. Este módulo percorre a página e troca cada texto que achar no dicionário,
// e continua observando: tudo o que o JavaScript ou a API colocarem na tela depois
// (cardápio, reservas, respostas do robô...) também é traduzido.
//
// Formato do dicionário: [português, inglês, espanhol, português de Portugal?]
//   ["Cardápio", "Menu", "Menú", "Ementa"]       o 4º só quando difere do PT-BR
//   [/^(\d+) reservas$/, "$1 bookings", "$1 reservas"]   padrões com partes variáveis;
//                                                 $t1 traduz o pedaço capturado antes de usar
// Para não traduzir um trecho (ex.: o que o usuário digitou), use translate="no".
// Em qualquer idioma que não seja PT-BR, window.__faltando lista o que ficou sem tradução.

export const IDIOMAS = [
  { code: "pt-BR", curto: "BR", nome: "Português (Brasil)", locale: "pt-BR" },
  { code: "pt-PT", curto: "PT", nome: "Português (Portugal)", locale: "pt-PT" },
  { code: "en", curto: "EN", nome: "English", locale: "en-US" },
  { code: "es", curto: "ES", nome: "Español", locale: "es-ES" },
];
const CHAVE = "idioma";
const COLUNA = { en: 1, es: 2, "pt-PT": 3 };

function escolher() {
  const validos = IDIOMAS.map((i) => i.code);
  const daUrl = new URLSearchParams(location.search).get("lang");
  if (validos.includes(daUrl)) {
    try { localStorage.setItem(CHAVE, daUrl); } catch {}
    return daUrl;
  }
  let salvo = null;
  try { salvo = localStorage.getItem(CHAVE); } catch {}
  if (validos.includes(salvo)) return salvo;
  for (const l of navigator.languages || [navigator.language || ""]) {
    if (/^pt-PT$/i.test(l)) return "pt-PT";
    const base = l.toLowerCase().split("-")[0];
    if (base === "pt") return "pt-BR";
    if (validos.includes(base)) return base;
  }
  return "pt-BR";
}

export const IDIOMA = escolher();
export const LOCALE = IDIOMAS.find((i) => i.code === IDIOMA).locale;
// Preços são sempre em reais: em espanhol e PT-PT o Intl escreveria "74,90 BRL", então fica "R$ 74,90"
export const LOCALE_MOEDA = IDIOMA === "en" ? "en-US" : "pt-BR";
const TRADUZ = IDIOMA !== "pt-BR";
document.documentElement.lang = IDIOMA;

// Textos da barra de demonstração, iguais em todas as demos
const COMUNS = [
  ["Portfólio Ruan Galvão", "Ruan Galvão's portfolio", "Portafolio de Ruan Galvão"],
  ["Fale comigo", "Talk to me", "Habla conmigo"],
  ["Idioma", "Language", "Idioma"],
];

const mapa = new Map();
const padroes = [];
const limpa = (s) => s.replace(/\s+/g, " ").trim();

function registrar(entradas) {
  if (!TRADUZ) return;
  const col = COLUNA[IDIOMA];
  for (const e of entradas) {
    let alvo = e[col];
    // [padrão, função] sozinha vale para todos os idiomas
    if (alvo == null && e.length === 2 && typeof e[1] === "function") alvo = e[1];
    // PT-PT sem coluna própria: fica como no PT-BR
    if (alvo == null && col === 3 && !(e[0] instanceof RegExp)) alvo = e[0];
    if (alvo == null) continue;
    if (e[0] instanceof RegExp) padroes.push([e[0], alvo]);
    else mapa.set(limpa(e[0]), alvo);
  }
}
registrar(COMUNS);

const faltando = new Set();
if (TRADUZ) window.__faltando = faltando;

function traduzirLinha(linha) {
  const chave = limpa(linha);
  if (!chave || !/\p{L}/u.test(chave)) return null;
  if (mapa.has(chave)) return mapa.get(chave);
  for (const [re, alvo] of padroes) {
    const m = chave.match(re);
    if (m && m[0] === chave) {
      if (typeof alvo === "function") return alvo(...m); // (frase inteira, grupos...)
      return alvo.replace(/\$(t?)(\d)/g, (_, tr, n) => {
        const g = m[Number(n)] ?? "";
        return tr ? (traduzirLinha(g) ?? g) : g;
      });
    }
  }
  // ". Pedido #12 ...", "· 3 itens": pontuação de ligação antes do texto
  const m = chave.match(/^([.,;:·•–-]\s+)(.+)$/u);
  if (m) {
    const resto = traduzirLinha(m[2]);
    if (resto != null) return m[1] + resto;
  }
  return null;
}

// Traduz um texto solto (para quem monta mensagens no JS: alert, link do WhatsApp...)
export function t(texto) {
  if (!TRADUZ || texto == null) return texto;
  const s = String(texto);
  // várias linhas: cada linha é uma frase (mensagens de WhatsApp, por exemplo)
  if (s.trim().includes("\n")) {
    let mudou = false;
    const linhas = s.split("\n").map((l) => {
      const tr = traduzirLinha(l);
      if (tr == null) { anotar(l); return l; }
      mudou = true;
      return manterEspacos(l, tr);
    });
    return mudou ? linhas.join("\n") : s;
  }
  const direto = traduzirLinha(s);
  if (direto != null) return manterEspacos(s, direto);
  anotar(s);
  return s;
}

// Traduz o texto pronto de um link do WhatsApp (wa.me/...?text=...), linha a linha
export function tLink(url) {
  if (!TRADUZ || !url) return url;
  try {
    const u = new URL(url);
    const texto = u.searchParams.get("text");
    if (!texto) return url;
    u.searchParams.delete("text");
    const resto = u.searchParams.toString();
    u.search = (resto ? resto + "&" : "") + "text=" + encodeURIComponent(t(texto));
    return u.toString();
  } catch {
    return url;
  }
}

function manterEspacos(orig, novo) {
  const ini = orig.match(/^\s*/)[0];
  const fim = orig.match(/\s*$/)[0];
  return ini + novo + fim;
}

// Só anota o que parece texto em português (tem letra e não é número, preço ou nome solto)
function anotar(s) {
  if (IDIOMA === "pt-PT") return; // o que não muda em PT-PT fica igual ao PT-BR, sem problema
  const c = limpa(s);
  if (c && /\p{L}{2,}/u.test(c) && !mapa.has(c)) faltando.add(c);
}

const ATRIBUTOS = ["alt", "title", "placeholder", "aria-label", "label", "data-tooltip"];
const PULAR = new Set(["SCRIPT", "STYLE", "TEXTAREA", "CODE", "NOSCRIPT"]);
const feitos = new WeakMap(); // nó -> último texto que este módulo escreveu nele

function bloqueado(el) {
  return !el || el.closest?.('[translate="no"]') || PULAR.has(el.nodeName);
}

function traduzirNoTexto(no) {
  if (feitos.get(no) === no.data) return;
  const pai = no.parentElement;
  if (bloqueado(pai)) return;
  const novo = t(no.data);
  if (novo !== no.data) {
    // <option> sem value: o valor enviado seria o texto traduzido; guarda o original
    if (pai.nodeName === "OPTION" && !pai.hasAttribute("value")) pai.setAttribute("value", pai.textContent);
    no.data = novo;
  }
  feitos.set(no, no.data);
}

function traduzirAtributos(el) {
  if (bloqueado(el)) return;
  for (const a of ATRIBUTOS) {
    const v = el.getAttribute(a);
    if (v == null) continue;
    const chaveFeito = `${a}:${v}`;
    if (feitos.get(el)?.has(chaveFeito)) continue;
    const novo = t(v);
    if (novo !== v) el.setAttribute(a, novo);
    if (!feitos.has(el)) feitos.set(el, new Set());
    feitos.get(el).add(`${a}:${novo}`);
  }
  if (el.nodeName === "INPUT" && /^(button|submit|reset)$/i.test(el.type) && el.value) {
    const novo = t(el.value);
    if (novo !== el.value) el.value = novo;
  }
}

function traduzirArvore(raiz) {
  if (raiz.nodeType === Node.TEXT_NODE) return traduzirNoTexto(raiz);
  if (raiz.nodeType !== Node.ELEMENT_NODE) return;
  if (bloqueado(raiz)) return;
  traduzirAtributos(raiz);
  const it = document.createTreeWalker(raiz, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  let no;
  while ((no = it.nextNode())) {
    if (no.nodeType === Node.TEXT_NODE) traduzirNoTexto(no);
    else traduzirAtributos(no);
  }
}

function traduzirCabecalho() {
  document.title = t(document.title);
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.content = t(desc.content);
}

// Botão de idiomas na barra de demonstração
function montarBotao() {
  const barra = document.querySelector(".demo-bar");
  if (!barra || barra.querySelector(".demo-lang")) return;
  const atual = IDIOMAS.find((i) => i.code === IDIOMA);
  const caixa = document.createElement("div");
  caixa.className = "demo-lang";
  caixa.innerHTML = `
    <button class="demo-lang__btn" type="button" aria-haspopup="true" aria-expanded="false">
      <i class="ph ph-globe-simple" aria-hidden="true"></i><span>${atual.curto}</span>
    </button>
    <ul class="demo-lang__menu" hidden>
      ${IDIOMAS.map((i) => `<li><a href="?lang=${i.code}" hreflang="${i.code}" lang="${i.code}" translate="no"${i.code === IDIOMA ? ' aria-current="true"' : ""}><span class="demo-lang__code">${i.curto}</span>${i.nome}</a></li>`).join("")}
    </ul>`;
  const btn = caixa.querySelector("button");
  const menu = caixa.querySelector("ul");
  btn.setAttribute("aria-label", `${t("Idioma")}: ${atual.nome}`);
  btn.setAttribute("translate", "no");
  const abrir = (sim) => {
    menu.hidden = !sim;
    btn.setAttribute("aria-expanded", String(sim));
    if (sim) menu.querySelector("[aria-current]")?.focus();
  };
  btn.addEventListener("click", () => abrir(menu.hidden));
  document.addEventListener("click", (e) => { if (!menu.hidden && !caixa.contains(e.target)) abrir(false); });
  caixa.addEventListener("keydown", (e) => {
    const links = [...menu.querySelectorAll("a")];
    const i = links.indexOf(document.activeElement);
    if (e.key === "Escape" && !menu.hidden) { abrir(false); btn.focus(); }
    else if (e.key === "ArrowDown" && i > -1) { e.preventDefault(); links[(i + 1) % links.length].focus(); }
    else if (e.key === "ArrowUp" && i > -1) { e.preventDefault(); links[(i - 1 + links.length) % links.length].focus(); }
  });
  // Fecha quando o foco vai (pelo Tab) para fora. Sem relatedTarget é clique: no Safari clicar num
  // link não dá foco a ele, e fechar aqui sumiria com o link antes do clique valer.
  caixa.addEventListener("focusout", (e) => { if (e.relatedTarget && !caixa.contains(e.relatedTarget)) abrir(false); });
  const cta = barra.querySelector(".demo-bar__cta");
  barra.insertBefore(caixa, cta);
  // agrupa idioma + "Fale comigo" à direita
  const direita = document.createElement("div");
  direita.className = "demo-bar__right";
  barra.insertBefore(direita, caixa);
  direita.append(caixa, cta);
}

let iniciado = false;

// Chamado pelo js/i18n.js de cada demo, com o dicionário dela.
export function iniciarTraducao(dicionario = []) {
  registrar(dicionario);
  if (iniciado) return;
  iniciado = true;
  montarBotao();
  if (!TRADUZ) return;
  traduzirCabecalho();
  traduzirArvore(document.body);
  new MutationObserver((mudancas) => {
    for (const m of mudancas) {
      if (m.type === "childList") m.addedNodes.forEach(traduzirArvore);
      else if (m.type === "characterData") traduzirNoTexto(m.target);
      else if (m.type === "attributes") traduzirAtributos(m.target);
    }
  }).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATRIBUTOS });
  new MutationObserver(traduzirCabecalho).observe(document.querySelector("title") || document.head, { childList: true, characterData: true, subtree: true });
}
