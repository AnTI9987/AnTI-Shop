/* ── js/clicker.js ── */
import { state }           from "./state.js";
import { saveCoins }       from "./db.js";
import { showAuthModal }   from "./auth.js";
import { updateBalanceUI, spawnFloatingCoin } from "./ui.js";

/* ── DOM ── */
const drawer         = document.getElementById("clickerDrawer");
const toggleBtn      = document.getElementById("clickerToggleBtn");
const backBtn        = document.getElementById("clickerBackBtn");
const mainClickBtn   = document.getElementById("mainClickBtn");
const clickImg       = document.getElementById("clickImg");
const character      = document.getElementById("clickCharacter");

let isOpen = false;

/* ──────────────────────────────────────────────── */
/*  OPEN / CLOSE                                   */
/* ──────────────────────────────────────────────── */

function openDrawer() {
  drawer.classList.remove("closing");
  drawer.classList.add("open");
  isOpen = true;
  /* не даём скролить страницу под drawer */
  document.body.style.overflow = "hidden";
}

function closeDrawer() {
  /* меняем кривую на "raise" перед удалением .open */
  drawer.classList.add("closing");
  drawer.classList.remove("open");
  isOpen = false;
  document.body.style.overflow = "";

  /* убираем класс closing после окончания transition */
  drawer.addEventListener("transitionend", function cleanup(e) {
    if (e.propertyName === "transform") {
      drawer.classList.remove("closing");
      drawer.removeEventListener("transitionend", cleanup);
    }
  });
}

/* ──────────────────────────────────────────────── */
/*  КНОПКА ОТКРЫТИЯ: проверка авторизации          */
/* ──────────────────────────────────────────────── */

toggleBtn.addEventListener("click", () => {
  if (!state.user) {
    showAuthModal();
    return;
  }
  openDrawer();
});

backBtn.addEventListener("click", closeDrawer);

/* ESC тоже закрывает */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && isOpen) closeDrawer();
});

/* ──────────────────────────────────────────────── */
/*  КЛИК                                           */
/* ──────────────────────────────────────────────── */

function handleClick(x, y) {
  state.coins += 1;
  updateBalanceUI(state.coins);
  spawnFloatingCoin(x, y, 1);
  animateCharacter();
}

function animateCharacter() {
  /* персонаж */
  if (clickImg) {
    clickImg.style.transform = "scale(0.91)";
    /* пробуем подменить картинку click2.png */
    const src2 = clickImg.src.replace("click1.png", "click2.png");
    clickImg.src = src2;
  }
  character.classList.add("pressed");

  setTimeout(() => {
    if (clickImg) {
      clickImg.style.transform = "scale(1)";
      clickImg.src = clickImg.src.replace("click2.png", "click1.png");
    }
    character.classList.remove("pressed");
  }, 100);
}

/* mouse */
mainClickBtn.addEventListener("click", (e) => {
  handleClick(e.clientX, e.clientY);
});

/* touch — preventDefault чтобы не было двойного срабатывания */
mainClickBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  for (const t of e.changedTouches) {
    handleClick(t.clientX, t.clientY);
  }
}, { passive: false });

/* сохранить при закрытии страницы */
window.addEventListener("beforeunload", () => {
  if (state.user && state.coins !== state.lastSaved) {
    saveCoins();
  }
});

export { openDrawer, closeDrawer };
