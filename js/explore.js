document.addEventListener('DOMContentLoaded', () => {
  const chips = document.querySelectorAll('.chip');
  const grid = document.getElementById('explore-grid');

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.classList.remove('is-active'));
      chip.classList.add('is-active');
    });
  });

  if (grid) {
    grid.addEventListener('click', (e) => {
      const card = e.target.closest('.poke-card');
      if (card && card.dataset.id) {
        window.location.href = `../index.html?id=${card.dataset.id}`;
      }
    });
  }
});
