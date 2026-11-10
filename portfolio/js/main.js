/* ============================================================
   CONFIGURAÇÃO: edite aqui seus dados reais
   ============================================================ */
const CONFIG = {
  // e-mail que recebe os pedidos do formulário de contato
  email: "ruanvictorgalvao@hotmail.com",
};

// Demonstrações funcionando (pasta demos/). Dados fictícios, prontos para mostrar ao cliente.
// As imagens são capturas reais de cada demo (pasta assets/).
const PROJETOS = [
  {
    nome: "R2 Transporte e Logística",
    tags: "Landing page / Cliente real",
    resumo: "Site da transportadora R2: serviços, parceiros, perguntas frequentes, pedido de cotação e atendimento direto pelo WhatsApp.",
    imagem: "img/projeto-r2.jpg",
    link: "https://r2transporteelogistica.com",
    externo: true,
  },
  {
    nome: "Site para clínica",
    tags: "Site profissional / Várias páginas",
    resumo: "Clínica Sorriso Agreste: uma página para cada tratamento, convênios com busca e agendamento de avaliação.",
    imagem: "img/demo-clinica.jpg",
    link: "demos/brasil/clinica/",
  },
  {
    nome: "Site para restaurante",
    tags: "Site com sistema",
    resumo: "Casa Barro: cardápio, reserva com horários livres e um painel onde o dono vê e confirma as reservas.",
    imagem: "img/demo-site.jpg",
    link: "demos/brasil/site/",
  },
  {
    nome: "Fluxo automatizado",
    tags: "Automação",
    resumo: "Pedido entra, planilha atualiza, cliente recebe a confirmação e o estoque baixa sozinho.",
    imagem: "img/demo-automacao.jpg",
    link: "demos/brasil/automacao/",
  },
  {
    nome: "ChatBot no WhatsApp",
    tags: "Atendimento 24h",
    resumo: "Pizzaria que recebe pedido, monta o carrinho e responde horário e entrega a qualquer hora.",
    imagem: "img/demo-chatbot.jpg",
    link: "demos/brasil/chatbot/",
  },
  {
    nome: "Dashboard de vendas",
    tags: "Vendas / Estoque",
    resumo: "Faturamento, produtos mais vendidos e estoque baixo de um mercadinho em uma tela só.",
    imagem: "img/demo-dashboard.jpg",
    link: "demos/brasil/dashboard/",
  },
];

