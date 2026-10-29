document.addEventListener('DOMContentLoaded', () => {
  const dexScreen = document.getElementById('dex-screen');
  const dexSprite = document.getElementById('dex-sprite');
  const dexNum = document.getElementById('dex-num');
  const dexBadges = document.getElementById('dex-badges');
  const dexName = document.getElementById('dex-name');
  const dexGenus = document.getElementById('dex-genus');
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

  async function loadPokemon(idOrName) {
    if (loader) loader.classList.add('is-loading');
    piscarLuzes();

    try {
      const pokemon = await api.getPokemon(idOrName);
      let species = null;
      try {
        species = await api.getSpecies(pokemon.id);
      } catch {
        // Ignora falha de espécie
      }

      currentPokemon = pokemon;
      currentSpecies = species;

      if (dexNum) dexNum.textContent = formatNumber(pokemon.id);
      if (dexName) dexName.textContent = pokemon.name.toUpperCase();
      if (dexGenus && species) dexGenus.textContent = api.extractGenus(species);

      updateScreenScene(pokemon, species);
      updateSprite();
      updateBadges();
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
      blueKeys.forEach((k) => k.classList.remove('is-active'));
      key.classList.add('is-active');
      piscarLuzes();
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
  const initialId = params.get('id') || 1;
  loadPokemon(initialId);
});
