const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

const ENDPOINTS = {
  BASE: POKEAPI_BASE_URL,
  pokemon: (idOrName) => `${POKEAPI_BASE_URL}/pokemon/${idOrName}`,
  pokemonList: (limit = 1025) => `${POKEAPI_BASE_URL}/pokemon?limit=${limit}`,
  species: (idOrName) => `${POKEAPI_BASE_URL}/pokemon-species/${idOrName}`,
  type: (name) => `${POKEAPI_BASE_URL}/type/${name}`,
  evolutionChain: (url) => url
};

class PokeApiClient {
  constructor() {
    this.pokemonIndex = [];
    this.pokemonCache = new Map();
    this.typeCache = new Map();
  }

  async fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  }

  async initIndex() {
    if (this.pokemonIndex.length > 0) return this.pokemonIndex;
    const data = await this.fetchJson(ENDPOINTS.pokemonList(1025));
    this.pokemonIndex = data.results.map((item, index) => ({
      id: index + 1,
      name: item.name
    }));
    return this.pokemonIndex;
  }

  async getPokemon(idOrName) {
    const key = String(idOrName).toLowerCase();
    if (this.pokemonCache.has(key)) return this.pokemonCache.get(key);

    const data = await this.fetchJson(ENDPOINTS.pokemon(idOrName));
    this.pokemonCache.set(key, data);
    this.pokemonCache.set(String(data.id), data);
    this.pokemonCache.set(data.name.toLowerCase(), data);
    return data;
  }

  async getTypePokemon(typeName) {
    const type = String(typeName).toLowerCase();
    if (this.typeCache.has(type)) return this.typeCache.get(type);

    const data = await this.fetchJson(ENDPOINTS.type(type));
    const ids = new Set();
    data.pokemon?.forEach((entry) => {
      const parts = entry.pokemon?.url?.split('/').filter(Boolean);
      if (parts && parts.length > 0) {
        const id = parseInt(parts[parts.length - 1], 10);
        if (id <= 1025) ids.add(id);
      }
    });
    this.typeCache.set(type, ids);
    return ids;
  }

  async getSpecies(idOrName) {
    return this.fetchJson(ENDPOINTS.species(idOrName));
  }

  async getEvolutionChain(url) {
    if (!url) return null;
    return this.fetchJson(url);
  }

  extractSprites(pokemon) {
    if (!pokemon) return null;
    const s = pokemon.sprites || {};
    return {
      front: s.other?.showdown?.front_default || s.front_default || '',
      back: s.other?.showdown?.back_default || s.back_default || '',
      frontShiny: s.other?.showdown?.front_shiny || s.front_shiny || '',
      backShiny: s.other?.showdown?.back_shiny || s.back_shiny || ''
    };
  }

  extractFlavorText(species) {
    if (!species?.flavor_text_entries) return 'No description available.';
    const entry = species.flavor_text_entries.find(e => e.language?.name === 'en');
    return entry ? entry.flavor_text.replace(/[\n\f]/g, ' ') : 'No description available.';
  }

  extractGenus(species) {
    if (!species?.genera) return '';
    const entry = species.genera.find(g => g.language?.name === 'en');
    return entry ? entry.genus : '';
  }

  parseEvolutionChain(chainNode) {
    const root = chainNode?.chain || chainNode;
    if (!root || !root.species) return [];

    const list = [];
    function traverse(node, fromName = null) {
      if (!node?.species) return;
      const parts = node.species.url.split('/').filter(Boolean);
      const id = parseInt(parts[parts.length - 1], 10);
      const detail = node.evolution_details?.[0]?.min_level ? `Lv. ${node.evolution_details[0].min_level}` : '';

      list.push({ id, name: node.species.name, from: fromName, detail });
      node.evolves_to?.forEach(child => traverse(child, node.species.name));
    }

    traverse(root);
    return list;
  }
}

const api = new PokeApiClient();
