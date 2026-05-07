/* ========== js/ui.js ========== */
import { state }       from "./state.js";
import { renderShop, updatePricesColor } from "./shop.js";
import { startCounterAnimation, startPlateAnimation } from "./animation.js";
import { playSound, sClickWood, sClickButton, soundEnabled } from "./audio.js";
import { savePlayerData } from "./auth.js";

/* ---- PANELS ---- */
const panels         = document.getElementById("panels");
const shopBtnEl      = document.getElementById("shopBtn");
const backBtnEl      = document.getElementById("backBtn");
const settingsBtnEl  = document.getElementById("settingsBtn");
const loginBtnEl     = document.getElementById("loginBtn");
const backToClickerBtn = document.getElementById("backToClickerBtn");

settingsBtnEl.classList.add("settings-btn");
settingsBtnEl.style.fontFamily = "'Montserrat', sans-serif";
settingsBtnEl.style.fontWeight = "600";

panels.style.transform = "translateX(-392px)"; // стартовое положение как в оригинале

let btnTimers = {};

function safeSetStyle(el, prop, value, delay = 0) {
  const id = (el.id || Math.random()) + prop;
  if (btnTimers[id]) clearTimeout(btnTimers[id]);
  if (delay === 0) el.style[prop] = value;
  else btnTimers[id] = setTimeout(() => { el.style[prop] = value; }, delay);
}

/* ---- PLATE SWING ---- */
export function swingPlate(direction) {
  const plate = document.getElementById("topPlate");
  if (!plate) return;

  plate.classList.remove("plate-hit");
  plate.classList.remove("swinging");
  void plate.offsetWidth;

  let deg1 = 8, deg2 = -5, deg3 = 3;
  if (direction === "right") { deg1 = -deg1; deg2 = -deg2; deg3 = -deg3; }

  plate.style.setProperty("--deg1", deg1 + "deg");
  plate.style.setProperty("--deg2", deg2 + "deg");
  plate.style.setProperty("--deg3", deg3 + "deg");
  plate.classList.add("swinging");

  plate.addEventListener("animationend", function handler() {
    plate.classList.remove("swinging");
    plate.removeEventListener("animationend", handler);
  });
}

/* ---- НАВИГАЦИЯ ---- */
function goToShop() {
  swingPlate("left");
  panels.style.transform      = "translateX(-200vw)";
  shopBtnEl.style.right       = "-60px";
  settingsBtnEl.style.left    = "-60px";
  loginBtnEl.style.left       = "-60px";
  backToClickerBtn.style.display = "block";
  backToClickerBtn.style.right   = "-60px";
  setTimeout(() => safeSetStyle(backToClickerBtn, "right", "12px", 0), 50);
  updatePricesColor();
}

function goBackFromShop() {
  swingPlate("right");
  panels.style.transform = "translateX(-100vw)";
  safeSetStyle(backToClickerBtn, "right", "-60px");
  safeSetStyle(backToClickerBtn, "display", "none", 400);
  shopBtnEl.style.right    = "12px";
  settingsBtnEl.style.left = "12px";
  loginBtnEl.style.left    = "12px";
}

function goToSettings() {
  swingPlate("right");
  panels.style.transform   = "translateX(0)";
  shopBtnEl.style.right    = "-60px";
  settingsBtnEl.style.left = "-60px";
  loginBtnEl.style.left    = "-60px";
  backBtnEl.style.display  = "block";
  safeSetStyle(backBtnEl, "right", "12px", 50);
}

function goBackFromSettings() {
  swingPlate("left");
  panels.style.transform   = "translateX(-100vw)";
  shopBtnEl.style.right    = "12px";
  settingsBtnEl.style.left = "12px";
  safeSetStyle(backBtnEl, "right", "-60px");
  safeSetStyle(backBtnEl, "display", "none", 500);
  loginBtnEl.style.left    = "12px";
}

shopBtnEl.onclick       = goToShop;
settingsBtnEl.onclick   = goToSettings;
backBtnEl.onclick       = goBackFromSettings;
backToClickerBtn.onclick = goBackFromShop;

/* ---- PLATE CLICK ---- */
export function initPlateClick() {
  const topPlateEl = document.getElementById("topPlate");
  if (!topPlateEl) return;

  topPlateEl.addEventListener("click", () => {
    if (topPlateEl.style.display === "none") return;
    playSound(sClickWood);
    topPlateEl.classList.remove("plate-hit");
    void topPlateEl.offsetWidth;
    topPlateEl.classList.add("plate-hit");
  });

  topPlateEl.addEventListener("animationend", e => {
    if (e && e.animationName && e.animationName.toLowerCase().includes("hit")) {
      topPlateEl.classList.remove("plate-hit");
    }
  });
}

/* ---- ГЛОБАЛЬНЫЙ ЗВУК КНОПОК ---- */
export function initGlobalButtonSound() {
  function handleButtonSound(e) {
    if (!soundEnabled) return;
    const btn = e.target.closest("button");
    if (!btn) return;
    if (btn.classList.contains("buy-btn")) return;
    if (btn.id === "clickButton") return;
    playSound(sClickButton);
  }

  let isTouch = false;
  document.addEventListener("touchstart", () => { isTouch = true; }, { once: true });
  document.addEventListener("touchstart", handleButtonSound, { passive: true });
  document.addEventListener("click", e => { if (!isTouch) handleButtonSound(e); });
}

/* ---- КНОПКА "СБРОСИТЬ ПРОГРЕСС" ---- */
export function initResetButton() {
  const loginOutBtn = document.getElementById("loginOutBtn");
  const resetBtn    = document.createElement("button");
  resetBtn.textContent          = "Сбросить прогресс";
  resetBtn.style.fontFamily     = "'Montserrat', sans-serif";
  resetBtn.style.fontWeight     = "600";
  resetBtn.style.display        = "block";
  resetBtn.style.marginTop      = "12px";
  loginOutBtn.parentNode.insertBefore(resetBtn, loginOutBtn.nextSibling);

  resetBtn.onclick = async () => {
    const msg = state.isGuest
      ? "Вы уверены, что хотите сбросить прогресс? Все локальные достижения будут испепелены!"
      : "Вы уверены, что хотите сбросить прогресс? Все достижения на вашем аккаунте будут испепелены!";

    if (!confirm(msg)) return;

    state.coins       = 0;
    state.clickPower  = 1;
    state.boughtItems = { "1": 0, "2": 0 };

    ["counterValue", "shopBalanceValue", "shopBalanceValueClicker", "plateBalanceValue"]
      .forEach(id => { const el = document.getElementById(id); if (el) el.textContent = 0; });

    renderShop();
    startCounterAnimation(state.coins);
    startPlateAnimation(state.coins);

    if (!state.isGuest) {
      await savePlayerData();
      state.lastSavedCoins = state.coins;
    }
  };
}
