/* ── js/main.js ── */
import { initAuth } from "./auth.js";
import "./clicker.js"; /* регистрирует слушатели */

/* ──────────────────────────────────────────────── */
/*  СТАРТ                                          */
/* ──────────────────────────────────────────────── */

initAuth(
  /* onSignIn  */ () => { /* можно расширить: рендер каталога и т.д. */ },
  /* onSignOut */ () => {}
);

/* ──────────────────────────────────────────────── */
/*  АУДИО — разблокировка на первом касании        */
/* ──────────────────────────────────────────────── */

const sClick = document.getElementById("sClick");
const sBtn   = document.getElementById("sBtn");
let audioReady = false;

function unlockAudio() {
  if (audioReady) return;
  [sClick, sBtn].forEach(a => {
    if (!a) return;
    a.volume = 0.7;
    a.play().catch(() => {}).then(() => a.pause());
  });
  audioReady = true;
}

document.addEventListener("click",      unlockAudio, { once: true });
document.addEventListener("touchstart", unlockAudio, { once: true });

/* маленький звук на клик кнопок (не кликер) */
document.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn || btn.id === "mainClickBtn") return;
  if (!audioReady || !sBtn) return;
  try { sBtn.currentTime = 0; sBtn.play().catch(() => {}); } catch (_) {}
});

/* звук кликера обрабатывается отдельно внутри clicker.js,
   но можно добавить его здесь если нужно */
document.getElementById("mainClickBtn")?.addEventListener("click", () => {
  if (!audioReady || !sClick) return;
  try { sClick.currentTime = 0; sClick.play().catch(() => {}); } catch (_) {}
});
