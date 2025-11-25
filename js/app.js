// app.js - модульный скрипт (требует загрузки через http:// или GitHub Pages)
// сохраняет состояние в Firebase (Realtime DB) и обновляет UI немедленно.

// импорт Firebase (вставлен стабильный CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

/* --------- Firebase config (оставил твой рабочий конфиг) ---------- */
const firebaseConfig = {
  apiKey: "AIzaSyDgG3iDWjGKQVIt7GaYFtDpy5MnMZESxVo",
  authDomain: "anti-shop-d6b33.firebaseapp.com",
  databaseURL: "https://anti-shop-d6b33-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "anti-shop-d6b33",
  storageBucket: "anti-shop-d6b33.firebasestorage.app",
  messagingSenderId: "292698259142",
  appId: "1:292698259142:web:6dfffb2ba0972195bd61c7"
};
/* ------------------------------------------------------------------ */

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// userId: сохраняется в localStorage, чтобы у каждого был свой узел
let userId = localStorage.getItem("userId");
if (!userId) {
  userId = "user_" + Math.random().toString(36).slice(2, 10);
  localStorage.setItem("userId", userId);
}

// DOM
const tabClicker = document.getElementById("tab-clicker");
const tabShop = document.getElementById("tab-shop");
const panelClicker = document.getElementById("panel-clicker");
const panelShop = document.getElementById("panel-shop");
const coinsEl = document.getElementById("coins");
const clickButton = document.getElementById("click-button");
const shopList = document.getElementById("shop-list");

// shopItems: базовые значения (img пути относительно root)
const shopItems = [
  {
    id: 1,
    key: "1",
    name: "Оторванная пуговица",
    cost: 50,
    incrementCost: 50,
    description: "Кажется, эта пуговица служила подобием глаза для плюшевой игрушки.",
    property: "Прибавляет +1 к заработку за клик",
    img: "images/item-1.png",
    stock: null // бесконечный (null = unlimited)
  },
  {
    id: 2,
    key: "2",
    name: "Страшная штука",
    cost: 250,
    power: 10,
    description: "Оно пугает.",
    property: "Прибавляет +10 к заработку за клик",
    img: "images/item-2.png",
    stock: 5
  }
];

// игровой стейт (загружаемый/сохраняемый)
let coins = 0;
let clickPower = 1;

// элементы товара будут храниться, чтобы можно было обновлять UI
const itemNodes = [];

// переключение вкладок
tabClicker.addEventListener("click", () => {
  tabClicker.classList.add("active");
  tabShop.classList.remove("active");
  panelClicker.classList.remove("hidden");
  panelShop.classList.add("hidden");
});
tabShop.addEventListener("click", () => {
  tabShop.classList.add("active");
  tabClicker.classList.remove("active");
  panelShop.classList.remove("hidden");
  panelClicker.classList.add("hidden");
});

// отрисовать магазин (динамически создаёт карточки)
function renderShop() {
  shopList.innerHTML = "";
  itemNodes.length = 0;

  shopItems.forEach((item, idx) => {
    const card = document.createElement("div");
    card.className = "card";

    const top = document.createElement("div");
    top.className = "card-top";

    const img = document.createElement("img");
    img.src = item.img;
    img.alt = item.name;

    const body = document.createElement("div");
    body.className = "card-body";

    const title = document.createElement("div");
    title.className = "card-title";
    title.textContent = item.name;

    const desc = document.createElement("div");
    desc.className = "card-desc";
    desc.textContent = item.description;

    const prop = document.createElement("div");
    prop.className = "card-prop";
    prop.textContent = item.property;

    body.appendChild(title);
    body.appendChild(desc);
    body.appendChild(prop);

    top.appendChild(img);
    top.appendChild(body);

    const actions = document.createElement("div");
    actions.className = "card-actions";

    const btn = document.createElement("button");
    btn.dataset.index = idx; // для идентификации
    // текст кнопки (будет обновляться)
    const stockText = document.createElement("div");
    stockText.className = "stock-text";

    actions.appendChild(btn);
    actions.appendChild(stockText);

    card.appendChild(top);
    card.appendChild(actions);

    shopList.appendChild(card);

    // сохранить ноды для обновления
    itemNodes.push({ btn, stockText, title, body, item });

    // обработчик покупки
    btn.addEventListener("click", async () => {
      await handleBuy(item, idx);
    });
  });

  update
