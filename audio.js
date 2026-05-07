/* ========== js/audio.js ========== */
// Управление звуком. iPhone не разрешает менять volume у new Audio(),
// поэтому все звуки — только через <audio> теги в HTML.

export const menuMusic    = document.getElementById("menuMusic");
export const sClickWood   = document.getElementById("sClickWood");
export const sClickClicker = document.getElementById("sClickClicker");
export const sClickButton = document.getElementById("sClickButton");

export let musicEnabled = true;
export let soundEnabled = true;
export let audioUnlocked = false;

const ALL_SOUNDS = [menuMusic, sClickButton, sClickClicker, sClickWood];

/** Разблокировать аудио на первом пользовательском жесте */
export function unlockAudio() {
  if (audioUnlocked) return;
  ALL_SOUNDS.forEach(a => {
    if (!a) return;
    a.muted = false;
    a.volume = 0.8;
    a.currentTime = 0;
    a.play().catch(() => {});
  });
  audioUnlocked = true;
}

export function playSound(audio) {
  if (!soundEnabled || !audio) return;
  try {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch (e) {}
}

export function toggleMusic() {
  musicEnabled = !musicEnabled;
  if (musicEnabled) {
    menuMusic.volume = 0.8;
    menuMusic.play().catch(() => {});
  } else {
    menuMusic.pause();
  }
  document.querySelector("#musicToggleBtn img").src =
    musicEnabled ? "img/music-volume-on.png" : "img/music-volume-off.png";
}

export function toggleSound() {
  soundEnabled = !soundEnabled;
  document.querySelector("#soundToggleBtn img").src =
    soundEnabled ? "img/sound-volume-on.png" : "img/sound-volume-off.png";

  const vol = soundEnabled ? 0.8 : 0;
  if (sClickWood)    sClickWood.volume    = vol;
  if (sClickClicker) sClickClicker.volume = vol;
  if (sClickButton)  sClickButton.volume  = vol;
}

export function startMenuMusic() {
  if (musicEnabled) {
    menuMusic.loop = true;
    menuMusic.play().catch(() => {});
  }
}
