// Motor de conversa do ChatBot da pizzaria.
//
// Funciona como uma máquina de estados: cada conversa guarda em que etapa está
// (escolhendo sabor, tamanho, bairro...) e o carrinho. A entrada do cliente pode ser
// um clique em botão/lista (vem com `id`, ex.: "pizza:calabresa") ou texto livre;
// o texto passa por um reconhecimento simples de intenção e de itens do cardápio.
//
// A resposta é uma lista de mensagens no formato do WhatsApp Business:
//   { tipo: "texto", texto }
//   { tipo: "botoes", texto, botoes: [{ id, titulo }] }            (até 3 botões)
//   { tipo: "lista", texto, botao, secoes: [{ titulo, linhas: [{ id, titulo, descricao }] }] }
//   { tipo: "imagem", url, legenda }

const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const norm = (s = "") => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

const INTENCOES = [
  { id: "inicio", termos: ["oi", "ola", "bom dia", "boa tarde", "boa noite", "menu", "inicio", "recomecar", "voltar"] },
  { id: "atendente", termos: ["atendente", "humano", "pessoa", "falar com alguem", "reclamacao", "reclamar"] },
  { id: "cancelar", termos: ["cancelar", "cancela", "desistir", "limpar carrinho"] },
  { id: "cardapio", termos: ["cardapio", "sabores", "sabor", "preco", "precos", "quanto custa", "valor"] },
  { id: "horario", termos: ["horario", "abre", "fecha", "funciona", "aberto", "que horas"] },
  { id: "entrega", termos: ["entrega", "taxa", "bairro", "frete", "demora", "tempo"] },
  { id: "promo", termos: ["promo", "promocao", "desconto", "oferta"] },
  { id: "pedido", termos: ["pedido", "pedir", "quero", "fazer pedido", "comprar", "pizza"] },
];

function intencao(texto) {
  const t = norm(texto);
  if (!t) return null;
  // Números do menu principal
  const menu = { 1: "pedido", 2: "cardapio", 3: "entrega", 4: "promo", 5: "atendente" };
  if (/^\d$/.test(t) && menu[t]) return menu[t];
  for (const i of INTENCOES) {
    if (i.termos.some((termo) => new RegExp(`(^|\\s)${termo}(\\s|$|[?!.,])`).test(t))) return i.id;
  }
  return null;
}

function acharPorTexto(lista, texto, campo = "nome") {
  const t = norm(texto);
  if (!t) return null;
  const n = Number(t);
  if (Number.isInteger(n) && n >= 1 && n <= lista.length) return lista[n - 1];
  return lista.find((x) => norm(x[campo]) === t) ||
    lista.find((x) => norm(x[campo]).includes(t) || t.includes(norm(x[campo]).split(" ")[0]));
}