// Cada aba de serviço tem uma galeria: a imagem, a descrição e a lista de destaques
// mudam juntas, falando do projeto que está aparecendo.
const SERVICOS = [
  {
    galeria: [
      {
        src: "img/projeto-r2.jpg", nome: "R2 Transporte", tipo: "Landing page, cliente real",
        link: "https://r2transporteelogistica.com", externo: true,
        desc: "Site da R2 Transporte, transportadora que atende o Nordeste. Uma página só, direto ao ponto: serviços, parceiros, perguntas frequentes e pedido de cotação, com o WhatsApp sempre à mão.",
        inclui: ["Landing page", "Pedido de cotação", "Botão fixo de WhatsApp", "No ar e em uso"],
      },
      {
        src: "img/demo-clinica.jpg", nome: "Clínica Sorriso Agreste", tipo: "Site profissional", link: "demos/brasil/clinica/",
        desc: "Clínica odontológica no centro de Caruaru, com uma página para cada tratamento. Cada página aparece numa busca diferente no Google, e o paciente agenda a avaliação pelo próprio site.",
        inclui: ["Oito páginas", "Uma página por tratamento", "Busca de convênios", "Agendamento pelo site"],
      },
      {
        src: "img/demo-site.jpg", nome: "Casa Barro", tipo: "Site com sistema", link: "demos/brasil/site/",
        desc: "Restaurante de cozinha sertaneja no Alto do Moura. O cliente vê o cardápio, descobre se está aberto agora e reserva mesa só nos horários que ainda têm lugar.",
        inclui: ["Cardápio com busca", "Aberto ou fechado na hora", "Reserva com horários livres", "Confirmação no WhatsApp"],
      },
      {
        src: "img/demo-painel.jpg", nome: "Painel do Casa Barro", tipo: "Área do dono", link: "demos/brasil/site/painel/",
        desc: "A parte que só o restaurante vê. O dono abre no celular, confere as reservas do dia, marca quem chegou e lança as reservas que vieram por telefone.",
        inclui: ["Reservas da semana", "Chegou, faltou ou cancelou", "Lugares por horário", "Acesso com senha"],
      },
    ],
  },
  {
    galeria: [
      {
        src: "img/demo-automacao.jpg", nome: "Pedido pronto", tipo: "Moura Modas, atacado de confecção", link: "demos/brasil/automacao/",
        desc: "Quando chega um pedido, ele vai sozinho para a planilha, o estoque baixa, o Pix é gerado e o cliente recebe a confirmação no WhatsApp. Ninguém copia nada à mão.",
        inclui: ["Planilha atualizada sozinha", "Estoque baixado na hora", "Cobrança Pix", "Confirmação no WhatsApp"],
      },
      {
        src: "img/demo-automacao-estoque.jpg", nome: "Estoque acabando", tipo: "Moura Modas, atacado de confecção", link: "demos/brasil/automacao/",
        desc: "Toda noite o estoque é conferido. O que está abaixo do mínimo vira uma lista de compra separada por fornecedor, com a quantidade sugerida, e vai para o dono.",
        inclui: ["Conferência diária", "Lista por fornecedor", "Quantidade sugerida", "Aviso no WhatsApp"],
      },
      {
        src: "img/demo-automacao-resumo.jpg", nome: "Resumo do dia", tipo: "Moura Modas, atacado de confecção", link: "demos/brasil/automacao/",
        desc: "No fim do expediente o dono recebe no WhatsApp quanto vendeu, quantos pedidos saíram, quantos já pagaram e qual foi o produto campeão, sem abrir planilha.",
        inclui: ["Resumo às 18h", "Vendas do dia", "Produto mais vendido", "Direto no WhatsApp"],
      },
    ],
  },
  {
    galeria: [
      {
        src: "img/demo-chatbot.jpg", nome: "Atendimento", tipo: "Forno Tomazzi, pizzaria", link: "demos/brasil/chatbot/",
        desc: "O robô atende no WhatsApp com botões e listas, mostra o cardápio, monta o pedido e calcula a taxa pelo bairro. Entende quem escreve do próprio jeito, como \"quero uma calabresa grande\".",
        inclui: ["Cardápio e preços", "Carrinho no WhatsApp", "Taxa por bairro", "Entende texto livre"],
      },
      {
        src: "img/demo-chatbot-pedido.jpg", nome: "Pedido fechado", tipo: "Forno Tomazzi, pizzaria", link: "demos/brasil/chatbot/",
        desc: "O pedido confirmado no chat aparece na hora no painel da pizzaria, com o Pix já enviado ao cliente. Quando alguém pede uma pessoa, o robô passa a conversa para a equipe.",
        inclui: ["Pedido no painel na hora", "Pix copia e cola", "Troco para dinheiro", "Passa para atendente"],
      },
    ],
  },
  {
    galeria: [
      {
        src: "img/demo-dashboard.jpg", nome: "Visão geral", tipo: "Mercadinho São Bento", link: "demos/brasil/dashboard/",
        desc: "Faturamento, vendas, ticket médio e margem do período, sempre comparados com o período anterior. Dá para filtrar por categoria e ver em que hora do dia a loja mais vende.",
        inclui: ["Faturamento por período", "Comparação com o anterior", "Movimento por hora", "Formas de pagamento"],
      },
      {
        src: "img/demo-dashboard-estoque.jpg", nome: "Estoque", tipo: "Mercadinho São Bento", link: "demos/brasil/dashboard/",
        desc: "Os produtos que mais vendem e os que estão acabando, com quantos dias o estoque ainda dura e quanto comprar. O dono registra a reposição ali mesmo.",
        inclui: ["Mais vendidos", "Alerta de estoque", "Sugestão de compra", "Reposição com um clique"],
      },
    ],
  },
];

