document.addEventListener('DOMContentLoaded', () => {
  const lens = document.getElementById('lens');
  const leds = document.getElementById('leds');
  const btnShiny = document.getElementById('btn-shiny');
  const btnFlip = document.getElementById('btn-flip');
  const btnRandom = document.getElementById('btn-random');
  const blueKeys = document.querySelectorAll('.blue-key');
  const dexSearch = document.getElementById('dex-search');
  const dexInput = document.getElementById('dex-input');
  const dpadButtons = document.querySelectorAll('.dpad button');

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

  if (lens) lens.addEventListener('click', piscarLuzes);

  if (btnShiny) {
    btnShiny.addEventListener('click', () => {
      isShiny = !isShiny;
      btnShiny.classList.toggle('is-active', isShiny);
      piscarLuzes();
    });
  }

  if (btnFlip) {
    btnFlip.addEventListener('click', () => {
      isBack = !isBack;
      btnFlip.classList.toggle('is-active', isBack);
      piscarLuzes();
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
});