export function criarBot(cardapio) {
  const { pizzas, bebidas, bairros, tamanhos } = cardapio;
  const totalCarrinho = (s) => s.carrinho.reduce((soma, i) => soma + i.preco, 0);

  const menuPrincipal = (texto = "Como posso te ajudar?") => ({
    tipo: "lista", texto, botao: "Ver opções",
    secoes: [{
      titulo: "Atendimento",
      linhas: [
        { id: "menu:pedido", titulo: "Fazer pedido", descricao: "Monte sua pizza aqui mesmo" },
        { id: "menu:cardapio", titulo: "Ver cardápio", descricao: "Sabores e preços" },
        { id: "menu:entrega", titulo: "Entrega e horário", descricao: "Bairros, taxas e tempo" },
        { id: "menu:promo", titulo: "Promoção da semana", descricao: "Oferta de terça e quarta" },
        { id: "menu:atendente", titulo: "Falar com atendente", descricao: "Chamo alguém da equipe" },
      ],
    }],
  });

  const listaPizzas = (texto = "Escolha o sabor:") => ({
    tipo: "lista", texto, botao: "Ver sabores",
    secoes: [{
      titulo: "Pizzas",
      linhas: pizzas.map((p) => ({ id: `pizza:${p.id}`, titulo: p.nome, descricao: `${p.descricao}. A partir de ${brl(p.precos.P)}` })),
    }],
  });

  const listaBebidas = () => ({
    tipo: "lista", texto: "Qual bebida?", botao: "Ver bebidas",
    secoes: [{ titulo: "Bebidas", linhas: bebidas.map((b) => ({ id: `beb:${b.id}`, titulo: b.nome, descricao: brl(b.preco) })) }],
  });

  const botoesTamanho = (pizza) => ({
    tipo: "botoes",
    texto: `*${pizza.nome}*\n${pizza.descricao}.\n\nQual tamanho?`,
    botoes: tamanhos.map((t) => ({ id: `tam:${t.id}`, titulo: `${t.nome} ${brl(pizza.precos[t.id])}` })),
  });

  const depoisDeAdicionar = (s, item) => ({
    tipo: "botoes",
    texto: `Anotado: *${item.nome}*.\nNo carrinho: ${s.carrinho.length} ${s.carrinho.length > 1 ? "itens" : "item"}, ${brl(totalCarrinho(s))}.`,
    botoes: [
      { id: "acao:mais", titulo: "Mais uma pizza" },
      { id: "acao:bebida", titulo: "Adicionar bebida" },
      { id: "acao:fechar", titulo: "Fechar pedido" },
    ],
  });

  const listaBairros = () => ({
    tipo: "lista", texto: "Para qual bairro?", botao: "Ver bairros",
    secoes: [{ titulo: "Entregamos em", linhas: bairros.map((b) => ({ id: `bairro:${b.id}`, titulo: b.nome, descricao: `Taxa ${brl(b.taxa)}` })) }],
  });

  const textoEntrega = () =>
    `*Entrega*\nTempo médio: ${cardapio.tempoEntrega}.\n` +
    bairros.map((b) => `${b.nome}: ${brl(b.taxa)}`).join("\n") +
    `\n\nOutros bairros: retirada no balcão.\n\n*Horário*\n${cardapio.horarios}`;

  function resumo(s) {
    const taxa = s.entrega?.taxa || 0;
    const linhas = s.carrinho.map((i) => `• ${i.nome}  ${brl(i.preco)}`).join("\n");
    const onde = s.entrega.tipo === "entrega" ? `Entrega em ${s.entrega.bairro}: ${s.entrega.endereco}\nTaxa: ${brl(taxa)}` : "Retirada no balcão";
    const troco = s.troco ? `\nTroco para ${brl(s.troco)}` : "";
    return {
      tipo: "botoes",
      texto: `*Confere seu pedido, ${s.nome.split(" ")[0]}?*\n\n${linhas}\n\n${onde}\nPagamento: ${s.pagamento}${troco}\n\n*Total: ${brl(totalCarrinho(s) + taxa)}*`,
      botoes: [{ id: "conf:sim", titulo: "Confirmar pedido" }, { id: "conf:alterar", titulo: "Alterar" }, { id: "conf:cancelar", titulo: "Cancelar" }],
    };
  }

  const pedirPagamento = () => ({
    tipo: "botoes", texto: "Como vai pagar?",
    botoes: [{ id: "pag:Pix", titulo: "Pix" }, { id: "pag:Cartão", titulo: "Cartão" }, { id: "pag:Dinheiro", titulo: "Dinheiro" }],
  });

  function reiniciar(s) {
    Object.assign(s, { estado: "menu", carrinho: [], pizza: null, entrega: null, pagamento: null, troco: null });
  }

  // Intenções que funcionam em qualquer etapa da conversa
  function global(s, id) {
    switch (id) {
      case "inicio":
        s.estado = "menu";
        return [menuPrincipal(s.carrinho.length ? `Seu carrinho continua com ${s.carrinho.length} item(ns). O que deseja?` : "Como posso te ajudar?")];
      case "cardapio":
        return [
          { tipo: "imagem", url: "img/pizza.jpg", legenda: "Pizzas no forno a lenha, massa de fermentação natural." },
          { tipo: "texto", texto: "*Cardápio*\n" + pizzas.map((p) => `${p.nome}: P ${brl(p.precos.P)}  M ${brl(p.precos.M)}  G ${brl(p.precos.G)}`).join("\n") + "\n\n*Bebidas*\n" + bebidas.map((b) => `${b.nome}: ${brl(b.preco)}`).join("\n") },
          { tipo: "botoes", texto: "Quer pedir agora?", botoes: [{ id: "menu:pedido", titulo: "Fazer pedido" }, { id: "menu:inicio", titulo: "Voltar ao menu" }] },
        ];
      case "horario":
      case "entrega":
        return [{ tipo: "texto", texto: textoEntrega() }, { tipo: "botoes", texto: "Posso ajudar em mais alguma coisa?", botoes: [{ id: "menu:pedido", titulo: "Fazer pedido" }, { id: "menu:inicio", titulo: "Voltar ao menu" }] }];
      case "promo":
        return [{ tipo: "botoes", texto: `*Promoção da semana*\n${cardapio.promocao}`, botoes: [{ id: "menu:pedido", titulo: "Quero pedir" }, { id: "menu:inicio", titulo: "Voltar ao menu" }] }];
      case "atendente":
        s.estado = "atendente";
        s.atendente = true;
        return [{ tipo: "texto", texto: "Certo! Chamei a Larissa, da nossa equipe. Ela já está vendo esta conversa e responde em instantes. 🙂\n\nSe quiser voltar ao atendimento automático, é só digitar *menu*." }];
      case "cancelar":
        reiniciar(s);
        return [menuPrincipal("Pedido cancelado e carrinho limpo. Posso ajudar com outra coisa?")];
      case "pedido":
        s.estado = "sabor";
        return [listaPizzas(s.carrinho.length ? "Mais uma! Escolha o sabor:" : "Bora! Escolha o sabor da pizza:")];
      default:
        return null;
    }
  }

  // Trata a entrada conforme a etapa atual
  function etapa(s, { id, texto }, salvarPedido) {
    const [tipo, valor] = (id || "").split(":");

    switch (s.estado) {
      case "sabor": {
        const pizza = tipo === "pizza" ? pizzas.find((p) => p.id === valor) : acharPorTexto(pizzas, texto);
        if (!pizza) return [listaPizzas("Não achei esse sabor. Escolha na lista:")];
        s.pizza = pizza;
        s.estado = "tamanho";
        return [botoesTamanho(pizza)];
      }

      case "tamanho": {
        const t = norm(texto);
        const tam = tipo === "tam" ? tamanhos.find((x) => x.id === valor)
          : tamanhos.find((x) => t === norm(x.id) || t.startsWith(norm(x.nome)) || t === norm(x.nome[0]));
        if (!tam) return [botoesTamanho(s.pizza)];
        const item = { nome: `Pizza ${tam.id} ${s.pizza.nome}`, preco: s.pizza.precos[tam.id] };
        s.carrinho.push(item);
        s.estado = "carrinho";
        return [depoisDeAdicionar(s, item)];
      }

      case "carrinho": {
        const t = norm(texto);
        if (id === "acao:mais" || /mais|outra/.test(t)) { s.estado = "sabor"; return [listaPizzas("Mais uma! Escolha o sabor:")]; }
        if (id === "acao:bebida" || /bebida|refri|suco|agua|guarana|coca/.test(t)) {
          const direto = acharPorTexto(bebidas, texto);
          if (direto && !id) { s.carrinho.push({ nome: direto.nome, preco: direto.preco }); return [depoisDeAdicionar(s, direto)]; }
          s.estado = "bebida"; return [listaBebidas()];
        }
        if (id === "acao:fechar" || /fechar|finalizar|so isso|e so|pronto/.test(t)) {
          s.estado = "modo";
          return [{ tipo: "botoes", texto: "Vai ser entrega ou retirada no balcão?", botoes: [{ id: "modo:entrega", titulo: "Entrega" }, { id: "modo:retirada", titulo: "Retirada" }] }];
        }
        return [depoisDeAdicionar(s, s.carrinho.at(-1))];
      }

      case "bebida": {
        const b = tipo === "beb" ? bebidas.find((x) => x.id === valor) : acharPorTexto(bebidas, texto);
        if (!b) return [listaBebidas()];
        s.carrinho.push({ nome: b.nome, preco: b.preco });
        s.estado = "carrinho";
        return [depoisDeAdicionar(s, b)];
      }

      case "modo": {
        const t = norm(texto);
        if (id === "modo:entrega" || t.includes("entrega")) { s.estado = "bairro"; return [listaBairros()]; }
        if (id === "modo:retirada" || /retir|buscar|balcao/.test(t)) {
          s.entrega = { tipo: "retirada" };
          s.estado = "nome";
          return [{ tipo: "texto", texto: `Perfeito, você retira em: ${cardapio.endereco}.\n\nQual o seu nome?` }];
        }
        return [{ tipo: "botoes", texto: "Entrega ou retirada?", botoes: [{ id: "modo:entrega", titulo: "Entrega" }, { id: "modo:retirada", titulo: "Retirada" }] }];
      }

      case "bairro": {
        const b = tipo === "bairro" ? bairros.find((x) => x.id === valor) : acharPorTexto(bairros, texto);
        if (!b) {
          return [{ tipo: "botoes", texto: "Esse bairro fica fora da nossa área de entrega, infelizmente. Quer retirar no balcão?", botoes: [{ id: "modo:retirada", titulo: "Retirar no balcão" }, { id: "menu:bairros", titulo: "Ver bairros" }] }];
        }
        s.entrega = { tipo: "entrega", bairro: b.nome, taxa: b.taxa };
        s.estado = "endereco";
        return [{ tipo: "texto", texto: `${b.nome}, taxa de ${brl(b.taxa)}.\n\nAgora me diga a *rua, número e um ponto de referência*.` }];
      }

      case "endereco": {
        if (!texto || texto.trim().length < 8 || !/\d/.test(texto)) {
          return [{ tipo: "texto", texto: "Preciso da rua com o número, por exemplo: *Rua Frei Caneca, 245, perto da padaria*." }];
        }
        s.entrega.endereco = texto.trim().slice(0, 140);
        s.estado = "nome";
        return [{ tipo: "texto", texto: "Anotado! E qual o seu nome?" }];
      }

      case "nome": {
        const nome = (texto || "").trim();
        if (nome.length < 2 || /\d/.test(nome)) return [{ tipo: "texto", texto: "Me diz só o seu nome, por favor." }];
        s.nome = nome.replace(/\b\w/g, (c) => c.toUpperCase()).slice(0, 60);
        s.estado = "pagamento";
        return [pedirPagamento()];
      }

      case "pagamento": {
        const t = norm(texto);
        const forma = tipo === "pag" ? valor : /pix/.test(t) ? "Pix" : /cart|credito|debito/.test(t) ? "Cartão" : /dinheiro|especie/.test(t) ? "Dinheiro" : null;
        if (!forma) return [pedirPagamento()];
        s.pagamento = forma === "Cartão" ? (s.entrega.tipo === "entrega" ? "Cartão na entrega" : "Cartão na retirada") : forma;
        if (forma === "Dinheiro") {
          s.estado = "troco";
          return [{ tipo: "botoes", texto: "Precisa de troco? Se sim, digite para quanto (ex.: 100).", botoes: [{ id: "troco:nao", titulo: "Não preciso" }] }];
        }
        s.estado = "confirmar";
        return [resumo(s)];
      }

      case "troco": {
        const total = totalCarrinho(s) + (s.entrega.taxa || 0);
        if (id === "troco:nao" || /nao|sem troco/.test(norm(texto))) s.troco = null;
        else {
          const v = Number(String(texto).replace(/[^\d,.]/g, "").replace(",", "."));
          if (!v || v < total) return [{ tipo: "texto", texto: `O total é ${brl(total)}. Para quanto precisa de troco?` }];
          s.troco = v;
        }
        s.estado = "confirmar";
        return [resumo(s)];
      }

      case "confirmar": {
        const t = norm(texto);
        if (id === "conf:sim" || /^(sim|confirmo|confirmar|isso|ok|pode)/.test(t)) {
          const pedido = salvarPedido(s);
          const msgs = [{ tipo: "texto", texto: `Pedido *#${pedido.numero}* confirmado! ✅\n\n${pedido.entrega.tipo === "entrega" ? `Chega em ${cardapio.tempoEntrega}.` : "Fica pronto em 25 a 30 minutos."} Vou te avisando por aqui quando sair do forno.` }];
          if (s.pagamento === "Pix") {
            msgs.push({ tipo: "texto", texto: `*Pix copia e cola* (demonstração)\n00020126360014BR.GOV.BCB.PIX0114FORNOTOMAZZI${pedido.numero}5204000053039865406${pedido.total.toFixed(2)}5802BR6007CARUARU` });
          }
          reiniciar(s);
          return msgs;
        }
        if (id === "conf:alterar" || /alterar|mudar|trocar/.test(t)) {
          s.carrinho = [];
          s.estado = "sabor";
          return [listaPizzas("Sem problema, vamos montar de novo. Escolha o sabor:")];
        }
        if (id === "conf:cancelar") return global(s, "cancelar");
        return [resumo(s)];
      }

      case "atendente":
        return [{ tipo: "texto", texto: "A Larissa já foi avisada e responde em instantes. Para voltar ao robô, digite *menu*." }];

      default: // "menu"
        return [menuPrincipal("Não entendi muito bem. Escolha uma opção:")];
    }
  }

  return {
    boasVindas(s) {
      reiniciar(s);
      return [
        { tipo: "texto", texto: `Olá! 👋 Aqui é o atendimento do *${cardapio.nome}*, pizza no forno a lenha em Caruaru.` },
        menuPrincipal("Escolha uma opção ou escreva o que precisa:"),
      ];
    },

    responder(s, entrada, salvarPedido) {
      const [tipo, valor] = (entrada.id || "").split(":");
      if (tipo === "menu") {
        if (valor === "bairros") { s.estado = "bairro"; return [listaBairros()]; }
        return global(s, valor);
      }
      if (entrada.id) return etapa(s, entrada, salvarPedido);

      // Texto livre
      const i = intencao(entrada.texto);
      // "menu", "cancelar" e "atendente" funcionam em qualquer etapa
      if (["inicio", "cancelar", "atendente"].includes(i)) return global(s, i);
      if (s.estado === "atendente") return etapa(s, entrada, salvarPedido);

      // Dúvidas (cardápio, horário, entrega, promoção) só desviam quando não há pergunta específica pendente
      const podeDesviar = ["menu", "sabor", "carrinho"].includes(s.estado);
      if (i && i !== "pedido" && podeDesviar) return global(s, i);

      if (s.estado === "menu") {
        // Atalho: "quero uma calabresa grande" já escolhe sabor e tamanho
        const pizza = acharPorTexto(pizzas, entrada.texto.replace(/quero|uma|pizza|pedir|de/gi, " ").trim());
        if (pizza && !/^\d+$/.test(norm(entrada.texto))) {
          s.pizza = pizza;
          s.estado = "tamanho";
          const tam = tamanhos.find((t) => norm(entrada.texto).includes(norm(t.nome)));
          return tam ? etapa(s, { id: `tam:${tam.id}` }, salvarPedido) : [botoesTamanho(pizza)];
        }
        if (i === "pedido") return global(s, "pedido");
      }
      return etapa(s, entrada, salvarPedido);
    },
  };
}
