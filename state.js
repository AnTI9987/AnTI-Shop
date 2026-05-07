/* ========== js/state.js ========== */
// Централизованное хранилище состояния игры

export const state = {
  coins:        0,
  clickPower:   1,
  boughtItems:  { "1": 0, "2": 0 },
  isGuest:      true,
  userKey:      null,
  lastSavedCoins: 0,
};

// Гостевой userId
let localUserId = localStorage.getItem("userId");
if (!localUserId) {
  localUserId = "guest_" + Math.random().toString(36).substring(2, 9);
  localStorage.setItem("userId", localUserId);
}
export let userId = localUserId;
