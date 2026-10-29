document.addEventListener('DOMContentLoaded', async () => {
  const fGen = document.getElementById('f-gen');
  const fName = document.getElementById('f-name');
  const chips = document.querySelectorAll('.chip');
  const grid = document.getElementById('explore-grid');
  const countEl = document.getElementById('explore-count');
  const moreBtn = document.getElementById('explore-more');

  const PAGE_SIZE = 24;
  let allPokemon = [];
  let filteredList = [];
  let currentPage = 1;
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

  async function loadCardDetails(card, id) {
    try {
      const data = await api.getPokemon(id);
      const primaryType = data.types[0].type.name;

      card.classList.add(`card--${primaryType}`);

      const typesEl = card.querySelector('.poke-card__types');
      if (typesEl) {
        typesEl.innerHTML = data.types
          .map((t) => `<span class="type type--${t.type.name}">${t.type.name.toUpperCase()}</span>`)
          .join('');
      }
    } catch {
      // Ignora falhas pontuais de conexão
    }
  }

  function appendCardsBatch(batch) {
    const fragment = document.createDocumentFragment();
    const newCards = [];

    batch.forEach((p) => {
      const card = createCard(p);
      fragment.appendChild(card);
      newCards.push({ card, id: p.id });
    });

    grid.appendChild(fragment);

    newCards.forEach(({ card, id }) => {
      loadCardDetails(card, id);
    });
  }

  function renderGrid() {
    if (!grid) return;
    grid.innerHTML = '';

    if (filteredList.length === 0) {
      grid.innerHTML = '<p class="empty-msg">POKÉMON NOT FOUND</p>';
      if (moreBtn) moreBtn.style.display = 'none';
      if (countEl) countEl.textContent = '0 POKÉMON';
      return;
    }

    const initialBatch = filteredList.slice(0, PAGE_SIZE);
    appendCardsBatch(initialBatch);

    if (moreBtn) {
      if (filteredList.length > PAGE_SIZE) {
        moreBtn.style.display = 'inline-block';
        moreBtn.textContent = 'CARREGAR MAIS';
      } else {
        moreBtn.style.display = 'none';
      }
    }

    if (countEl) {
      countEl.textContent = `${initialBatch.length} DE ${filteredList.length} POKÉMON`;
    }
  }

  function loadMorePokemon() {
    const start = currentPage * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const nextBatch = filteredList.slice(start, end);

    if (nextBatch.length > 0) {
      appendCardsBatch(nextBatch);
      currentPage++;
    }

    const displayedCount = Math.min(end, filteredList.length);
    if (countEl) {
      countEl.textContent = `${displayedCount} DE ${filteredList.length} POKÉMON`;
    }

    if (end >= filteredList.length && moreBtn) {
      moreBtn.style.display = 'none';
    }
  }

  async function applyFilters() {
    currentPage = 1;
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
    renderGrid();
  }

  if (fGen) {
    fGen.addEventListener('change', () => {
      selectedGen = fGen.value;
      applyFilters();
    });
  }

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

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      selectedType = chip.dataset.type || 'all';
      applyFilters();
    });
  });

  if (moreBtn) {
    moreBtn.addEventListener('click', loadMorePokemon);
  }

  if (grid) {
    grid.addEventListener('click', (e) => {
      const card = e.target.closest('.poke-card');
      if (card && card.dataset.id) {
        window.location.href = `../index.html?id=${card.dataset.id}`;
      }
    });
  }

  try {
    if (countEl) countEl.textContent = 'CARREGANDO...';
    allPokemon = await api.initIndex();
    await applyFilters();
  } catch {
    if (countEl) countEl.textContent = 'OFFLINE';
    if (grid) grid.innerHTML = '<p class="empty-msg">NÃO FOI POSSÍVEL CONECTAR À POKÉAPI</p>';
    if (moreBtn) moreBtn.style.display = 'none';
  }
});
