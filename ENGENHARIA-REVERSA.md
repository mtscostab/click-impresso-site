# Engenharia reversa: clickimpresso.com.br

Investigação feita em 16/10/2026 seguindo o método do [REA](https://github.com/morluto/rea) (skill `reverse-engineer-anything`): observar o alvo publicado, registrar evidências, separar o que foi comprovado do que é inferência. O MCP do REA não estava registrado nesta sessão, então as mesmas observações (estrutura da página, scripts, rede, capturas) foram feitas com `curl`, o navegador embutido e leitura direta dos scripts inline.

## Stack observada

| Camada | Evidência |
|---|---|
| Servidor | `Server: Apache`, cookie `PHPSESSID` → PHP com sessão no servidor |
| Renderização | HTML completo no servidor (≈104 KB na home), sem framework de front |
| JS | jQuery, Swiper (`swiper.jquery.min.js`), scripts próprios `core.js`, `menu.js`, `slider.js`, `product.js`, `customize.js`, `jquery.countdown.js`, `jquery.form.js` |
| CSS | `core.min.css`, `style.min.css`, Font Awesome 4 |
| Analytics | Google Tag (UA-19531699-1) e Google Ads (AW-1001664893) com `gtag_report_conversion` nos links de WhatsApp |
| Segurança | HSTS, `X-Frame-Options: SAMEORIGIN`, CSP permissiva (`default-src * 'unsafe-inline' 'unsafe-eval'`) |

## Rotas

- `/` home · `/about` · `/help` · `/contact` · `/shoppingCar` · `/termo-de-uso`
- `/categorias/{Nome}/{id}`, `/categorias/cat/{id}`, `/categorias/tema/{id}/{slug}`, `/categorias/search/{termo}`
- `/product/{slug}/{subgrupoId}/{acabamentoId}/{papelId}`
- `/atacado/` (subloja Click Atacado), `/decora/`, `/books`

## Fluxo de compra (comprovado nos scripts inline da página de produto)

1. A página traz um formulário `#frm` com `quantidade`, `paginas`, `formato`/`formato2`, `especie`, `papel` (select) e um campo oculto `preco_unitario` no formato `1=5.472;5=4.604;…`.
2. Acabamentos ficam em `#frm2` como checkboxes, cada um com um `prazo-{id}` oculto (em horas).
3. Qualquer mudança chama `getPrice()` → `POST /pts/priceCalc` com subgrupo, quantidade, formato, papel, acabamentos, cores e `preco_unitario`. A resposta é texto `preço@frete` ou um JSON com `between_error` quando a quantidade fica entre faixas.
4. "Comprar" chama `sendForm()` → `POST /addShoppingCar/{subgrupoId}` com os três formulários e redireciona para `/shoppingCar`.
5. Orçamento salvo: `POST /pts/cad_orc` → `/solicitacao_orcamento`. Retomada por "Cód. Orçamento" (`POST pts/faturamento`).

A tabela de preços exibida (ex.: "1 unidades - R$ 15,00") é a fonte usada no redesign. O cálculo de acabamentos acontece só no servidor e não foi exposto; por isso o redesign mostra esse valor como "confirmado no orçamento". Nenhuma chamada de escrita foi feita contra o site.

## Problemas de UX encontrados

- Preço por faixa enterrado num `<ul>` dentro da descrição; quantidade é um campo de texto livre que dá erro entre faixas.
- Galeria de produto com imagem fixa em 300×300, sem zoom nem miniaturas.
- 70+ categorias numa lista lateral única, sem busca nem ordenação útil.
- Card de produto com dois botões absolutos ("Faça seu pedido" / "Outros modelos") e preço sem quantidade clara.
- Lojas e WhatsApp só no rodapé e num modal; cookie banner bloqueando o primeiro viewport.
- Inconsistências de conteúdo: página Sobre fala em 16 lojas, banner e rodapé listam 18; o número exibido para "Site" no rodapé (9791-8804) difere do link real (`wa.me/555195334083`).

## Conteúdo extraído

- 28 produtos em destaque com título, formato, descrição, especificações, faixas de preço, prazo, materiais, acabamentos e fotos → `data/products.json`
- 73 categorias e 13 segmentos → `data/navigation.json`
- 8 banners (desktop e mobile), logotipo, bandeiras de pagamento, favicon → `public/img/`
- 18 lojas e contatos de WhatsApp → `lib/stores.ts`
- Textos de Sobre, Ajuda, Contato, Click Atacado e aviso de cookies, mantidos como no original.

Scripts de extração usados ficaram fora do projeto (pasta temporária da sessão).
