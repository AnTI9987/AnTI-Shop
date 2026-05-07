/* ── js/state.js ── */

export const state = {
  user:      null,    // Firebase User object или null
  userKey:   null,    // ключ в БД (email → safe key)
  coins:     0,
  lastSaved: 0,
};

/** email → безопасный ключ для Firebase */
export function emailToKey(email) {
  return email.toLowerCase().replace(/\./g, '_').replace(/@/g, '__at__');
}
