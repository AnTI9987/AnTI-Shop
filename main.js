/* ========== js/main.js ========== */
// Точка входа — инициализирует все модули

import { fakeLoad, initSplash } from "./splash.js";
import { initClicker }          from "./clicker.js";
import { initAuth }             from "./auth.js";
import { initPlateClick, initGlobalButtonSound, initResetButton } from "./ui.js";
import { toggleMusic, toggleSound } from "./audio.js";
import { renderShop }           from "./shop.js";
import { startCounterAnimation, startPlateAnimation } from "./animation.js";

// Предзагрузка изображений
["img/click1.png", "img/click2.png", "img/anti-coin.png", "img/item-1.png", "img/item-2.png"]
  .forEach(src => { const img = new Image(); img.src = src; });

// Инициализация модулей
initSplash();
initClicker();
initPlateClick();
initGlobalButtonSound();
initResetButton();
initAuth();

// Звуковые кнопки в настройках
document.getElementById("musicToggleBtn").addEventListener("click", toggleMusic);
document.getElementById("soundToggleBtn").addEventListener("click", toggleSound);

// Старт: прогрузка → начальные значения
const panels = document.getElementById("panels");

fakeLoad(() => {
  panels.style.transform = "translateX(-100vw)";
  renderShop();

  const topPlate = document.getElementById("topPlate");
  if (topPlate) topPlate.style.display = "block";

  // Инициализация UI значений
  ["counterValue", "shopBalanceValue", "shopBalanceValueClicker", "plateBalanceValue"]
    .forEach(id => { const el = document.getElementById(id); if (el) el.textContent = 0; });
});