// Logos via Simple Icons (cor creme)
const STACK = [
  ["html5", "HTML"], ["css", "CSS"], ["javascript", "JavaScript"], ["typescript", "TypeScript"],
  ["react", "React"], ["nextdotjs", "Next.js"], ["nodedotjs", "Node.js"], ["tailwindcss", "Tailwind CSS"],
  ["vite", "Vite"], ["figma", "Figma"], ["git", "Git"], ["vercel", "Vercel"], ["wordpress", "WordPress"],
];

/* ============================================================
   IDIOMA
   Escolha: ?lang= na URL > última escolha salva > idioma do navegador > pt-BR.
   As traduções ficam em js/i18n.js. Trocar de idioma recarrega a página,
   porque as animações picotam os títulos em letras e linhas ao carregar.
   ============================================================ */

const IDIOMAS = window.I18N_IDIOMAS || [{ code: "pt-BR", curto: "BR", nome: "Português (Brasil)" }];
const CHAVE_IDIOMA = "idioma";

function escolherIdioma() {
  const validos = IDIOMAS.map((i) => i.code);
  const daUrl = new URLSearchParams(location.search).get("lang");
  if (validos.includes(daUrl)) {
    try { localStorage.setItem(CHAVE_IDIOMA, daUrl); } catch {}
    return daUrl;
  }
  let salvo = null;
  try { salvo = localStorage.getItem(CHAVE_IDIOMA); } catch {}
  if (validos.includes(salvo)) return salvo;
  for (const l of navigator.languages || [navigator.language || ""]) {
    if (/^pt-PT$/i.test(l)) return "pt-PT";
    const base = l.toLowerCase().split("-")[0];
    if (base === "pt") return "pt-BR";
    if (validos.includes(base)) return base;
  }
  return "pt-BR";
}

const IDIOMA = escolherIdioma();
const TRAD = (window.I18N && window.I18N[IDIOMA]) || {};
const UI = {
  idioma: "Idioma",
  altProjeto: "Captura da demonstração: ",
  altSite: "Captura do site ",
  abrir: "Abrir ",
  confira: "Confira os campos destacados.",
  abrindo: "Abrindo seu aplicativo de e-mail com a mensagem pronta.",
  assunto: "Novo projeto: {servico}",
  corpo: "Olá, Ruan!\n\nMeu nome é {nome}.\nServiço: {servico}\n\n{msg}",
  ...TRAD.ui,
};
const preencher = (texto, vars) => texto.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");

document.documentElement.lang = IDIOMA;
if (TRAD.textos) {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const v = TRAD.textos[el.dataset.i18n];
    if (v != null) el.innerHTML = v;
  });
  document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
    el.dataset.i18nAttr.split(",").forEach((par) => {
      const [attr, chave] = par.split("=").map((x) => x.trim());
      const v = TRAD.textos[chave];
      if (v != null) el.setAttribute(attr, v);
    });
  });
  if (TRAD.textos["contact.whatsMsg"]) {
    document.getElementById("whats-link").href = `https://wa.me/5581999799008?text=${encodeURIComponent(TRAD.textos["contact.whatsMsg"])}`;
  }
}
(TRAD.projetos || []).forEach((p, i) => Object.assign(PROJETOS[i], p));
(TRAD.servicos || []).forEach((itens, i) => itens.forEach((g, j) => Object.assign(SERVICOS[i].galeria[j], g)));

// Botão de idiomas (menu com links ?lang=, que também servem para compartilhar)
const langBtn = document.getElementById("lang-btn");
const langMenu = document.getElementById("lang-menu");
const idiomaAtual = IDIOMAS.find((i) => i.code === IDIOMA) || IDIOMAS[0];
// Bandeiras são emoji: o Windows não desenha bandeira (mostra só as letras),
// então só usamos quando o sistema realmente pinta o emoji colorido.
const temBandeira = (() => {
  try {
    const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    ctx.canvas.width = ctx.canvas.height = 20;
    ctx.font = "16px sans-serif"; ctx.textBaseline = "top";
    ctx.fillText("\u{1F1E7}\u{1F1F7}", 0, 0);
    const px = ctx.getImageData(0, 0, 20, 20).data;
    for (let i = 0; i < px.length; i += 4) if (px[i + 3] && Math.abs(px[i] - px[i + 1]) > 40) return true;
  } catch {}
  return false;
})();
const bandeira = (i) => (temBandeira && i.bandeira ? `<span class="lang__flag" aria-hidden="true">${i.bandeira}</span>` : "");
document.getElementById("lang-bandeira").innerHTML = bandeira(idiomaAtual);
if (temBandeira) document.getElementById("lang").classList.add("lang--bandeira");
document.getElementById("lang-atual").textContent = idiomaAtual.curto;
langBtn.setAttribute("aria-label", `${UI.idioma}: ${idiomaAtual.nome}`);
langMenu.innerHTML = IDIOMAS.map((i) => `
  <li><a href="?lang=${i.code}" hreflang="${i.code}" lang="${i.code}"${i.code === IDIOMA ? ' aria-current="true"' : ""}>
    ${bandeira(i)}<span class="lang__code">${i.curto}</span>${i.nome}
  </a></li>`).join("");

