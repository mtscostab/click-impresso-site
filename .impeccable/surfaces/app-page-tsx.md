---
version: 1
slug: "app-page-tsx"
primary_target: "app/page.tsx"
related_targets: ["app/produto/[id]/page.tsx","app/carrinho/page.tsx"]
---

# Surface: loja Click Impresso (home, catálogo, produto, carrinho)

Mode: Persuade (home), Operate (produto/carrinho). Público B2B + B2C por igual. Ação principal: configurar e adicionar ao carrinho. Build path: code-led (sem geração de imagem nesta sessão).

## Direction contract

THESIS: A loja é uma folha saindo da offset. Produtos são impostos numa grade com marcas de corte nos cantos, a barra de controle CMYK é instrumento de navegação e estado. Recusa o e-commerce de gráfica padrão: cards arredondados com sombra sobre cinza, banner genérico, sidebar com 70 links.

OWN-WORLD: Papel couché branco puro como chão; preto de registro #15161A como única tinta de linha (fios 1px, marcas de corte 12px); ciano #009FE3 = seleção, magenta #E6007E = ação e preço, amarelo #FFED00 = economia (sempre como fundo sob tinta preta). Blocos de cor chapada ocupam seções inteiras (lojas em ciano, atacado em magenta, rodapé em preto de registro). Alvos de registro ⊕ como marcadores. Archivo variável: largura condensada pesada no display, normal no texto, numerais tabulares em todo preço.

STORY: O visitante vê de cara que é uma gráfica de verdade (folha, marcas, cores de processo), acha o produto pela busca ou pelo índice, entende preço por faixa e prazo sem ambiguidade, e adiciona ao carrinho em dois cliques. Lojas físicas e WhatsApp sustentam a confiança.

FIRST VIEWPORT: Barra CMYK de 6px no topo com alvos de registro. Header: logo à esquerda, busca larga central com sugestões vivas, Lojas/WhatsApp e carrinho com contador à direita. Faixa de temas abaixo. Banner real da Click como folha impressa com marcas de corte, entrando por wipe de clip-path da esquerda (alimentação da máquina), controles e indicador como patches CMYK. Abaixo, início da imposição "Mais pedidos" com preço "a partir de" e adicionar rápido.

FORM: Folha de impressão com marcas de corte (pick do designer, posição 1 da minha lista); seed key 12448bb7. Interação assinatura: na PDP, a escala de quantidade é uma barra de densidade de tinta (cada faixa um patch com tinta crescente e preço por unidade caindo); a galeria tem lupa conta-fios com retícula de medição. Motion: wipe de alimentação de folha + marcas de corte que se fecham no hover (corte).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
