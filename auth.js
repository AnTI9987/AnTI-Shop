/* ========== js/auth.js ========== */
import { db, auth, provider, ref, set, get, signInWithPopup, signOut, onAuthStateChanged }
  from "./firebase.js";
import { state }       from "./state.js";
import { renderShop }  from "./shop.js";
import { startCounterAnimation, startPlateAnimation } from "./animation.js";

function buildUserKeyFromEmail(email) {
  if (!email) return null;
  return email.toLowerCase().replace(/\./g, '_');
}

export async function savePlayerData() {
  if (!state.isGuest && state.userKey) {
    try {
      await set(ref(db, 'users/' + state.userKey), {
        coins:      state.coins,
        clickPower: state.clickPower,
        items:      state.boughtItems,
      });
      state.lastSavedCoins = state.coins;
    } catch (e) {
      console.error("Ошибка сохранения данных в Firebase:", e);
    }
  }
}

function syncUI() {
  const counterValue  = document.getElementById("counterValue");
  const shopBal       = document.getElementById("shopBalanceValue");
  const shopBalClick  = document.getElementById("shopBalanceValueClicker");
  const plateBal      = document.getElementById("plateBalanceValue");

  if (counterValue)  counterValue.textContent  = state.coins;
  if (shopBal)       shopBal.textContent        = state.coins;
  if (shopBalClick)  shopBalClick.textContent   = state.coins;
  if (plateBal)      plateBal.textContent       = state.coins;

  startCounterAnimation(state.coins);
  startPlateAnimation(state.coins);
  renderShop();
}

export function updateAuthUI(user) {
  const loginOutBtn = document.getElementById("loginOutBtn");
  const loginBtnEl  = document.getElementById("loginBtn");

  if (user) {
    loginOutBtn.textContent   = "Выйти из аккаунта";
    loginBtnEl.style.display  = "none";
  } else {
    loginOutBtn.textContent   = "Войти в аккаунт";
    loginBtnEl.style.display  = "block";
  }
}

export function initAuth() {
  const loginBtnEl  = document.getElementById("loginBtn");
  const loginOutBtn = document.getElementById("loginOutBtn");

  onAuthStateChanged(auth, (user) => {
    if (user) {
      state.isGuest  = false;
      state.userKey  = buildUserKeyFromEmail(user.email);
      updateAuthUI(user);

      get(ref(db, 'users/' + state.userKey)).then(snapshot => {
        if (snapshot.exists()) {
          const data         = snapshot.val();
          state.coins        = data.coins      || 0;
          state.clickPower   = data.clickPower  || 1;
          state.boughtItems  = data.items        || { "1": 0, "2": 0 };
          state.lastSavedCoins = state.coins;
          syncUI();
        } else {
          set(ref(db, 'users/' + state.userKey), {
            coins:      state.coins,
            clickPower: state.clickPower,
            items:      state.boughtItems
          }).then(() => { state.lastSavedCoins = state.coins; })
            .catch(e  => console.error(e));
        }
      }).catch(err => console.error(err));

    } else {
      state.isGuest     = true;
      state.userKey     = null;
      state.coins       = 0;
      state.clickPower  = 1;
      state.boughtItems = { "1": 0, "2": 0 };
      updateAuthUI(null);
      syncUI();
    }
  });

  loginBtnEl.addEventListener("click", async () => {
    try { await signInWithPopup(auth, provider); }
    catch (e) { console.error("Ошибка входа:", e); }
  });

  loginOutBtn.addEventListener("click", async () => {
    try {
      if (state.isGuest) await signInWithPopup(auth, provider);
      else               await signOut(auth);
    } catch (e) { console.error("Ошибка авторизации/выхода:", e); }
  });

  // Автосохранение каждые 5 секунд
  setInterval(() => {
    if (!state.isGuest && state.coins !== state.lastSavedCoins) {
      savePlayerData();
    }
  }, 5000);
}