function abrirIdiomas(abrir) {
  langMenu.hidden = !abrir;
  langBtn.setAttribute("aria-expanded", String(abrir));
  if (abrir) langMenu.querySelector("[aria-current]")?.focus();
}
langBtn.addEventListener("click", () => abrirIdiomas(langMenu.hidden));
document.addEventListener("click", (e) => { if (!langMenu.hidden && !e.target.closest("#lang")) abrirIdiomas(false); });
document.getElementById("lang").addEventListener("keydown", (e) => {
  const links = [...langMenu.querySelectorAll("a")];
  const i = links.indexOf(document.activeElement);
  if (e.key === "Escape" && !langMenu.hidden) { abrirIdiomas(false); langBtn.focus(); }
  else if (e.key === "ArrowDown" && i > -1) { e.preventDefault(); links[(i + 1) % links.length].focus(); }
  else if (e.key === "ArrowUp" && i > -1) { e.preventDefault(); links[(i - 1 + links.length) % links.length].focus(); }
});
langMenu.addEventListener("focusout", (e) => { if (!e.relatedTarget?.closest?.("#lang")) abrirIdiomas(false); });

/* ============================================================ */

document.documentElement.classList.add("js");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Capturas de tela (1440px) têm uma versão de 720px (nome-720.jpg): o celular baixa a menor.
const CAPTURA_SIZES = "(min-width: 768px) 56vw, calc(100vw - 32px)";
const srcsetCaptura = (src) => `${src.replace(/\.jpg$/, "-720.jpg")} 720w, ${src} 1440w`;
function trocarImagem(img, src) { img.srcset = srcsetCaptura(src); img.src = src; }

// Projetos
const grid = document.getElementById("work-grid");
grid.insertAdjacentHTML("beforeend", PROJETOS.map((p, i) => `
  <a class="work__card reveal" href="${p.link}"${p.externo ? ' target="_blank" rel="noopener"' : ""}>
    <figure class="work__media">
      <img src="${p.imagem}" srcset="${srcsetCaptura(p.imagem)}" sizes="(min-width: 768px) 52vw, calc(100vw - 32px)" alt="${UI.altProjeto}${p.nome}" loading="lazy" width="1600" height="1200">
    </figure>
    <div class="work__meta">
      <h3 class="work__name">${p.nome}</h3>
      <span class="work__tags">${p.tags}</span>
    </div>
    ${i < 3 ? `<p class="work__summary">${p.resumo}</p>` : ""}
  </a>`).join(""));

// Marquee (lista duplicada para o loop contínuo)
const track = document.getElementById("marquee-track");
const logos = STACK.map(([slug, nome]) =>
  `<li><img src="https://cdn.simpleicons.org/${slug}/ffedd7" alt="${nome}" width="32" height="32" loading="lazy"></li>`
).join("");
track.innerHTML = logos + logos.replace(/alt="[^"]*"/g, 'alt="" aria-hidden="true"');

