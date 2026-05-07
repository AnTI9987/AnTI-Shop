/* ── js/ui.js ── */

const headerCoins  = document.getElementById("headerCoins");
const clickerCoins = document.getElementById("clickerCoins");

/** Обновить оба отображения монет (хедер + кликер) */
export function updateBalanceUI(coins) {
  if (headerCoins)  headerCoins.textContent  = formatCoins(coins);
  if (clickerCoins) clickerCoins.textContent = formatCoins(coins);
}

function formatCoins(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(".0", "") + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(1).replace(".0", "") + "K";
  return String(n);
}

/** Анимированная монетка +N вылетает от точки клика */
export function spawnFloatingCoin(x, y, value) {
  const el = document.createElement("div");
  el.className = "float-coin";
  el.textContent = `+${value} ₳`;
  el.style.left = (x - 20) + "px";
  el.style.top  = (y - 20) + "px";
  document.body.appendChild(el);

  /* запускаем анимацию в следующем кадре */
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.style.transform = "translateY(-80px)";
      el.style.opacity   = "0";
    });
  });

  setTimeout(() => el.remove(), 700);
}
