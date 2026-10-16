# Click Impresso — redesign

Redesign local da loja clickimpresso.com.br em Next.js 16, com as mesmas fotos, textos e preços do site atual.

```bash
npm install
npm run dev -- -p 3123
```

Abra http://localhost:3123.

## Páginas

| Rota | O que tem |
|---|---|
| `/` | home institucional: hero em tela cheia com cores CMYK em ciclo e produtos 3D, manifesto com contadores, processo de impressão em 3D guiado pelo scroll (pré-impressão, offset Heidelberg, acabamento, digital Konica Minolta), diferenciais, vitrine horizontal de produtos, mapa 3D das lojas, FAQ e contato |
| `/produtos` | loja: banners, segmentos, categorias em destaque, índice "Tudo o que a gente imprime" e mais pedidos |
| `/categoria/[slug]` | produtos de cada categoria do site antigo, com filtro, ordenação e "ver mais" |
| `/segmento/[slug]` | produtos por segmento (Advocacia, Saúde, Restaurantes...) com filtro por categoria |
| `/busca?q=` | resultado da busca do topo |
| `/produto/[id]` | galeria com lupa e tela cheia, material/cor, escala de quantidade, acabamentos, previsão de produção, especificações, tabela de preços |
| `/onde-estamos` | mapa interativo com as 18 lojas, busca por bairro/cidade, filtro por região, telefone e rota |
| `/carrinho` | itens com troca de faixa, remover com desfazer, retirada em loja ou entrega |
| `/perfil` | dados, entrega/loja preferida e pedidos, salvos só neste navegador |

Bibliotecas: three + @react-three/fiber/drei (cenas 3D modeladas em código, sem arquivos externos), GSAP ScrollTrigger + Lenis (scroll), MapLibre com tiles do OpenFreeMap (o mapa precisa de internet).

O catálogo completo (cerca de 1.380 produtos, extraídos do site atual) fica em `data/catalog.json`, com as fotos em `public/img/catalogo/` convertidas para WebP. A busca do topo usa `public/search-index.json`, gerado com `npm run search-index` (roda sozinho antes do build).

O carrinho fica no `localStorage`. Login e fechamento de pedido estão fora do escopo: "Finalizar compra" só avisa isso.

Veja `ENGENHARIA-REVERSA.md` para a investigação e `DESIGN.md` para o sistema visual.