// Serviços: abas
const tabs = [...document.querySelectorAll(".services__tab")];
const panel = document.getElementById("svc-panel");
const svcImg = document.getElementById("svc-img");
const svcDesc = document.getElementById("svc-desc");
const svcList = document.getElementById("svc-list");
const svcLink = document.getElementById("svc-link");
const svcImgNext = document.getElementById("svc-img-next");
const svcMediaLink = document.getElementById("svc-media-link");
const svcGallery = document.getElementById("svc-gallery");
const svcCopy = document.querySelector(".services__copy");
const svcCaption = document.getElementById("svc-caption");
// pré-carrega no tamanho que a tela vai usar (sizes antes do srcset, para o navegador escolher certo)
SERVICOS.forEach((s) => s.galeria.forEach((g) => { const im = new Image(); im.sizes = CAPTURA_SIZES; im.srcset = srcsetCaptura(g.src); im.src = g.src; }));

// Galeria que alterna sozinha (a cada 4,5 s) e para quando o mouse ou o foco está nela
const galeria = { itens: [], atual: 0, timer: null, pausada: false };

function mostrarSlide(i, animar = true) {
  const g = galeria.itens[i];
  if (!g) return;
  galeria.atual = i;
  const trocar = () => {
    trocarImagem(svcImg, g.src);
    svcImg.alt = `${UI.altSite}${g.nome}`;
    svcImgNext.classList.remove("is-in");
  };
  if (animar && !reduceMotion && svcImg.getAttribute("src") !== g.src) {
    trocarImagem(svcImgNext, g.src);
    svcImgNext.classList.add("is-in");
    setTimeout(trocar, 600);
  } else {
    trocar();
  }
  svcMediaLink.href = g.link;
  if (g.externo) { svcMediaLink.target = "_blank"; svcMediaLink.rel = "noopener"; } else { svcMediaLink.removeAttribute("target"); svcMediaLink.removeAttribute("rel"); }
  svcMediaLink.setAttribute("aria-label", `${UI.abrir}${g.nome}`);
  svcCaption.textContent = g.tipo;
  const textos = () => {
    svcDesc.textContent = g.desc;
    svcList.replaceChildren(...g.inclui.map((x) => { const li = document.createElement("li"); li.textContent = x; return li; }));
    svcCopy.classList.remove("is-fading");
  };
  if (animar && !reduceMotion && svcDesc.textContent && svcDesc.textContent !== g.desc) {
    svcCopy.classList.add("is-fading");
    setTimeout(textos, 300);
  } else {
    textos();
  }
  svcLink.href = g.link;
  svcLink.textContent = `${UI.abrir}${g.nome}`;
  if (g.externo) { svcLink.target = "_blank"; svcLink.rel = "noopener"; } else { svcLink.removeAttribute("target"); svcLink.removeAttribute("rel"); }
  svcGallery.querySelectorAll("button").forEach((b, j) => b.setAttribute("aria-pressed", String(j === i)));
}

function pararGaleria() { clearInterval(galeria.timer); galeria.timer = null; }
function iniciarGaleria() {
  pararGaleria();
  if (reduceMotion || galeria.itens.length < 2) return;
  galeria.timer = setInterval(() => {
    if (!galeria.pausada && !document.hidden) mostrarSlide((galeria.atual + 1) % galeria.itens.length);
  }, 4500);
}

function montarGaleria(itens) {
  galeria.itens = itens || [];
  svcGallery.hidden = !galeria.itens.length;
  svcCaption.hidden = !galeria.itens.length;
  svcGallery.replaceChildren(...galeria.itens.map((g, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = g.nome;
    b.addEventListener("click", () => { mostrarSlide(i); iniciarGaleria(); });
    return b;
  }));
  if (galeria.itens.length) { mostrarSlide(0, false); iniciarGaleria(); } else { pararGaleria(); }
}

panel.addEventListener("pointerenter", () => { galeria.pausada = true; });
panel.addEventListener("pointerleave", () => { galeria.pausada = false; });
panel.addEventListener("focusin", () => { galeria.pausada = true; });
panel.addEventListener("focusout", () => { galeria.pausada = false; });

function selectTab(index, focus = false) {
  tabs.forEach((t, i) => {
    const on = i === index;
    t.classList.toggle("is-active", on);
    t.setAttribute("aria-selected", String(on));
    t.tabIndex = on ? 0 : -1;
  });
  if (focus) tabs[index].focus();
  panel.setAttribute("aria-labelledby", tabs[index].id);

  const s = SERVICOS[index];
  const apply = () => {
    montarGaleria(s.galeria);
    panel.classList.remove("is-swapping");
  };
  if (reduceMotion) return apply();
  panel.classList.add("is-swapping");
  setTimeout(apply, 220);
}

