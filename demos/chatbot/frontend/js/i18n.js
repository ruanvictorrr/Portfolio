// Traduções da demo do ChatBot: [português, inglês, espanhol, português de Portugal (só se mudar)]
// Como funciona: ../../shared/js/idioma.js
// As mensagens do robô chegam da API em português; chat.js passa cada uma por
// traduzirMensagem() antes de desenhar (texto, botões e listas), linha a linha.

import { iniciarTraducao, t, IDIOMA } from "../../shared/js/idioma.js";

const TAM = {
  en: { P: "Small", M: "Medium", G: "Large" },
  es: { P: "pequeña", M: "mediana", G: "grande" },
  "pt-PT": { P: "P", M: "M", G: "G" },
}[IDIOMA];

// "Pizza G Margherita" -> "Large Margherita pizza"
const nomePizza = (_, tam, nome) => {
  if (IDIOMA === "en") return `${TAM[tam]} ${t(nome)} pizza`;
  if (IDIOMA === "es") return `Pizza ${TAM[tam]} ${t(nome)}`;
  return `Pizza ${tam} ${t(nome)}`;
};

iniciarTraducao([
  // Página
  ["ChatBot de WhatsApp | Forno Tomazzi", "WhatsApp ChatBot | Forno Tomazzi", "ChatBot de WhatsApp | Forno Tomazzi"],
  ["Demonstração de ChatBot de WhatsApp para uma pizzaria de Caruaru: pedido, carrinho, entrega e pagamento atendidos 24 horas.", "WhatsApp ChatBot demo for a pizzeria in Caruaru: orders, cart, delivery and payment handled 24/7.", "Demo de ChatBot de WhatsApp para una pizzería de Caruaru: pedidos, carrito, envío y pago atendidos las 24 horas.", "Demonstração de ChatBot de WhatsApp para uma pizzaria de Caruaru: encomendas, carrinho, entrega e pagamento atendidos 24 horas."],
  ["Demonstração de ChatBot de WhatsApp. Pizzaria e dados fictícios.", "WhatsApp ChatBot demo. Fictional pizzeria and data.", "Demo de ChatBot de WhatsApp. Pizzería y datos ficticios."],
  ["Atendimento que não dorme.", "Customer service that never sleeps.", "Atención que no duerme."],
  ["Converse com o robô da Forno Tomazzi como se fosse um cliente. Ele monta o pedido, calcula a entrega e chama uma pessoa quando precisa.", "Chat with Forno Tomazzi's bot as if you were a customer. It builds the order, works out delivery and calls in a person when needed. It understands English too.", "Conversa con el bot de Forno Tomazzi como si fueras un cliente. Arma el pedido, calcula el envío y llama a una persona cuando hace falta. También entiende español.", "Converse com o robô da Forno Tomazzi como se fosse um cliente. Ele monta a encomenda, calcula a entrega e chama uma pessoa quando é preciso."],
  ["Experimente escrever", "Try typing", "Prueba escribir", "Experimente escrever"],
  ["quero uma calabresa grande", "I want a large calabresa", "quiero una calabresa grande"],
  ["qual o horário?", "what time do you open?", "¿a qué hora abren?", "qual é o horário?"],
  ["tem promoção?", "any deals?", "¿tienen promociones?", "há promoções?"],
  ["falar com atendente", "talk to a person", "hablar con una persona", "falar com um assistente"],
  ["Painel da pizzaria", "Pizzeria dashboard", "Panel de la pizzería"],
  ["ao vivo", "live", "en vivo", "em direto"],
  ["Conversas hoje", "Chats today", "Conversaciones hoy"],
  ["Pedidos fechados pelo robô", "Orders closed by the bot", "Pedidos cerrados por el bot", "Encomendas fechadas pelo robô"],
  ["Passadas para a equipe", "Handed to the team", "Pasadas al equipo", "Passadas para a equipa"],
  ["Recebido", "Received", "Recibido"],
  ["No forno", "In the oven", "En el horno"],
  ["Saiu para entrega", "Out for delivery", "Salió para entrega", "Saiu para entrega"],
  ["Entregue", "Delivered", "Entregado"],
  ["Simulação do WhatsApp", "WhatsApp simulation", "Simulación de WhatsApp"],
  ["conta comercial", "business account", "cuenta de empresa", "conta empresarial"],
  ["online", "online", "en línea"],
  ["digitando...", "typing...", "escribiendo...", "a escrever..."],
  ["Hoje", "Today", "Hoy"],
  ["Esta empresa usa um assistente automático para responder.", "This business uses an automated assistant to reply.", "Esta empresa usa un asistente automático para responder."],
  ["Conversa", "Chat", "Conversación"],
  ["Mensagem", "Message", "Mensaje"],
  ["Enviar", "Send", "Enviar"],
  ["Opções", "Options", "Opciones"],
  ["Recomeçar conversa", "Restart chat", "Reiniciar conversación", "Recomeçar conversa"],
  ["Fechar", "Close", "Cerrar"],
  ["Sem conexão com o servidor.", "Can't reach the server.", "Sin conexión con el servidor.", "Sem ligação ao servidor."],
  ["Algo deu errado.", "Something went wrong.", "Algo salió mal.", "Algo correu mal."],
  ["Algo deu errado nesta demonstração.", "Something went wrong in this demo.", "Algo salió mal en esta demo.", "Algo correu mal nesta demonstração."],
  ["Conversa expirada. Recarregue a página.", "Chat expired. Please reload the page.", "Conversación expirada. Recarga la página.", "Conversa expirada. Recarregue a página."],
  ["Mensagem vazia.", "Empty message.", "Mensaje vacío."],

  // Cardápio
  ["Margherita", "Margherita", "Margherita"],
  ["Calabresa acebolada", "Calabresa sausage and onion", "Calabresa con cebolla", "Calabresa com cebola"],
  ["Carne de sol com coalho", "Sun-dried beef and coalho cheese", "Carne de sol con queso coalho"],
  ["Frango com catupiry", "Chicken and catupiry", "Pollo con catupiry"],
  ["Portuguesa", "Portuguese", "Portuguesa"],
  ["Quatro queijos", "Four cheese", "Cuatro quesos"],
  ["Banana com canela", "Banana and cinnamon", "Banana con canela"],
  ["Tomate, muçarela de búfala e manjericão", "Tomato, buffalo mozzarella and basil", "Tomate, mozzarella de búfala y albahaca", "Tomate, mozarela de búfala e manjericão"],
  ["Calabresa artesanal, cebola roxa e azeitona", "Artisan calabresa sausage, red onion and olives", "Calabresa artesanal, cebolla morada y aceitunas", "Calabresa artesanal, cebola roxa e azeitonas"],
  ["Carne de sol desfiada, queijo coalho e cebola caramelizada", "Shredded sun-dried beef, coalho cheese and caramelized onion", "Carne de sol desmechada, queso coalho y cebolla caramelizada"],
  ["Frango desfiado temperado e catupiry original", "Seasoned shredded chicken and original catupiry cheese", "Pollo desmechado sazonado y catupiry original"],
  ["Presunto, ovo, cebola, ervilha e azeitona", "Ham, egg, onion, peas and olives", "Jamón, huevo, cebolla, arvejas y aceitunas", "Fiambre, ovo, cebola, ervilhas e azeitonas"],
  ["Muçarela, gorgonzola, parmesão e coalho", "Mozzarella, gorgonzola, parmesan and coalho", "Mozzarella, gorgonzola, parmesano y coalho", "Mozarela, gorgonzola, parmesão e coalho"],
  ["Doce: banana, açúcar, canela e leite condensado", "Sweet: banana, sugar, cinnamon and condensed milk", "Dulce: banana, azúcar, canela y leche condensada"],
  ["Guaraná 2 litros", "Guaraná 2 liters", "Guaraná 2 litros"],
  ["Coca-Cola 2 litros", "Coca-Cola 2 liters", "Coca-Cola 2 litros"],
  ["Suco de cajá 1 litro", "Cajá juice 1 liter", "Jugo de cajá 1 litro", "Sumo de cajá 1 litro"],
  ["Água mineral 500 ml", "Mineral water 500 ml", "Agua mineral 500 ml"],
  ["Pequena", "Small", "Pequeña"],
  ["Média", "Medium", "Mediana"],
  ["Grande", "Large", "Grande"],
  [/^Pizza (P|M|G) ([^,.]+)$/, nomePizza],
  [/^(Pequena|Média|Grande) (R\$.+)$/, "$t1 $2", "$t1 $2", "$1 $2"],
  ["40 a 50 minutos", "40 to 50 minutes", "40 a 50 minutos"],
  ["Terça a domingo, das 18h às 23h30. Segunda fechado.", "Tuesday to Sunday, 6 pm to 11:30 pm. Closed on Mondays.", "De martes a domingo, de 18 a 23:30 h. Lunes cerrado.", "Terça a domingo, das 18h às 23h30. Encerrado à segunda."],
  ["Terça e quarta: pizza grande de qualquer sabor salgado + Guaraná 2 litros por R$ 64,90.", "Tuesday and Wednesday: any large savory pizza + 2-liter Guaraná for R$ 64.90.", "Martes y miércoles: pizza grande de cualquier sabor salado + Guaraná de 2 litros por R$ 64,90.", "Terça e quarta: pizza grande de qualquer sabor salgado + Guaraná de 2 litros por R$ 64,90."],

  // Mensagens do robô (cada linha)
  [/^Olá! 👋 Aqui é o atendimento do \*(.+)\*, pizza no forno a lenha em Caruaru\.$/, "Hi! 👋 This is *$1* customer service, wood-fired pizza in Caruaru.", "¡Hola! 👋 Esta es la atención de *$1*, pizza al horno de leña en Caruaru.", "Olá! 👋 Aqui é o atendimento da *$1*, pizza em forno a lenha em Caruaru."],
  ["Escolha uma opção ou escreva o que precisa:", "Pick an option or type what you need:", "Elige una opción o escribe lo que necesitas:", "Escolha uma opção ou escreva o que precisa:"],
  ["Como posso te ajudar?", "How can I help you?", "¿Cómo te puedo ayudar?", "Como posso ajudar?"],
  [/^Seu carrinho continua com (\d+) item\(ns\)\. O que deseja\?$/, "Your cart still has $1 item(s). What would you like?", "Tu carrito sigue con $1 artículo(s). ¿Qué deseas?", "O seu carrinho continua com $1 artigo(s). O que deseja?"],
  ["Pedido cancelado e carrinho limpo. Posso ajudar com outra coisa?", "Order cancelled and cart cleared. Can I help with anything else?", "Pedido cancelado y carrito vacío. ¿Te ayudo con otra cosa?", "Encomenda cancelada e carrinho limpo. Posso ajudar com outra coisa?"],
  ["Não entendi muito bem. Escolha uma opção:", "I didn't quite get that. Pick an option:", "No entendí muy bien. Elige una opción:", "Não percebi muito bem. Escolha uma opção:"],
  ["Ver opções", "See options", "Ver opciones"],
  ["Atendimento", "Customer service", "Atención"],
  ["Fazer pedido", "Place an order", "Hacer pedido", "Fazer encomenda"],
  ["Monte sua pizza aqui mesmo", "Build your pizza right here", "Arma tu pizza aquí mismo", "Monte a sua pizza aqui mesmo"],
  ["Ver cardápio", "See the menu", "Ver el menú", "Ver ementa"],
  ["Sabores e preços", "Flavors and prices", "Sabores y precios"],
  ["Entrega e horário", "Delivery and hours", "Envío y horario"],
  ["Bairros, taxas e tempo", "Neighborhoods, fees and timing", "Barrios, tarifas y tiempo"],
  ["Promoção da semana", "Deal of the week", "Promoción de la semana"],
  ["Oferta de terça e quarta", "Tuesday and Wednesday offer", "Oferta de martes y miércoles"],
  ["Falar com atendente", "Talk to a person", "Hablar con una persona", "Falar com um assistente"],
  ["Chamo alguém da equipe", "I'll get someone from the team", "Llamo a alguien del equipo", "Chamo alguém da equipa"],
  ["Escolha o sabor:", "Choose a flavor:", "Elige el sabor:"],
  ["Mais uma! Escolha o sabor:", "One more! Choose a flavor:", "¡Una más! Elige el sabor:"],
  ["Bora! Escolha o sabor da pizza:", "Let's go! Choose your pizza flavor:", "¡Vamos! Elige el sabor de la pizza:", "Vamos a isso! Escolha o sabor da pizza:"],
  ["Não achei esse sabor. Escolha na lista:", "I couldn't find that flavor. Pick one from the list:", "No encontré ese sabor. Elige de la lista:", "Não encontrei esse sabor. Escolha na lista:"],
  ["Sem problema, vamos montar de novo. Escolha o sabor:", "No problem, let's start again. Choose a flavor:", "Sin problema, armémoslo de nuevo. Elige el sabor:", "Sem problema, vamos montar de novo. Escolha o sabor:"],
  ["Ver sabores", "See flavors", "Ver sabores"],
  ["Pizzas", "Pizzas", "Pizzas"],
  [/^(.+)\. A partir de (.+)$/, "$t1. From $2", "$t1. Desde $2", "$t1. Desde $2"],
  ["Qual tamanho?", "What size?", "¿Qué tamaño?"],
  ["Qual bebida?", "Which drink?", "¿Qué bebida?"],
  ["Ver bebidas", "See drinks", "Ver bebidas"],
  ["Bebidas", "Drinks", "Bebidas"],
  ["*Bebidas*", "*Drinks*", "*Bebidas*"],
  [/^Anotado: \*(.+)\*\.$/, "Got it: *$t1*.", "Anotado: *$t1*.", "Anotado: *$t1*."],
  [/^No carrinho: (\d+) (itens|item), (.+)\.$/, (_, n, __, v) => `In your cart: ${n} ${n === "1" ? "item" : "items"}, ${v}.`, (_, n, __, v) => `En el carrito: ${n} ${n === "1" ? "artículo" : "artículos"}, ${v}.`, (_, n, __, v) => `No carrinho: ${n} ${n === "1" ? "artigo" : "artigos"}, ${v}.`],
  ["Mais uma pizza", "Another pizza", "Otra pizza", "Mais uma pizza"],
  ["Adicionar bebida", "Add a drink", "Agregar bebida", "Adicionar bebida"],
  ["Fechar pedido", "Check out", "Cerrar pedido", "Fechar encomenda"],
  ["Para qual bairro?", "Which neighborhood?", "¿Para qué barrio?"],
  ["Ver bairros", "See neighborhoods", "Ver barrios"],
  ["Entregamos em", "We deliver to", "Entregamos en"],
  [/^Taxa (R\$.+)$/, "Fee $1", "Tarifa $1"],
  ["*Entrega*", "*Delivery*", "*Envío*"],
  [/^Tempo médio: (.+)\.$/, "Average time: $t1.", "Tiempo promedio: $t1.", "Tempo médio: $t1."],
  ["Outros bairros: retirada no balcão.", "Other neighborhoods: pick up at the counter.", "Otros barrios: retiro en el mostrador.", "Outros bairros: levantamento ao balcão."],
  ["*Horário*", "*Hours*", "*Horario*"],
  ["Pizzas no forno a lenha, massa de fermentação natural.", "Wood-fired pizzas, naturally fermented dough.", "Pizzas al horno de leña, masa de fermentación natural.", "Pizzas em forno a lenha, massa de fermentação natural."],
  ["*Cardápio*", "*Menu*", "*Menú*", "*Ementa*"],
  [/^(.+): P (R\$ ?[\d.,]+)\s+M (R\$ ?[\d.,]+)\s+G (R\$ ?[\d.,]+)$/, "$t1: S $2  M $3  L $4", "$t1: P $2  M $3  G $4", "$t1: P $2  M $3  G $4"],
  ["Quer pedir agora?", "Want to order now?", "¿Quieres pedir ahora?", "Quer encomendar agora?"],
  ["Voltar ao menu", "Back to menu", "Volver al menú"],
  ["Posso ajudar em mais alguma coisa?", "Anything else I can help with?", "¿Te ayudo con algo más?", "Posso ajudar em mais alguma coisa?"],
  ["*Promoção da semana*", "*Deal of the week*", "*Promoción de la semana*"],
  ["Quero pedir", "I want to order", "Quiero pedir", "Quero encomendar"],
  ["Certo! Chamei a Larissa, da nossa equipe. Ela já está vendo esta conversa e responde em instantes. 🙂", "Sure! I've called Larissa from our team. She's already looking at this chat and will reply shortly. 🙂", "¡Listo! Llamé a Larissa, de nuestro equipo. Ya está viendo esta conversación y responde en un momento. 🙂", "Certo! Chamei a Larissa, da nossa equipa. Ela já está a ver esta conversa e responde dentro de instantes. 🙂"],
  ["Se quiser voltar ao atendimento automático, é só digitar *menu*.", "To go back to the automated assistant, just type *menu*.", "Si quieres volver a la atención automática, solo escribe *menu*.", "Se quiser voltar ao atendimento automático, basta escrever *menu*."],
  ["A Larissa já foi avisada e responde em instantes. Para voltar ao robô, digite *menu*.", "Larissa has been notified and will reply shortly. To go back to the bot, type *menu*.", "Larissa ya fue avisada y responde en un momento. Para volver al bot, escribe *menu*.", "A Larissa já foi avisada e responde dentro de instantes. Para voltar ao robô, escreva *menu*."],
  ["Vai ser entrega ou retirada no balcão?", "Delivery or pick up at the counter?", "¿Es para envío o retiro en el mostrador?", "Vai ser entrega ou levantamento ao balcão?"],
  ["Entrega ou retirada?", "Delivery or pick up?", "¿Envío o retiro?", "Entrega ou levantamento?"],
  ["Entrega", "Delivery", "Envío"],
  ["Retirada", "Pick up", "Retiro", "Levantamento"],
  [/^Perfeito, você retira em: (.+)\.$/, "Perfect, you can pick it up at: $1.", "Perfecto, lo retiras en: $1.", "Perfeito, pode levantar em: $1."],
  ["Qual o seu nome?", "What's your name?", "¿Cuál es tu nombre?", "Qual é o seu nome?"],
  ["Esse bairro fica fora da nossa área de entrega, infelizmente. Quer retirar no balcão?", "Sorry, that neighborhood is outside our delivery area. Want to pick up at the counter?", "Lamentablemente, ese barrio está fuera de nuestra zona de envío. ¿Quieres retirar en el mostrador?", "Infelizmente, esse bairro fica fora da nossa área de entrega. Quer levantar ao balcão?"],
  ["Retirar no balcão", "Pick up at the counter", "Retirar en el mostrador", "Levantar ao balcão"],
  [/^(.+), taxa de (.+)\.$/, "$1, fee of $2.", "$1, tarifa de $2.", "$1, taxa de $2."],
  ["Agora me diga a *rua, número e um ponto de referência*.", "Now tell me the *street, number and a landmark*.", "Ahora dime la *calle, número y un punto de referencia*.", "Agora diga-me a *rua, número e um ponto de referência*."],
  ["Preciso da rua com o número, por exemplo: *Rua Frei Caneca, 245, perto da padaria*.", "I need the street and number, for example: *Rua Frei Caneca, 245, near the bakery*.", "Necesito la calle con el número, por ejemplo: *Rua Frei Caneca, 245, cerca de la panadería*.", "Preciso da rua com o número, por exemplo: *Rua Frei Caneca, 245, perto da padaria*."],
  ["Anotado! E qual o seu nome?", "Got it! And what's your name?", "¡Anotado! ¿Y cuál es tu nombre?", "Anotado! E qual é o seu nome?"],
  ["Me diz só o seu nome, por favor.", "Just your name, please.", "Dime solo tu nombre, por favor.", "Diga-me só o seu nome, por favor."],
  ["Como vai pagar?", "How will you pay?", "¿Cómo vas a pagar?"],
  ["Pix", "Pix", "Pix"],
  ["Cartão", "Card", "Tarjeta"],
  ["Dinheiro", "Cash", "Efectivo", "Numerário"],
  ["Cartão na entrega", "Card on delivery", "Tarjeta al recibir", "Cartão na entrega"],
  ["Cartão na retirada", "Card at pick up", "Tarjeta al retirar", "Cartão no levantamento"],
  ["Precisa de troco? Se sim, digite para quanto (ex.: 100).", "Need change? If so, type the amount you'll pay with (e.g. 100).", "¿Necesitas cambio? Si es así, escribe con cuánto pagas (ej.: 100).", "Precisa de troco? Se sim, escreva para quanto (ex.: 100)."],
  ["Não preciso", "No need", "No hace falta", "Não preciso"],
  [/^O total é (.+)\. Para quanto precisa de troco\?$/, "The total is $1. How much will you pay with?", "El total es $1. ¿Con cuánto vas a pagar?", "O total é $1. Para quanto precisa de troco?"],
  [/^\*Confere seu pedido, (.+)\?\*$/, "*Can you check your order, $1?*", "*¿Revisas tu pedido, $1?*", "*Confirma a sua encomenda, $1?*"],
  [/^• (.+?)\s+(R\$ ?[\d.,]+)$/, "• $t1  $2", "• $t1  $2", "• $t1  $2"],
  [/^Entrega em (.+?): (.+)$/, "Delivery to $1: $2", "Envío a $1: $2", "Entrega em $1: $2"],
  [/^Taxa: (.+)$/, "Fee: $1", "Tarifa: $1"],
  ["Retirada no balcão", "Pick up at the counter", "Retiro en el mostrador", "Levantamento ao balcão"],
  [/^Pagamento: (.+)$/, "Payment: $t1", "Pago: $t1", "Pagamento: $t1"],
  [/^Troco para (.+)$/, "Change for $1", "Cambio para $1"],
  [/^\*Total: (.+)\*$/, "*Total: $1*", "*Total: $1*"],
  ["Confirmar pedido", "Confirm order", "Confirmar pedido", "Confirmar encomenda"],
  ["Alterar", "Change", "Cambiar"],
  ["Cancelar", "Cancel", "Cancelar"],
  [/^Pedido \*#(\d+)\* confirmado! ✅$/, "Order *#$1* confirmed! ✅", "¡Pedido *#$1* confirmado! ✅", "Encomenda *#$1* confirmada! ✅"],
  [/^Chega em (.+)\. Vou te avisando por aqui quando sair do forno\.$/, "It'll arrive in $t1. I'll let you know here when it comes out of the oven.", "Llega en $t1. Te aviso por aquí cuando salga del horno.", "Chega em $t1. Vou avisando por aqui quando sair do forno."],
  ["Fica pronto em 25 a 30 minutos. Vou te avisando por aqui quando sair do forno.", "It'll be ready in 25 to 30 minutes. I'll let you know here when it comes out of the oven.", "Estará listo en 25 a 30 minutos. Te aviso por aquí cuando salga del horno.", "Fica pronta em 25 a 30 minutos. Vou avisando por aqui quando sair do forno."],
  ["*Pix copia e cola* (demonstração)", "*Pix copy-and-paste code* (demo)", "*Pix copia y pega* (demo)", "*Pix copiar e colar* (demonstração)"],

  // Painel: "Pizza G Margherita, Guaraná 2 litros. Entrega no Universitário, Pix."
  [/^(.+)\. (?:Entrega no (.+)|Retirada), (.+)\.$/, (_, itens, bairro, pag) => {
    const lista = itens.split(", ").map((i) => t(i)).join(", ");
    const onde = bairro
      ? { en: `Delivery to ${bairro}`, es: `Envío a ${bairro}`, "pt-PT": `Entrega em ${bairro}` }[IDIOMA]
      : t("Retirada");
    return `${lista}. ${onde}, ${t(pag)}.`;
  }],
  // Linhas de preço (bebidas e bairros na lista de entrega): só o nome muda
  [/^(.+): (R\$ ?[\d.,]+)$/, "$t1: $2", "$t1: $2", "$t1: $2"],
]);

// Traduz uma mensagem do robô antes de ela ser desenhada
export function traduzirMensagem(m) {
  if (IDIOMA === "pt-BR") return m;
  return {
    ...m,
    texto: m.texto && t(m.texto),
    legenda: m.legenda && t(m.legenda),
    botao: m.botao && t(m.botao),
    botoes: m.botoes?.map((b) => ({ ...b, titulo: t(b.titulo) })),
    secoes: m.secoes?.map((s) => ({
      ...s,
      titulo: t(s.titulo),
      linhas: s.linhas.map((l) => ({ ...l, titulo: t(l.titulo), descricao: l.descricao && t(l.descricao) })),
    })),
  };
}
