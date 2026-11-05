# Portfólio Ruan Galvão

Site do Ruan Galvão, desenvolvedor em Caruaru, com cinco demonstrações funcionando para mostrar aos clientes. Os dados são fictícios, mas tudo funciona: o que você clica é gravado no backend e aparece nas telas.

| Demo | Cliente fictício | O que dá para fazer |
|---|---|---|
| `demos/clinica` | Clínica Sorriso Agreste, odontologia no Centro | Site profissional com várias páginas (início, sobre, tratamentos, uma página por tratamento, convênios com busca, contato com agendamento) |
| `demos/site` | Casa Barro, restaurante no Alto do Moura | Site com sistema: cardápio com busca, aviso de aberto/fechado, reserva com horários livres e **painel do dono** em `/demos/site/painel/` (PIN de demonstração: 2026) para ver, confirmar e lançar reservas |
| `demos/automacao` | Moura Modas Atacado, confecção | Ligar/desligar fluxos, executar e ver cada passo acender; a planilha, o estoque e as mensagens mudam de verdade |
| `demos/chatbot` | Forno Tomazzi, pizzaria | Conversa estilo WhatsApp com botões e listas: pedido, bebida, entrega por bairro, pagamento, troco e transferência para atendente. O pedido aparece no painel da pizzaria |
| `demos/dashboard` | Mercadinho São Bento | Faturamento, vendas, ticket e margem por período e categoria, gráficos com tooltip, mais vendidos e estoque com reposição |

## Rodar

Precisa só do Node 20 ou mais novo. Não tem dependências.

```bash
npm start
```

Abre em http://localhost:4321. Para desenvolver com recarga automática: `npm run dev`.

## Estrutura

```
server/                 servidor HTTP (sem dependências)
  index.js              entrega os arquivos e monta a API de cada demo
  lib/                  roteador, arquivos estáticos, helpers HTTP e "banco" em JSON
portfolio/              site principal (index.html, css/, js/, img/)
demos/
  shared/css/           barra de "demonstração" usada em todas as demos
  <demo>/
    frontend/           index.html, css/, js/ (módulos ES), img/
    backend/
      routes.js         rotas da API da demo, em /api/<demo>/...
      services/         regras de negócio (agenda, motor de fluxos, bot, vendas)
      data/             dados mockados (*.json) e sementes dos bancos (*.seed.json)
```

| URL | Vem de |
|---|---|
| `/` | `portfolio/` |
| `/demos/<demo>/` | `demos/<demo>/frontend/` |
| `/api/<demo>/...` | `demos/<demo>/backend/routes.js` |

## Dados das demos

Cada demo que grava algo usa um arquivo `*.seed.json` como estado inicial. Na primeira gravação o servidor cria uma cópia `*.db.json` (ignorada pelo git). Para voltar tudo ao início, apague os `*.db.json` e reinicie o servidor. As demos de automação e dashboard também têm botão de reiniciar na tela.

## Publicar

Como existe um backend em Node, a hospedagem precisa rodar `npm start` (Render, Railway, Fly.io ou uma VPS). Na Vercel seria preciso transformar as rotas em funções serverless e trocar o banco JSON por um armazenamento externo, porque o disco lá não é persistente.