montarGaleria(SERVICOS[0].galeria);

tabs.forEach((t, i) => {
  t.addEventListener("click", () => selectTab(i));
  t.addEventListener("keydown", (e) => {
    const map = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    if (e.key in map) {
      e.preventDefault();
      selectTab((i + map[e.key] + tabs.length) % tabs.length, true);
    }
  });
});

/* ============================================================
   EFEITOS (GSAP + ScrollTrigger)
   Tudo fica estático se o sistema pedir "reduzir movimento"
   ou se o GSAP não carregar.
   ============================================================ */

// Divide um título em linhas (pelos <br>) para revelar linha a linha
function splitLines(el) {
  const parts = el.innerHTML.split(/<br\s*\/?>/i);
  el.innerHTML = parts.map((p) => `<span class="split-line"><span class="split-inner" style="display:inline-block">${p.trim()}</span></span>`).join("");
  return el.querySelectorAll(".split-inner");
}

// Divide em letras (para o nome no hero), mantendo o texto acessível
function splitChars(el) {
  el.setAttribute("aria-label", el.innerHTML.replace(/<br\s*\/?>/gi, " ").replace(/\s+/g, " ").trim());
  const parts = el.innerHTML.split(/<br\s*\/?>/i);
  el.innerHTML = parts.map((p) =>
    `<span class="split-line" aria-hidden="true">${[...p.trim()].map((c) => `<span class="split-char">${c}</span>`).join("")}</span>`
  ).join("");
  return el.querySelectorAll(".split-char");
}

