// Ponto de entrada: abre a conversa e mantém o painel da pizzaria em dia.

import { iniciarChat } from "./chat.js";
import { atualizarPainel } from "./painel.js";

atualizarPainel();
iniciarChat(atualizarPainel);
