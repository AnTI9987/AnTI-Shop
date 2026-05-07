/* ========== js/clicker.js ========== */
import { state }       from "./state.js";
import { startCounterAnimation, startPlateAnimation } from "./animation.js";
import { updatePricesColor } from "./shop.js";
import { playSound, sClickClicker } from "./audio.js";

const clickButton = document.getElementById("clickButton");
const clickImg    = document.getElementById("clickImg");

clickImg.style.display   = "block";
clickImg.style.marginTop = "50px";

/* ---- Монетки ↑ ---- */
function spawnFloatingCoin(x, y, value) {
  const el     = document.createElement("div");
  el.className = "floating-coin";
  el.style.left  = (x - 12) + "px";
  el.style.top   = (y - 12) + "px";
  el.innerHTML   = `
    <span style="font-weight:700;font-size:18px;color:#ffffff;text-shadow:0 2px 6px rgba(0,0,0,0.45);">+${value}</span>
    <img src="img/anti-coin.png" style="width:18px;height:18px;margin-left:6px;">
  `;
  document.body.appendChild(el);

  requestAnimationFrame(() => {
    el.style.transition = "transform 0.7s ease-out, opacity 0.7s ease-out";
    el.style.transform  = "translateY(-80px)";
    el.style.opacity    = "0";
  });
  setTimeout(() => el.remove(), 750);
}

function clickAction(x, y) {
  const counterValue = document.getElementById("counterValue");

  if (state.clickPower === 1) {
    state.coins++;
    counterValue.textContent = state.coins;
    const shopBal      = document.getElementById("shopBalanceValue");
    const shopBalClick = document.getElementById("shopBalanceValueClicker");
    const plateBal     = document.getElementById("plateBalanceValue");
    if (shopBal)      shopBal.textContent      = state.coins;
    if (shopBalClick) shopBalClick.textContent  = state.coins;
    if (plateBal)     plateBal.textContent      = state.coins;
    spawnFloatingCoin(x, y, 1);
    updatePricesColor();
    return;
  }

  state.coins += state.clickPower;
  startCounterAnimation(state.coins);
  startPlateAnimation(state.coins);
  spawnFloatingCoin(x, y, state.clickPower);
  updatePricesColor();
}

function animateClicker() {
  const breath = document.getElementById("characterBreath");
  clickImg.style.transform = "scale(0.93)";
  clickImg.src             = "img/click2.png";
  breath.classList.add("shadow-pressed");

  setTimeout(() => {
    clickImg.style.transform = "scale(1)";
    clickImg.src             = "img/click1.png";
    breath.classList.remove("shadow-pressed");
  }, 100);
}

export function initClicker() {
  clickButton.addEventListener("click", e => {
    playSound(sClickClicker);
    clickAction(e.clientX, e.clientY);
    animateClicker();
  });

  clickButton.addEventListener("touchstart", e => {
    e.preventDefault();
    playSound(sClickClicker);
    for (const t of e.changedTouches) {
      clickAction(t.clientX, t.clientY);
    }
    animateClicker();
  }, { passive: false });
}
