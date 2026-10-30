# Retro Pokédex 🎮🔴

Uma Pokédex retrô e interativa inspirada no visual clássico do anime dos anos 90 e no Game Boy original (DMG-01). Este projeto foi desenvolvido para fins de estudo e prática de conceitos fundamentais de desenvolvimento web com **JavaScript puro (Vanilla JS)**, sem o uso de frameworks ou bibliotecas externas.

---

## 🚀 Funcionalidades

- **Visor Cênico Interativo:**
  - Exibição de sprites animados (Showdown).
  - Alternância de paleta padrão / **Shiny** e visualização frontal / traseira (**Flip**).
  - Cenários dinâmicos de habitat que se adaptam conforme o tipo primário e ecossistema do Pokémon.

- **Tela LCD Verde (Estilo Game Boy):**
  - **Info:** Dados básicos, descrição oficial (flavor text), peso, altura, habitat e habilidades.
  - **Status:** Barras visuais de atributos base (HP, Ataque, Defesa, etc.) e cálculo de pontuação total.
  - **Evolução:** Árvore evolutiva completa com estágios clicáveis para inspeção direta.
  - **Tipos:** Classificação elemental e identificação de tipo puro ou duplo.
  - **Golpes:** Lista com barra de rolagem retrô contendo os movimentos aprendíveis e níveis requeridos.

- **Navegação & Controles:**
  - Navegação circular via D-Pad (avançar/voltar de 1 em 1 ou de 10 em 10).
  - Botão aleatório para sorteio rápido entre os 1025 monstrinhos.
  - Busca direta por nome ou número da Pokédex.

- **Sistema de Captura & Equipe (Party):**
  - Botão de captura com animação de Pokébola e efeitos visuais.
  - Bandeja superior com até 6 Pokémon na equipe, salvos localmente (`localStorage`).
  - Atalho para inspecionar os membros da equipe e botão para liberá-los.

- **Página de Exploração (`pages/explore.html`):**
  - Grade de cards com filtros por região/geração (Gen 1 a Gen 9).
  - Filtro por tipos elementais e barra de pesquisa instantânea.
  - Paginação com carregamento sob demanda.

---

## 🛠️ Tecnologias Utilizadas

- **HTML5:** Estrutura limpa e semântica.
- **CSS3 Puro:** Variáveis customizadas (design tokens), Grid, Flexbox, layout responsivo e animações com `@keyframes`.
- **JavaScript Vanilla:** Manipulação de DOM, consumo assíncrono de API (`Fetch API` / `async/await`) e persistência com `localStorage`.
- **API Externa:** [PokéAPI](https://pokeapi.co/).

---

## 🤖 Uso de IA no Projeto

- **Elementos Visuais e Vetores (SVG):** Os arquivos vetoriais de carcaça, chassi e botões decorativos foram criados com auxílio de ferramentas de inteligência artificial.
- **Animações:** Os efeitos de animação e transições visuais em CSS (incluindo o efeito de arremesso, captura e tremor da Pokébola) foram desenvolvidos com suporte de IA.

---

## 💻 Como Executar

Por ser uma aplicação 100% estática (sem Node.js ou dependências de pacotes), não é necessário instalar nada:

1. Clone ou baixe este repositório.
2. Abra o arquivo `index.html` diretamente em seu navegador (ou via extensão como *Live Server* no VS Code).
3. Certifique-se de estar conectado à internet para o carregamento dos dados da PokéAPI.

