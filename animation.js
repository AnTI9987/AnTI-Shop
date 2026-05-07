/* ========== js/animation.js ========== */

export function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

/* ---- Плашка (topPlate) ---- */
const plateAnim = {
  running: false, startTime: 0,
  duration: 400, baseDuration: 400,
  from: 0, to: 0, rafId: null
};

export function startPlateAnimation(newTarget) {
  const el = document.getElementById("plateBalanceValue");
  const now = performance.now();

  if (!plateAnim.running) {
    plateAnim.running   = true;
    plateAnim.from      = Number(el.textContent) || 0;
    plateAnim.to        = newTarget;
    plateAnim.startTime = now;
    plateAnim.duration  = plateAnim.baseDuration;
  } else {
    const p = Math.min((now - plateAnim.startTime) / plateAnim.duration, 1);
    const cur = plateAnim.from + (plateAnim.to - plateAnim.from) * easeOutCubic(p);
    plateAnim.from      = cur;
    plateAnim.to        = newTarget;
    plateAnim.startTime = now;
    plateAnim.duration  = Math.max(60, plateAnim.baseDuration * 0.6);
  }

  if (plateAnim.rafId) cancelAnimationFrame(plateAnim.rafId);
  plateTick();
}

function plateTick() {
  const el  = document.getElementById("plateBalanceValue");
  const now = performance.now();
  const p   = Math.min((now - plateAnim.startTime) / plateAnim.duration, 1);
  el.textContent = Math.floor(plateAnim.from + (plateAnim.to - plateAnim.from) * easeOutCubic(p));

  if (p < 1) {
    plateAnim.rafId = requestAnimationFrame(plateTick);
  } else {
    plateAnim.running = false;
    plateAnim.rafId   = null;
    el.textContent    = plateAnim.to;
  }
}

/* ---- Счётчик (counter) ---- */
const counterAnim = {
  running: false, startTime: 0,
  duration: 220, baseDuration: 220,
  from: 0, to: 0, rafId: null
};

export function startCounterAnimation(newTarget) {
  const mainEl = document.getElementById("counterValue");
  const now    = performance.now();

  if (!counterAnim.running) {
    counterAnim.running   = true;
    counterAnim.from      = Number(mainEl.textContent) || 0;
    counterAnim.to        = newTarget;
    counterAnim.startTime = now;
    counterAnim.duration  = counterAnim.baseDuration;
  } else {
    const p = Math.min((now - counterAnim.startTime) / counterAnim.duration, 1);
    const cur = counterAnim.from + (counterAnim.to - counterAnim.from) * easeOutCubic(p);
    counterAnim.from      = cur;
    counterAnim.to        = newTarget;
    counterAnim.startTime = now;
    counterAnim.duration  = Math.max(60, counterAnim.baseDuration * 0.6);
  }

  if (counterAnim.rafId) cancelAnimationFrame(counterAnim.rafId);
  counterTick();
}

function counterTick() {
  const shopEl   = document.getElementById("shopBalanceValue");
  const clickerEl = document.getElementById("shopBalanceValueClicker");
  const mainEl   = document.getElementById("counterValue");
  const now      = performance.now();
  const p        = Math.min((now - counterAnim.startTime) / counterAnim.duration, 1);
  const value    = Math.floor(counterAnim.from + (counterAnim.to - counterAnim.from) * easeOutCubic(p));

  if (shopEl)    shopEl.textContent    = value;
  if (clickerEl) clickerEl.textContent = value;
  if (mainEl)    mainEl.textContent    = value;

  if (p < 1) {
    counterAnim.rafId = requestAnimationFrame(counterTick);
  } else {
    counterAnim.running = false;
    counterAnim.rafId   = null;
    const final = counterAnim.to;
    if (shopEl)    shopEl.textContent    = final;
    if (clickerEl) clickerEl.textContent = final;
    if (mainEl)    mainEl.textContent    = final;
  }
}
