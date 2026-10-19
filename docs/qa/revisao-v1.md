# Revisão de front-end — Click Impresso v1

Data: 19/10/2026. Revisão preservando identidade, fluxo e animações existentes.

## Instalação

Impeccable instalado no projeto para Codex e Claude pelo instalador oficial:
`npx impeccable install --providers=codex,claude --project --yes`.
Skills em `.agents/skills/impeccable` e `.claude/skills/impeccable`, com manifests de hooks. A ativação automática dos hooks depende da configuração de confiança do aplicativo; nesta revisão o detector também foi executado manualmente e não reportou ocorrências.

## Correções

- Busca: IDs exclusivos entre menu e desktop, vínculo da opção ativa com o campo, Escape e perda de foco, fechamento do menu ao navegar, verificação HTTP e recuperação da busca após falha.
- Formulário: campos obrigatórios identificados, aviso de demonstração antes do envio, validação com foco no primeiro erro e preservação dos campos. Não simula envio real.
- Navegação: limpeza de timers e proteção contra hashes malformados; link de pular para o conteúdo transfere foco; retorno ao topo pelos links de início na própria home.
- Banners: brindes, cartões e eventos levam às categorias locais; links usam Next Link para respeitar o basePath do GitHub Pages. Arraste interrompido é limpo e deslizar não aciona o link por acidente.
- Galeria: recuperação em cancelamento/perda do ponteiro, captura do gesto e botão visível para tela cheia.
- Mobile: vitrine horizontal nativa e correção do overflow da faixa inclinada, preservando a vitrine animada no desktop.
- Movimento reduzido: vídeo estático, processo sem fixação/3D, etapas acionáveis, vitrine nativa, manifesto legível e mapa respeitando a preferência do navegador.
- WebGL: imagem de reserva no hero e na cena do processo; limpeza dos recursos do vídeo e dos listeners dos diferenciais.
- Mapa: seleção de loja também pelo teclado, filtros com semântica de botões e cancelamento de abertura atrasada de popups antigos.
- Carrinho: dados inválidos no armazenamento não derrubam a interface; timer de toast limpo ao desmontar.
- Perfil: leitura segura dos campos salvos e erro explícito quando o armazenamento falha.
- Copy: prazo do FAQ sem exemplo incompatível com os produtos; singular de “dia útil”; selo de economia apenas quando existe redução real por unidade; correção de “Rua dos Andradas”.

## Verificações realizadas

- `npm run build`: aprovado, 1.474 páginas geradas.
- Exportação GitHub Pages (`GH_PAGES=1 npm run build` + `node scripts/prefix-base.mjs`): aprovada, 1.471 páginas geradas.
- `npx tsc --noEmit`: aprovado.
- `git diff --check`: aprovado.
- Detector Impeccable em `components` e `app`: nenhuma ocorrência.
- Catálogo: 1.379 produtos e 80 categorias/segmentos, sem referências a produtos inexistentes nem produtos sem fotos/faixas válidas.
- Arquivos: 1.385 caminhos de imagem do catálogo/índices conferidos, sem arquivos ausentes.
- Navegador: versão de produção em desktop (1280 px) e viewport Chrome de 390 e 320 px; sem overflow horizontal da página nas dimensões conferidas.
- Home: âncora do processo, troca de etapa, contato, FAQ, aviso de cookies e abertura/fechamento das opções de WhatsApp.
- Exportação estática servida sob `/click-impresso-site/`: busca por “crachá” retornou 55 produtos, âncora de contato entre rotas e retorno ao início pela marca conferidos; sem erros no console do navegador usado nessa verificação.
- Busca: menu mobile, sugestões, submissão, fechamento do menu, resultado para “caneca”, ordenação, filtro vazio e limpeza do filtro.
- Produto: troca de quantidade, acabamento, total e inclusão no carrinho; galeria com próxima foto, tela cheia e Escape.
- Carrinho: 200 unidades por R$ 38,00; mudança pelo teclado para 300 por R$ 57,00; seleção de Curitiba; aviso do checkout; remoção, desfazer e persistência após recarregar. Item de teste removido ao final.
- Mapa: filtro Curitiba e seleção de loja com Enter.

As verificações mobile usam viewport emulado, não aparelho físico nem gesto de toque real. As proteções de falha de rede, armazenamento indisponível e WebGL, e o modo de movimento reduzido foram revisados no código; não houve injeção dessas falhas no navegador. Os testes cobrem os fluxos representativos descritos acima, não cada combinação dos 1.379 produtos.

## Pendências para a versão integrada

1. Conectar o formulário ao serviço de atendimento; ele apenas valida os dados nesta v1.
2. Integrar autenticação, histórico, upload/editor de arte, pagamento e frete. O carrinho permanece local; extras continuam com valor confirmado em orçamento.
3. Confirmar os números oficiais de WhatsApp por região: os links herdados têm oito dígitos locais. Foram preservados, sem acrescentar dígitos por suposição e sem enviar mensagens de teste.
4. Confirmar os destinos externos de Click Atacado e fachadas/sinalizações. Foram mantidos os endereços recebidos no projeto: `https://www.clickimpresso.com.br/atacado/` e `https://clickimpresso.framer.website/`.
5. Confirmar dados de atendimento/endereço antes da publicação: conteúdo institucional usa Av. Protásio Alves, 6441 e telefone 51 3381 0978; loja/e-commerce usa 6485 e 51 3181-2350. Podem ser setores distintos; não foram unificados sem confirmação.

Nenhuma mensagem foi enviada, compra finalizada ou publicação realizada durante a revisão.
