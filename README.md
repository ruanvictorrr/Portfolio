# Portfólio Ruan Galvão

Site do Ruan Galvão com as demonstrações para mostrar aos clientes, separadas por país em `demos/<país>/`.

## Brasil (`demos/brasil/`)

Cinco demonstrações com sistema. Os dados são fictícios, mas tudo funciona: o que você clica é gravado no backend e aparece nas telas.

| Demo | Cliente fictício | O que dá para fazer |
|---|---|---|
| `demos/brasil/clinica` | Clínica Sorriso Agreste, odontologia no Centro | Site profissional com várias páginas (início, sobre, tratamentos, uma página por tratamento, convênios com busca, contato com agendamento) |
| `demos/brasil/site` | Casa Barro, restaurante no Alto do Moura | Site com sistema: cardápio com busca, aviso de aberto/fechado, reserva com horários livres e **painel do dono** em `/demos/brasil/site/painel/` (PIN de demonstração: 2026) para ver, confirmar e lançar reservas |
| `demos/brasil/automacao` | Moura Modas Atacado, confecção | Ligar/desligar fluxos, executar e ver cada passo acender; a planilha, o estoque e as mensagens mudam de verdade |
| `demos/brasil/chatbot` | Forno Tomazzi, pizzaria | Conversa estilo WhatsApp com botões e listas: pedido, bebida, entrega por bairro, pagamento, troco e transferência para atendente. O pedido aparece no painel da pizzaria |
| `demos/brasil/dashboard` | Mercadinho São Bento | Faturamento, vendas, ticket e margem por período e categoria, gráficos com tooltip, mais vendidos e estoque com reposição |

## Portugal (`demos/portugal/`)

17 propostas de "novo website" para clínicas dentárias de Lisboa, feitas para prospecção. São sites estáticos (um `index.html` e `img/` cada), com `noindex`, abertos só por link direto em `/demos/portugal/<clínica>/`. Não aparecem na lista do portfólio. Vieram do repositório `demos` (commit `cf33203`).

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
  shared/               barra de "demonstração", idioma e ponte da API (usados pelas demos com sistema)
  <país>/               brasil/, portugal/, ...
    <demo>/             demo com sistema:
      frontend/         index.html, css/, js/ (módulos ES), img/
      backend/
        routes.js       rotas da API da demo, em /api/<país>/<demo>/...
        services/       regras de negócio (agenda, motor de fluxos, bot, vendas)
        data/           dados mockados (*.json) e sementes dos bancos (*.seed.json)
    <demo>/             ou site estático: index.html, img/ (entregue como está)
```

Uma pasta de demo com `frontend/` é tratada como demo com sistema; sem `frontend/`, como site estático. Não precisa registrar a demo em lugar nenhum: o servidor e o build acham as pastas sozinhos (`server/lib/demos.js`).

| URL | Vem de |
|---|---|
| `/` | `portfolio/` |
| `/demos/<país>/<demo>/` | `demos/<país>/<demo>/frontend/` (ou a própria pasta, se for site estático) |
| `/api/<país>/<demo>/...` | `demos/<país>/<demo>/backend/routes.js` |
| `/demos/<demo>/` (link antigo) | redireciona para `/demos/brasil/<demo>/` |
| `/_api/...` | rotas e dados das demos para rodarem no navegador |

## Dados das demos

Cada demo que grava algo usa um arquivo `*.seed.json` como estado inicial. Na primeira gravação o servidor cria uma cópia `*.db.json` (ignorada pelo git). Para voltar tudo ao início, apague os `*.db.json` e reinicie o servidor. As demos de automação e dashboard também têm botão de reiniciar na tela.

## Publicar

O site fica no ar pelo **GitHub Pages**: https://ruanvictorrr.github.io/Portfolio/

A cada push na `main`, a Action `.github/workflows/pages.yml` roda `npm run build:pages`, que monta a versão estática em `_site/`, e publica.

O Pages só hospeda arquivos, sem servidor. Por isso as rotas das demos não dependem do Node:

| Onde roda | Quem executa as rotas | Onde ficam os dados |
|---|---|---|
| `npm start` (seu computador ou uma hospedagem Node) | `server/index.js` | arquivos `*.db.json` |
| GitHub Pages | o navegador do visitante, via `demos/shared/js/api.js` | `localStorage` do visitante |

O frontend chama sempre `apiFetch("/api/<país>/<demo>/...")`. Se existir servidor (`/api/health` responde), a chamada vai para ele; se não existir, as mesmas rotas de `demos/<país>/<demo>/backend/routes.js` rodam no navegador. Para testar o modo navegador com o servidor ligado, abra qualquer demo com `?modo=local` no fim da URL.

Para ver a versão estática localmente:

```bash
npm run build:pages
```
