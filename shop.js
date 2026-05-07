/* ========== js/shop.js ========== */
import { state }       from "./state.js";
import { startCounterAnimation, startPlateAnimation } from "./animation.js";
import { savePlayerData } from "./auth.js";

const BASE_SHOP_ITEMS = [
  {
    id: 1, name: 'Оторванная пуговица', baseCost: 50,
    description: 'Кажеться, раньше это служило подобием глаза для плюшевой игрушки.',
    property: '+1 к прибыли за клик', incrementCost: 50, img: 'img/item-1.png'
  },
  {
    id: 2, name: 'Страшная штука', baseCost: 250,
    description: 'Оно пугает.',
    property: '+5 к прибыли за клик', power: 5, stock: 5, img: 'img/item-2.png'
  }
];

let shopItems = [];

function updateShopItems() {
  shopItems = BASE_SHOP_ITEMS.map(item => {
    const bought   = state.boughtItems[item.id] || 0;
    const newItem  = { ...item };
    if (item.id === 1) newItem.cost = Math.floor(item.baseCost * Math.pow(1.7, bought));
    if (item.id === 2) newItem.cost = Math.floor(item.baseCost * Math.pow(3.0, bought));
    if (item.stock !== undefined) newItem.stock = Math.max(0, item.stock - bought);
    return newItem;
  });
}

function updateButtonText(item, btn) {
  btn.style.fontFamily = "'Montserrat', sans-serif";
  btn.style.fontWeight = "600";
  btn.innerHTML = "";

  if (item.stock !== undefined && item.stock <= 0) {
    btn.textContent = "распродано";
    btn.disabled    = true;
    return;
  }

  const p     = document.createElement("div");
  p.className = "price";
  p.innerHTML = `${item.cost}<img src="img/anti-coin.png">`;
  p.style.color = (state.coins < item.cost) ? "#ff3333" : "#fff";
  btn.appendChild(p);
}

export function updatePricesColor() {
  document.querySelectorAll('.item .price').forEach(p => {
    const txt  = p.childNodes[0] ? p.childNodes[0].textContent : p.textContent;
    const cost = parseInt(txt) || 0;
    p.style.color = (state.coins < cost) ? "#ff3333" : "#fff";
  });
}

export function renderShop() {
  updateShopItems();
  const itemsBlock = document.getElementById("items");
  itemsBlock.innerHTML = "";

  // Тир-лейбл
  const tierLabel = document.createElement("div");
  tierLabel.style.cssText = "display:flex;align-items:center;justify-content:center;margin-bottom:12px;";

  const lineL = document.createElement("div");
  lineL.style.cssText = "height:3px;background-color:#FFDCC0;flex:1;margin-right:8px;";
  const lineR = document.createElement("div");
  lineR.style.cssText = "height:3px;background-color:#FFDCC0;flex:1;margin-left:8px;";
  const text  = document.createElement("span");
  text.textContent  = "Ⅰ ТИР";
  text.style.cssText = "color:#FFDCC0;font-weight:800;font-size:18px;";

  tierLabel.appendChild(lineL);
  tierLabel.appendChild(text);
  tierLabel.appendChild(lineR);
  itemsBlock.appendChild(tierLabel);

  shopItems.forEach(item => {
    const wrap = document.createElement("div");
    wrap.className     = "itemWrap";
    wrap.style.background = "none";

    const d = document.createElement("div");
    d.className = "item";
    d.style.cssText = "margin:0 auto;";
    d.style.backgroundImage = 'url("img/item-frame.png")';
    d.innerHTML = `
      <div class="item-top">
        <img src="${item.img}">
        <div class="item-text">
          <b>${item.name}</b>
          <p>${item.description}</p>
          <p class="prop">${item.property}</p>
        </div>
      </div>
    `;

    if (item.stock !== undefined) {
      const s = document.createElement("p");
      s.className    = "stock";
      s.textContent  = "В наличии: " + item.stock;
      d.appendChild(s);
    }

    const btn = document.createElement("button");
    btn.classList.add("buy-btn");
    d.appendChild(btn);
    updateButtonText(item, btn);
    btn.addEventListener("click", () => purchaseItem(item));

    wrap.appendChild(d);
    itemsBlock.appendChild(wrap);
  });
}

function purchaseItem(item) {
  if (item.stock !== undefined && item.stock <= 0) return;
  if (state.coins < item.cost) return;

  state.coins -= item.cost;
  state.boughtItems[item.id] = (state.boughtItems[item.id] || 0) + 1;
  state.clickPower += item.id === 1 ? 1 : (item.power || 0);

  startCounterAnimation(state.coins);
  startPlateAnimation(state.coins);
  updatePricesColor();
  renderShop();

  if (!state.isGuest) savePlayerData();
}
