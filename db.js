/* ── js/db.js ── */
import { db, ref, set, get } from "./firebase.js";
import { state }             from "./state.js";

export async function loadCoins() {
  if (!state.userKey) return 0;
  try {
    const snap = await get(ref(db, `users/${state.userKey}/coins`));
    return snap.exists() ? (snap.val() || 0) : 0;
  } catch (e) {
    console.error("loadCoins:", e);
    return 0;
  }
}

export async function saveCoins() {
  if (!state.userKey) return;
  try {
    await set(ref(db, `users/${state.userKey}/coins`), state.coins);
    state.lastSaved = state.coins;
  } catch (e) {
    console.error("saveCoins:", e);
  }
}