// Divide em palavras (para o texto que "acende" com a rolagem)
function splitWords(el) {
  el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="split-word">${w}</span>`).join(" ");
  return el.querySelectorAll(".split-word");
}

function initMotion() {
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Barra de progresso
    gsap.to(".progress__bar", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });

    // Nav some ao descer e volta ao subir
    ScrollTrigger.create({
      start: 0, end: "max",
      onUpdate: (self) => nav.classList.toggle("is-hidden", self.direction === 1 && self.scroll() > window.innerHeight * 0.6),
    });

    // HERO: entrada
    const chars = splitChars(document.querySelector(".hero__wordmark"));
    gsap.timeline({ defaults: { ease: "expo.out" } })
      .from(".hero__media", { scale: 1.25, duration: 2.4, ease: "power3.out" }, 0)
      .from(".nav__logo, .nav__list li, .lang", { y: -30, opacity: 0, duration: 1, stagger: 0.06 }, 0.3)
      // parte de 150% para o acento (til do Ã) não aparecer sozinho antes da letra
      .from(chars, { yPercent: 150, rotate: 6, duration: 1.4, stagger: 0.045 }, 0.35)
      .from(".hero__tagline", { opacity: 0, y: 16, duration: 1 }, 0.9)
      .from(".hero__card", { opacity: 0, y: 60, duration: 1.2 }, 1.0)
      .from(".hero__actions .btn", { opacity: 0, y: 14, stagger: 0.08, duration: 0.8 }, 1.3);

    // HERO: parallax ao rolar
    const heroST = { trigger: ".hero", start: "top top", end: "bottom top", scrub: true };
    gsap.to(".hero__media img", { yPercent: 18, ease: "none", scrollTrigger: heroST });
    gsap.to(".hero__top", { yPercent: -45, opacity: 0.15, ease: "none", scrollTrigger: heroST });

    // Títulos de seção sobem linha a linha
    [".reveal-section__heading", ".services__title", ".process__title", ".work__title", ".about__title", ".contact__title"].forEach((sel) => {
      const el = document.querySelector(sel);
      gsap.from(splitLines(el), {
        yPercent: 140, duration: 1.2, ease: "expo.out", stagger: 0.1,
        scrollTrigger: { trigger: el, start: "top 85%" },
      });
    });

    // Objeto central: cresce ao entrar e escurece ao sair
    gsap.fromTo(".reveal-section__object", { scale: 0.78, opacity: 0.3 }, {
      scale: 1, opacity: 1, ease: "none",
      scrollTrigger: { trigger: ".reveal-section__object", start: "top bottom", end: "center center", scrub: true },
    });
    gsap.to(".reveal-section__object img", {
      opacity: 0.2, ease: "none",
      scrollTrigger: { trigger: ".reveal-section__object", start: "center center", end: "bottom top", scrub: true },
    });

    // Texto que acende palavra por palavra
    const words = splitWords(document.querySelector(".reveal-section__body"));
    gsap.fromTo(words, { opacity: 0.12 }, {
      opacity: 1, stagger: 0.1, ease: "none",
      scrollTrigger: { trigger: ".reveal-section__body", start: "top 85%", end: "bottom 50%", scrub: true },
    });

    // Serviços: abas entram em cascata, imagem abre como cortina
    gsap.from(".services__tab", {
      x: -40, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.08,
      scrollTrigger: { trigger: ".services__tabs", start: "top 85%" },
    });
    gsap.fromTo(".services__media", { clipPath: "inset(100% 0% 0% 0%)" }, {
      clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "expo.inOut",
      scrollTrigger: { trigger: ".services__panel", start: "top 80%" },
    });

    // Processo: seção trava e cada etapa sobe por cima da anterior (baralho)
    const process = document.querySelector(".process");
    const steps = gsap.utils.toArray(".process__step");
    process.classList.add("is-deck");
    gsap.set(steps.slice(1), { yPercent: 135, opacity: 0 });
    gsap.set(".process__card", { filter: "brightness(1)" }); // sem isso o GSAP parte de brilho 0 (card preto)
    const deck = gsap.timeline({
      defaults: { ease: "power2.out", duration: 1 },
      scrollTrigger: {
        trigger: process, start: "top top",
        end: () => `+=${(steps.length - 1) * window.innerHeight * 0.55}`,
        pin: true, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true,
      },
    });
    steps.forEach((step, i) => {
      if (i === 0) return;
      deck.to(step, { yPercent: 0, opacity: 1 }, i - 1);
      // os cards de trás sobem um pouco, encolhem e ficam levemente mais escuros
      steps.slice(0, i).forEach((prev, j) => {
        const depth = i - j;
        deck.to(prev.querySelector(".process__card"), {
          y: -depth * 20, scale: 1 - depth * 0.045, filter: `brightness(${1 - Math.min(depth, 3) * 0.12})`,
        }, i - 1);
      });
    });
    deck.to({}, { duration: 0.4 }); // pequena pausa no último card

    // Contato: imagem no título "brota", campos entram em cascata
    gsap.from(".pill-img", {
      scale: 0, rotate: -12, duration: 1.2, ease: "back.out(1.8)", delay: 0.3,
      scrollTrigger: { trigger: ".contact__title", start: "top 80%" },
    });

    // Entradas genéricas
    ScrollTrigger.batch(".process__lede, .services__copy, .stack__title, .about__photo, .about__text, .about__facts div, .contact__lede, .contact__links, .form .field, .form__submit, .footer__row", {
      start: "top 90%",
      onEnter: (els) => gsap.from(els, { opacity: 0, y: 30, duration: 1, ease: "expo.out", stagger: 0.08, overwrite: true, clearProps: "opacity,transform" }),
    });

    // Faixa de logos inclina conforme a velocidade da rolagem
    const skew = gsap.quickTo(".marquee__track", "skewX", { duration: 0.5, ease: "power3" });
    ScrollTrigger.create({
      trigger: ".stack", start: "top bottom", end: "bottom top",
      onUpdate: (self) => skew(gsap.utils.clamp(-12, 12, self.getVelocity() / -250)),
      onLeave: () => skew(0), onLeaveBack: () => skew(0),
    });

    return () => process.classList.remove("is-deck");
  });

  // Só desktop: rolagem horizontal dos projetos, botões ímã e brilho do cursor
  mm.add("(prefers-reduced-motion: no-preference) and (min-width: 768px)", () => {
    const section = document.querySelector(".work");
    const track = document.querySelector(".work__track");
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

    const pan = gsap.to(track, {
      x: () => -distance(), ease: "none",
      scrollTrigger: {
        trigger: section, start: "top top", end: () => `+=${distance()}`,
        pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true,
      },
    });

    gsap.utils.toArray(".work__card").forEach((card) => {
      gsap.from(card.querySelector(".work__meta"), {
        opacity: 0, y: 20, duration: 0.8, ease: "expo.out",
        scrollTrigger: { trigger: card, containerAnimation: pan, start: "left 75%" },
      });
    });
  });

  mm.add("(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)", () => {
    // Brilho quente seguindo o cursor
    const glow = document.querySelector(".glow");
    const gx = gsap.quickTo(glow, "x", { duration: 0.8, ease: "power3" });
    const gy = gsap.quickTo(glow, "y", { duration: 0.8, ease: "power3" });
    const onMove = (e) => { document.documentElement.classList.add("has-pointer"); gx(e.clientX); gy(e.clientY); };
    window.addEventListener("pointermove", onMove);

    // Botões com efeito ímã
    const cleanups = gsap.utils.toArray(".btn").map((btn) => {
      const bx = gsap.quickTo(btn, "x", { duration: 0.5, ease: "elastic.out(1, 0.4)" });
      const by = gsap.quickTo(btn, "y", { duration: 0.5, ease: "elastic.out(1, 0.4)" });
      const move = (e) => {
        const r = btn.getBoundingClientRect();
        bx((e.clientX - r.left - r.width / 2) * 0.35);
        by((e.clientY - r.top - r.height / 2) * 0.35);
      };
      const leave = () => { bx(0); by(0); };
      btn.addEventListener("pointermove", move);
      btn.addEventListener("pointerleave", leave);
      return () => { btn.removeEventListener("pointermove", move); btn.removeEventListener("pointerleave", leave); };
    });

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.classList.remove("has-pointer");
      cleanups.forEach((fn) => fn());
    };
  });

  // Recalcula depois que as imagens carregam (alturas mudam)
  window.addEventListener("load", () => ScrollTrigger.refresh());
}

// Nav: fundo ao sair do hero + item ativo por seção
const nav = document.querySelector(".nav");
const hero = document.getElementById("inicio");
new IntersectionObserver(([en]) => nav.classList.toggle("is-scrolled", !en.isIntersecting), {
  rootMargin: "-64px 0px 0px 0px",
}).observe(hero);

const navLinks = [...document.querySelectorAll(".nav__list a")];
const sectionObs = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return;
    navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${en.target.id}`));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
