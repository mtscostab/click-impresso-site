# Design — Click Impresso

Mundo: **folha de impressão**. A loja é uma folha saindo da offset: papel couché branco sobre a mesa da máquina, marcas de corte nos cantos, barra de controle CMYK, alvos de registro. As cores de processo da marca têm funções fixas.

## Tokens (`app/globals.css`, `:root`)

| Token | Valor | Uso |
|---|---|---|
| `--paper` | `#ffffff` | folhas, cards, painéis |
| `--stock` | `#ecebe7` | fundo da página (mesa, fora do refile) |
| `--ink` | `#15161a` | preto de registro: texto, fios, marcas, botões neutros, rodapé |
| `--ink-2` / `--ink-3` | `#464953` / `#5f626c` | texto secundário (≥4.5:1 sobre papel) |
| `--cyan` / `--cyan-deep` / `--cyan-wash` | `#009fe3` / `#0074ad` / `#e3f4fc` | seleção, foco, bloco Lojas (texto preto sobre ciano) |
| `--magenta` / `--magenta-deep` / `--magenta-wash` | `#e6007e` / `#b80065` / `#fde6f2` | ação primária e preço; bloco Atacado (texto branco) |
| `--yellow` | `#ffed00` | economia e seleção de texto, sempre sob tinta preta |
| `--mark` / `--mark-gap` | `14px` / `6px` (10/4 no mobile) | marca de corte e sangria |

Cantos retos em tudo (papel refilado). Sombras só com deslocamento e desfoque, em hover e camadas flutuantes.

## Tipografia

Archivo variável (eixo `wdth`), servida pelo `next/font`.
- Display `.display`: `wdth` 72, peso 800, entrelinha 0.95, `-0.02em`.
- Subtítulo `.h-sub`: `wdth` 85, peso 700.
- Rótulos `.label`: 12px, caixa alta, `0.08em`.
- Todo preço e número em `.num` (algarismos tabulares).

## Componentes

- **`CropMarks`** — quatro marcas absolutas em volta de qualquer elemento `position: relative`. Nos cards aparecem no hover e "fecham" no refile.
- **`ColorBar`** — barra CMYK com alvos de registro; topo do header e do rodapé.
- **Imposição** (`.imposition` + `.grid-products`) — grade de 4/3/2 colunas separada por fios, com marcas de corte na folha.
- **Card de produto** — foto, categoria, título, prazo e formato, preço da faixa mínima e preço por unidade, selo amarelo de economia máxima, botão `+` de compra rápida.
- **Escala de quantidade** (`.density`) — cada faixa é um patch com barra proporcional ao preço por unidade; a selecionada fica em magenta. Teclado: setas.
- **Galeria** — trilho com arraste, miniaturas, lupa conta-fios (retícula magenta e régua) no hover, tela cheia em `<dialog>`.
- **Ficha** (`.ticket`) — tabela de especificações e de preços com cabeçalho preto.
- **Blocos chapados** — `.flood-magenta` (Atacado), `.flood-cyan` (Lojas), `.flood-ink` (rodapé).

## Movimento

`--ease-out: cubic-bezier(0.16, 1, 0.3, 1)`. Momento autoral: o banner entra como folha alimentando a máquina (wipe de `clip-path`) e o indicador é um patch CMYK que se enche durante o autoplay. Demais: marcas de corte fechando, contador do carrinho pulsando em ciano, toast subindo. Tudo desligado em `prefers-reduced-motion`.
