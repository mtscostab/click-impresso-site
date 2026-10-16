# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (escolha do usuário). Projeto local, sem git, sem deploy definido. Dados de produtos extraídos do site atual (clickimpresso.com.br) e servidos como JSON local; carrinho e cálculo de preço no cliente.

## Users

Compradores B2B e B2C em igual peso:
- Pequenas e médias empresas e profissionais liberais comprando impressos (cartões, flyers, folders, banners, crachás) e brindes corporativos (canecas, squeezes, kits, cadernos), comparando quantidade × preço por faixa.
- Pessoas físicas comprando presentes, fotolivros, canecas, camisetas e materiais para festas e datas comemorativas.

## Product Purpose

E-commerce de gráfica expressa: o visitante escolhe um produto, configura papel/cor/acabamento e quantidade, vê o preço e o prazo de produção e adiciona ao carrinho. Sucesso = pedido configurado sem dúvida sobre preço, prazo e especificação.

## Positioning

Click Impresso faz parte do Grupo Impresul (mais de 56 anos, "gráfica mais premiada do Sul do Brasil"), com 16+ lojas físicas no RS e uma em Curitiba, parque gráfico próprio de 10 mil m² na Av. Protásio Alves. Gráfica expressa com qualidade offset/digital e entrega para todo o Brasil.

## Operating Context

- Preço por faixa de quantidade (ex.: 1 un R$ 15 / 5 un R$ 65 / 10 un R$ 111). Prazo de produção em dias úteis por produto.
- Configuração: substrato/papel/cor (select), acabamentos opcionais (checkbox, ex.: "Criação da arte", "Dobra", "Impressão sublimática"), cores de impressão (4x0, 4x4).
- Navegação por categoria de produto (~70 categorias) e por tema/segmento (Advocacia, Automotivo, Educação, Empresas, Estética e beleza, Eventos e festas, Festa e produtos infantis, Fitness e Academia, Imobiliária, Lojas e Varejo, PetShop e Vet, Restaurantes, Saúde).
- Atendimento forte via WhatsApp por região e loja; código de orçamento para retomar pedido.

## Capabilities and Constraints

- Fora de escopo por ora: área logada (login, cadastro, meus pedidos, editor de layout). Onde o fluxo pedir login, ignorar.
- Mesmas fotos, copys e conteúdo do site atual. Não inventar preços, depoimentos ou claims.
- Valor de acabamentos opcionais é calculado no servidor do site original (`/pts/priceCalc`) e não foi exposto; tratar como "valor confirmado no orçamento".

## Brand Commitments

- Manter logotipo Click Impresso e a identidade de cores CMYK (magenta, ciano, amarelo) da marca.
- Voz em português do Brasil, direta e comercial.

## Evidence on Hand

- Fotos de produto, banners da home e logotipo baixados do site atual (`public/img/`).
- 28 produtos em destaque com descrição, especificações, faixas de preço, prazos, papéis e acabamentos (`data/products.json`).
- Lista de lojas com endereço, telefone e e-mail; números de WhatsApp por região.
- Texto institucional da página "Sobre".
- Ausente: avaliações de clientes, depoimentos, números de pedidos. Não fabricar.

## Product Principles

1. Preço e prazo sempre visíveis antes do clique em comprar.
2. A quantidade é a decisão principal: mostrar a economia por unidade em cada faixa.
3. Lojas físicas e WhatsApp são prova de confiança, não rodapé esquecido.
4. Um catálogo enorme precisa de busca e filtros, não de uma lista de 70 links.
