const GENERATIONS = [
  { id: 'all', name: 'All Regions', start: 1, end: 1025 },
  { id: '1', name: 'Kanto (Gen 1)', start: 1, end: 151 },
  { id: '2', name: 'Johto (Gen 2)', start: 152, end: 251 },
  { id: '3', name: 'Hoenn (Gen 3)', start: 252, end: 386 },
  { id: '4', name: 'Sinnoh (Gen 4)', start: 387, end: 493 },
  { id: '5', name: 'Unova (Gen 5)', start: 494, end: 649 },
  { id: '6', name: 'Kalos (Gen 6)', start: 650, end: 721 },
  { id: '7', name: 'Alola (Gen 7)', start: 722, end: 809 },
  { id: '8', name: 'Galar (Gen 8)', start: 810, end: 898 },
  { id: '9', name: 'Paldea (Gen 9)', start: 899, end: 1025 }
];

const TYPE_COLORS = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD'
};

function formatNumber(num) {
  return '#' + String(num || 0).padStart(4, '0');
}

function formatName(name) {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function formatStatName(name) {
  if (name === 'hp') return 'HP';
  if (name === 'special-attack') return 'Sp. Atk';
  if (name === 'special-defense') return 'Sp. Def';
  return formatName(name);
}

function formatHeight(decimeters) {
  return `${((decimeters || 0) / 10).toFixed(1)} m`;
}

function formatWeight(hectograms) {
  return `${((hectograms || 0) / 10).toFixed(1)} kg`;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    GENERATIONS,
    TYPE_COLORS,
    formatNumber,
    padNumber: formatNumber,
    formatName,
    formatStatName,
    formatHeight,
    formatWeight
  };
}