// observa todas as seções: nas que não estão no menu, nenhum item fica ativo
document.querySelectorAll("main section").forEach((s) => sectionObs.observe(s));

// Formulário: valida e abre o e-mail já preenchido
const form = document.getElementById("contact-form");
const status = document.getElementById("form-status");

function setError(fieldId, errId, invalid) {
  document.getElementById(fieldId).closest(".field").classList.toggle("has-error", invalid);
  document.getElementById(errId).hidden = !invalid;
  document.getElementById(fieldId).setAttribute("aria-invalid", String(invalid));
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const nome = form.nome.value.trim();
  const msg = form.mensagem.value.trim();
  const nomeErr = nome.length < 2;
  const servicoErr = !form.servico.value;
  const msgErr = msg.length < 10;
  setError("f-nome", "e-nome", nomeErr);
  setError("f-servico", "e-servico", servicoErr);
  setError("f-msg", "e-msg", msgErr);
  if (nomeErr || servicoErr || msgErr) {
    status.textContent = UI.confira;
    (nomeErr ? form.nome : servicoErr ? form.servico : form.mensagem).focus();
    return;
  }
  const vars = { nome, servico: form.servico.value, msg };
  const assunto = preencher(UI.assunto, vars);
  const corpo = preencher(UI.corpo, vars);
  window.location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
  status.textContent = UI.abrindo;
});

document.getElementById("ano").textContent = new Date().getFullYear();

// Voltar ao topo: o menu fica fixo e há seções travadas pela animação,
// então o link de âncora sozinho não sobe a página. Rola até o início de verdade.
document.getElementById("voltar-topo").addEventListener("click", (e) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  history.replaceState(null, "", "#inicio");
});
form.servico.addEventListener("change", () => setError("f-servico", "e-servico", false));

initMotion();
