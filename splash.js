/* ========== js/splash.js ========== */
import { unlockAudio, startMenuMusic } from "./audio.js";

const splashScreen = document.getElementById("splashScreen");
const progressBar  = document.getElementById("progressBar");
const progressPercent = document.getElementById("progressPercent");

splashScreen.style.background  = "#000";
progressBar.style.background   = "#fff";
progressPercent.style.color    = "#fff";

export function fakeLoad(callback) {
  let width = 0;
  const interval = setInterval(() => {
    width += Math.random() * 2 + 0.5;
    if (width > 100) width = 100;
    progressBar.style.width      = width + "%";
    progressPercent.textContent  = Math.floor(width) + "%";
    if (width >= 100) {
      clearInterval(interval);
      splashScreen.classList.add("loaded");
      if (callback) callback();
    }
  }, 50);
}

export function initSplash() {
  const playBtn = document.getElementById("playBtn");

  playBtn.addEventListener("click", () => {
    unlockAudio();
    startMenuMusic();

    splashScreen.style.opacity = "0";
    setTimeout(() => splashScreen.style.display = "none", 1000);
  });
}
