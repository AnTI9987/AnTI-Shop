// clicker.js
import { coins, clickPower, updateUI, spawnFloatingCoin } from './main.js';

const clickImg = document.getElementById("clickImg");
const clickButton = document.getElementById("clickButton");

export function clickAction(x, y) {
  coins += clickPower;
  spawnFloatingCoin(x, y, clickPower);
  updateUI();
}

clickButton.addEventListener("touchstart", e => {
  e.preventDefault();
  for(const t of e.changedTouches){
    clickAction(t.clientX, t.clientY);
  }
  clickImg.src = "img/click2.png";
  clickImg.style.transform = "scale(0.92)";
  setTimeout(() => { clickImg.src = "img/click1.png"; clickImg.style.transform = "scale(1)"; }, 150);
}, {passive:false});

clickButton.onclick = e => {
  clickAction(e.clientX, e.clientY);
  clickImg.src = "img/click2.png";
  clickImg.style.transform = "scale(0.92)";
  setTimeout(() => { clickImg.src = "img/click1.png"; clickImg.style.transform = "scale(1)"; }, 150);
};

export function spawnFloatingCoin(x, y, value){
  const el = document.createElement("div");
  el.className = "floating-coin";
  el.style.left = (x-10) + "px";
  el.style.top = (y-10) + "px";
  el.innerHTML = `<img src="img/anti-coin.png">${value}`;
  document.body.appendChild(el);
  requestAnimationFrame(() => { el.style.transform = "translateY(-60px)"; el.style.opacity = "0"; });
  setTimeout(()=>el.remove(), 800);
}
