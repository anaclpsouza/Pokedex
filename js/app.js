document.addEventListener('DOMContentLoaded', () => {
  const dexScreen = document.getElementById('dex-screen');
  const dexSprite = document.getElementById('dex-sprite');
  const dexNum = document.getElementById('dex-num');
  const dexBadges = document.getElementById('dex-badges');
  const dexName = document.getElementById('dex-name');
  const dexGenus = document.getElementById('dex-genus');
  const dexPanel = document.getElementById('dex-panel');
  const loader = document.querySelector('.screen__loader');

  const lens = document.getElementById('lens');
  const leds = document.getElementById('leds');
  const btnShiny = document.getElementById('btn-shiny');
  const btnFlip = document.getElementById('btn-flip');
  const btnRandom = document.getElementById('btn-random');
  const blueKeys = document.querySelectorAll('.blue-key');
  const dexSearch = document.getElementById('dex-search');
  const dexInput = document.getElementById('dex-input');
  const dpadButtons = document.querySelectorAll('.dpad button');

  let currentPokemon = null;
  let currentSpecies = null;
  let currentEvolution = null;
  let currentPanel = 'info';
  let isShiny = false;
  let isBack = false;

  function piscarLuzes() {
    if (lens) lens.src = 'assets/lens-active.svg';
    if (leds) leds.src = 'assets/leds-active.svg';

    setTimeout(() => {
      if (lens) lens.src = 'assets/lens.svg';
      if (leds) leds.src = 'assets/leds.svg';
    }, 350);
  }

  function updateSprite() {
    if (!currentPokemon || !dexSprite) return;
    const sprites = api.extractSprites(currentPokemon);
    let src = sprites.front;

    if (isShiny && isBack) {
      src = sprites.backShiny;
    } else if (isShiny) {
      src = sprites.frontShiny;
    } else if (isBack) {
      src = sprites.back;
    }

    dexSprite.src = src || currentPokemon.sprites?.front_default || '';
    dexSprite.alt = currentPokemon.name;
  }

  function updateScreenScene(pokemon, species) {
    if (!dexScreen) return;
    const primaryType = pokemon.types?.[0]?.type?.name || 'normal';
    const habitat = species?.habitat?.name;

    if (species?.is_legendary || species?.is_mythical) {
      dexScreen.setAttribute('data-scene', 'rare');
    } else if (habitat) {
      dexScreen.setAttribute('data-scene', habitat);
    } else {
      const typeSceneMap = {
        water: 'sea',
        grass: 'grassland',
        bug: 'forest',
        rock: 'mountain',
        ground: 'rough-terrain',
        fire: 'rough-terrain',
        ghost: 'cave',
        dark: 'cave',
        electric: 'urban',
        steel: 'urban'
      };
      dexScreen.setAttribute('data-scene', typeSceneMap[primaryType] || 'type');
    }

    const mainColor = TYPE_COLORS[primaryType] || '#A8A77A';
    dexScreen.style.setProperty('--tc', mainColor);
    const secColor = pokemon.types?.[1]?.type?.name ? TYPE_COLORS[pokemon.types[1].type.name] : mainColor;
    dexScreen.style.setProperty('--tc2', secColor);
  }

  function updateBadges() {
    if (!dexBadges) return;
    let html = '';
    if (currentSpecies?.is_legendary) html += '<span class="badge">LEGENDARY</span>';
    if (currentSpecies?.is_mythical) html += '<span class="badge badge--myth">MYTHICAL</span>';
    if (currentSpecies?.is_baby) html += '<span class="badge badge--baby">BABY</span>';
    if (isShiny) html += '<span class="badge badge--shiny">✦ SHINY</span>';
    dexBadges.innerHTML = html;
  }

  function switchPanel(panelName) {
    currentPanel = panelName;
    blueKeys.forEach((key) => {
      key.classList.toggle('is-active', key.dataset.panel === panelName);
    });
    piscarLuzes();
    renderCurrentPanel();
  }

  function renderCurrentPanel() {
    if (!currentPokemon || !dexPanel) return;

    switch (currentPanel) {
      case 'info':
        renderInfoPanel();
        break;
      case 'stats':
        renderStatsPanel();
        break;
      case 'evo':
        renderEvolutionPanel();
        break;
      case 'types':
        renderTypesPanel();
        break;
      case 'moves':
        renderMovesPanel();
        break;
    }
  }

  function renderInfoPanel() {
    const typesHtml = currentPokemon.types.map((t) => {
      const typeKey = t.type.name;
      return `<span class="type type--${typeKey}">${formatName(typeKey)}</span>`;
    }).join(' ');

    const flavor = api.extractFlavorText(currentSpecies);
    const height = formatHeight(currentPokemon.height);
    const weight = formatWeight(currentPokemon.weight);
    const habitat = currentSpecies?.habitat ? formatName(currentSpecies.habitat.name) : 'Unknown';
    const baseExp = currentPokemon.base_experience ? `${currentPokemon.base_experience} XP` : '—';

    const abilitiesHtml = currentPokemon.abilities.map((a) => {
      const isHidden = a.is_hidden ? ' <small>(Hidden)</small>' : '';
      return `<span class="ability">${formatName(a.ability.name)}${isHidden}</span>`;
    }).join(' ');

    dexPanel.innerHTML = `
      <div class="info-types">${typesHtml}</div>
      <p class="flavor">${flavor}</p>
      <dl class="info-grid">
        <div><dt>HEIGHT</dt><dd>${height}</dd></div>
        <div><dt>WEIGHT</dt><dd>${weight}</dd></div>
        <div><dt>BASE EXP</dt><dd>${baseExp}</dd></div>
        <div><dt>HABITAT</dt><dd>${habitat}</dd></div>
      </dl>
      <h4>ABILITIES</h4>
      <div class="abilities">${abilitiesHtml}</div>
    `;
  }

  function renderStatsPanel() {
    let total = 0;
    const maxStat = 255;

    const statsHtml = currentPokemon.stats.map((s) => {
      const statName = formatStatName(s.stat.name);
      const base = s.base_stat;
      total += base;
      const pct = Math.min(100, Math.round((base / maxStat) * 100));

      return `
        <div class="stat">
          <span class="stat__name">${statName}</span>
          <span class="stat__val">${base}</span>
          <div class="stat__bar"><i style="width: ${pct}%"></i></div>
        </div>
      `;
    }).join('');

    const rating = total >= 600 ? 'POWERFUL' : total >= 500 ? 'GREAT' : 'COMMON';

    dexPanel.innerHTML = `
      <h4>BASE STATS</h4>
      <div class="stat-list">${statsHtml}</div>
      <div class="stat-total">
        <span>TOTAL BASE: ${total}</span>
        <span>${rating}</span>
      </div>
    `;
  }

  function renderEvolutionPanel() {
    if (!currentEvolution || !currentEvolution.chain) {
      dexPanel.innerHTML = '<h4>EVOLUTION CHAIN</h4><p class="flavor">Evolution data not available.</p>';
      return;
    }

    const parsed = api.parseEvolutionChain(currentEvolution.chain);
    if (parsed.length <= 1) {
      dexPanel.innerHTML = `
        <h4>EVOLUTION CHAIN</h4>
        <p class="flavor" style="margin-top: 12px;">This Pokémon does not evolve.</p>
      `;
      return;
    }

    const nodesHtml = parsed.map((item, idx) => {
      const isCurrent = item.id === currentPokemon.id;
      const arrow = idx > 0 ? '<div class="evo__arrow">➔</div>' : '';
      const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${item.id}.png`;

      return `
        ${arrow}
        <button class="evo__node ${isCurrent ? 'is-current' : ''}" data-id="${item.id}" type="button">
          <img src="${spriteUrl}" alt="${formatName(item.name)}" class="pixel" loading="lazy">
          <span>${formatName(item.name)}</span>
          ${item.detail ? `<small>${item.detail}</small>` : ''}
        </button>
      `;
    }).join('');

    dexPanel.innerHTML = `
      <h4>EVOLUTION CHAIN</h4>
      <div class="evo">${nodesHtml}</div>
      <p class="lcd-sub center" style="margin-top: 12px; font-size: 16px;">Click a stage to inspect in Pokédex</p>
    `;

    dexPanel.querySelectorAll('.evo__node').forEach((node) => {
      node.addEventListener('click', () => {
        loadPokemon(node.dataset.id);
      });
    });
  }

  function renderTypesPanel() {
    const typesHtml = currentPokemon.types.map((t, idx) => {
      const typeKey = t.type.name;
      const slotLabel = idx === 0 ? 'PRIMARY TYPE' : 'SECONDARY TYPE';
      return `
        <div class="tgroup">
          <span class="tgroup__label">${slotLabel}</span>
          <div class="tgroup__list">
            <span class="type type--${typeKey}">${formatName(typeKey)}</span>
          </div>
        </div>
      `;
    }).join('');

    const countLabel = currentPokemon.types.length > 1 ? 'Dual Type' : 'Pure Type';

    dexPanel.innerHTML = `
      <h4>POKÉMON TYPES</h4>
      <p class="flavor" style="margin-bottom: 12px;">Classification: <b>${countLabel}</b></p>
      ${typesHtml}
    `;
  }

  function renderMovesPanel() {
    const levelMoves = [];
    currentPokemon.moves.forEach((m) => {
      const vgd = m.version_group_details?.[m.version_group_details.length - 1];
      if (vgd) {
        levelMoves.push({
          name: m.move.name,
          level: vgd.level_learned_at
        });
      }
    });

    levelMoves.sort((a, b) => a.level - b.level);
    const displayMoves = levelMoves.slice(0, 30);

    const listHtml = displayMoves.map((m) => `
      <li class="move-row">
        <b>${m.level > 0 ? `Lv.${m.level}` : 'TM'}</b>
        <span>${formatName(m.name)}</span>
      </li>
    `).join('');

    dexPanel.innerHTML = `
      <h4>LEARNED MOVES</h4>
      <p class="lcd-sub" style="margin-bottom: 8px; font-size: 16px;">Moves from PokéAPI (${displayMoves.length} listed):</p>
      <ul class="move-list">${listHtml}</ul>
    `;
  }

  async function loadPokemon(idOrName) {
    if (loader) loader.classList.add('is-loading');
    piscarLuzes();

    try {
      const pokemon = await api.getPokemon(idOrName);
      let species = null;
      let evolution = null;
      try {
        species = await api.getSpecies(pokemon.id);
        if (species?.evolution_chain?.url) {
          evolution = await api.getEvolutionChain(species.evolution_chain.url);
        }
      } catch {
        // Ignora falha de espécie ou evolução
      }

      currentPokemon = pokemon;
      currentSpecies = species;
      currentEvolution = evolution;

      if (dexNum) dexNum.textContent = formatNumber(pokemon.id);
      if (dexName) dexName.textContent = pokemon.name.toUpperCase();
      if (dexGenus && species) dexGenus.textContent = api.extractGenus(species);

      updateScreenScene(pokemon, species);
      updateSprite();
      updateBadges();
      renderCurrentPanel();
    } catch (err) {
      console.error('Erro ao carregar Pokémon:', err);
    } finally {
      if (loader) loader.classList.remove('is-loading');
    }
  }

  if (lens) lens.addEventListener('click', piscarLuzes);

  if (btnShiny) {
    btnShiny.addEventListener('click', () => {
      isShiny = !isShiny;
      btnShiny.classList.toggle('is-active', isShiny);
      piscarLuzes();
      updateSprite();
      updateBadges();
    });
  }

  if (btnFlip) {
    btnFlip.addEventListener('click', () => {
      isBack = !isBack;
      btnFlip.classList.toggle('is-active', isBack);
      piscarLuzes();
      updateSprite();
    });
  }

  blueKeys.forEach((key) => {
    key.addEventListener('click', () => {
      switchPanel(key.dataset.panel);
    });
  });

  if (btnRandom) {
    btnRandom.addEventListener('click', () => {
      piscarLuzes();
    });
  }

  if (dexSearch && dexInput) {
    dexSearch.addEventListener('submit', (e) => {
      e.preventDefault();
      piscarLuzes();
    });
  }

  dpadButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      piscarLuzes();
    });
  });

  const params = new URLSearchParams(window.location.search);
  const initialId = params.get('id') || 25;
  loadPokemon(initialId);
});
