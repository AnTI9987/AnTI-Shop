/* ── js/auth.js ── */
import { auth, provider, signInWithPopup, signOut, onAuthStateChanged }
  from "./firebase.js";
import { state, emailToKey } from "./state.js";
import { loadCoins, saveCoins } from "./db.js";
import { updateBalanceUI }  from "./ui.js";

/* ── DOM ── */
const authBtn       = document.getElementById("authBtn");
const authModal     = document.getElementById("authModal");
const googleSignBtn = document.getElementById("googleSignInBtn");
const modalCloseBtn = document.getElementById("modalCloseBtn");
const balanceDisplay = document.getElementById("balanceDisplay");

/* ── Открыть/закрыть модалку ── */
export function showAuthModal() {
  authModal.classList.remove("hidden");
}

function hideAuthModal() {
  authModal.classList.add("hidden");
}

/* ── Обновить UI хедера под авторизацию ── */
function applyAuthUI(user) {
  if (user) {
    authBtn.textContent = user.displayName
      ? user.displayName.split(" ")[0].toUpperCase()
      : "ВЫЙТИ";
    authBtn.classList.add("signed-in");
    balanceDisplay.classList.remove("hidden");
  } else {
    authBtn.textContent = "ВОЙТИ";
    authBtn.classList.remove("signed-in");
    balanceDisplay.classList.add("hidden");
  }
}

/* ── onAuthStateChanged ── */
export function initAuth(onSignIn, onSignOut) {
  onAuthStateChanged(auth, async (user) => {
    state.user    = user;
    state.userKey = user ? emailToKey(user.email) : null;

    applyAuthUI(user);
    hideAuthModal();

    if (user) {
      state.coins     = await loadCoins();
      state.lastSaved = state.coins;
      updateBalanceUI(state.coins);
      if (onSignIn) onSignIn();
    } else {
      state.coins     = 0;
      state.lastSaved = 0;
      updateBalanceUI(0);
      if (onSignOut) onSignOut();
    }
  });

  /* — кнопка ВОЙТИ в хедере — */
  authBtn.addEventListener("click", async () => {
    if (state.user) {
      /* выход */
      try { await signOut(auth); } catch (e) { console.error(e); }
    } else {
      showAuthModal();
    }
  });

  /* — кнопка Google в модалке — */
  googleSignBtn.addEventListener("click", async () => {
    try { await signInWithPopup(auth, provider); }
    catch (e) { console.error("signIn error:", e); }
  });

  /* — закрыть модалку — */
  modalCloseBtn.addEventListener("click", hideAuthModal);
  authModal.addEventListener("click", (e) => {
    if (e.target === authModal) hideAuthModal();
  });

  /* — автосейв каждые 5 сек — */
  setInterval(() => {
    if (state.user && state.coins !== state.lastSaved) {
      saveCoins();
    }
  }, 5000);
}
