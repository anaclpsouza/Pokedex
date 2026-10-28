document.addEventListener('DOMContentLoaded', async () => {
  const fGen = document.getElementById('f-gen');
  const fName = document.getElementById('f-name');
  const chips = document.querySelectorAll('.chip');
  const grid = document.getElementById('explore-grid');
  const countEl = document.getElementById('explore-count');

  let allPokemon = [];
  let filteredList = [];
  let selectedGen = fGen ? fGen.value : '1';
  let selectedType = 'all';
  let searchTerm = '';

  function createCard(p) {
    const card = document.createElement('div');
    card.className = 'poke-card';
    card.dataset.id = p.id;

    const imgUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`;

    card.innerHTML = `
      <div class="poke-card__top">
        <span class="poke-card__num">${formatNumber(p.id)}</span>
      </div>
      <div class="poke-card__avatar">
        <img src="${imgUrl}" alt="${p.name}" loading="lazy">
      </div>
      <h3 class="poke-card__name">${formatName(p.name)}</h3>
      <div class="poke-card__types">
        <span class="type">...</span>
      </div>
    `;

    return card;
  }

  // Carrega os tipos e define o gradiente no fundo do card
  async function loadCardDetails(card, id) {
    try {
      const data = await api.getPokemon(id);
      const primaryType = data.types[0].type.name;

      // Aplica o gradiente no fundo
      card.classList.add(`card--${primaryType}`);

      const typesEl = card.querySelector('.poke-card__types');
      if (typesEl) {
        typesEl.innerHTML = data.types
          .map((t) => `<span class="type type--${t.type.name}">${t.type.name.toUpperCase()}</span>`)
          .join('');
      }
    } catch {
      // Mantém exibição padrão caso falhe
    }
  }

  async function applyFilters() {
    let result = allPokemon;

    // Filtro por Região / Geração
    if (selectedGen !== 'all') {
      const gen = GENERATIONS.find((g) => g.id === selectedGen);
      if (gen) {
        result = result.filter((p) => p.id >= gen.start && p.id <= gen.end);
      }
    }

    // Filtro por Nome ou Número 
    if (searchTerm) {
      result = result.filter((p) => p.name.includes(searchTerm) || String(p.id).includes(searchTerm));
    }

    // Filtro por Tipo
    if (selectedType !== 'all') {
      try {
        const typeIds = await api.getTypePokemon(selectedType);
        result = result.filter((p) => typeIds.has(p.id));
      } catch (err) {
        console.error('Erro ao filtrar por tipo:', err);
      }
    }

    filteredList = result;

    if (countEl) {
      countEl.textContent = `${filteredList.length} POKÉMON`;
    }

    renderGrid();
  }

  // Renderiza a lista de cards no grid
  function renderGrid() {
    if (!grid) return;
    grid.innerHTML = '';

    if (filteredList.length === 0) {
      grid.innerHTML = '<p class="empty-msg">NENHUM POKÉMON ENCONTRADO</p>';
      return;
    }

    const fragment = document.createDocumentFragment();
    filteredList.forEach((p) => {
      const card = createCard(p);
      fragment.appendChild(card);
    });
    
    grid.appendChild(fragment);

    // Carrega tipos e cor do fundo de cada card
    filteredList.forEach((p, index) => {
      const card = grid.children[index];
      if (card) loadCardDetails(card, p.id);
    });
  }

  // Evento do Seletor de Região
  if (fGen) {
    fGen.addEventListener('change', () => {
      selectedGen = fGen.value;
      applyFilters();
    });
  }

  // Evento do Campo de Busca por Nome ou Número
  if (fName) {
    let timer;
    fName.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        searchTerm = fName.value.toLowerCase().trim();
        applyFilters();
      }, 150);
    });
  }

  // Evento das Badges de Tipo
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      selectedType = chip.dataset.type || 'all';
      applyFilters();
    });
  });

  // Clique no card redireciona para a tela da Pokédex
  if (grid) {
    grid.addEventListener('click', (e) => {
      const card = e.target.closest('.poke-card');
      if (card && card.dataset.id) {
        window.location.href = `../index.html?id=${card.dataset.id}`;
      }
    });
  }

  // Carregamento inicial da lista de Pokémon
  try {
    if (countEl) countEl.textContent = 'CARREGANDO...';
    allPokemon = await api.initIndex();
    await applyFilters();
  } catch {
    if (countEl) countEl.textContent = 'OFFLINE';
    if (grid) grid.innerHTML = '<p class="empty-msg">NÃO FOI POSSÍVEL CONECTAR À POKÉAPI</p>';
  }
});
