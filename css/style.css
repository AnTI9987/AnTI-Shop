import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDgG3iDWjGKQVIt7GaYFtDpy5MnMZESxVo",
  authDomain: "anti-shop-d6b33.firebaseapp.com",
  databaseURL: "https://anti-shop-d6b33-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "anti-shop-d6b33",
  storageBucket: "anti-shop-d6b33.appspot.com",
  messagingSenderId: "292698259142",
  appId: "1:292698259142:web:6dfffb2ba0972195bd61c7"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let userId = localStorage.getItem("userId");
if (!userId) {
  userId = "user_" + Math.random().toString(36).substr(2, 9);
  localStorage.setItem("userId", userId);
}

let coins = 0;
let clickPower = 1;

const counter = document.getElementById('counter');
const clickButton = document.getElementById('clickButton');
const itemsBlock = document.getElementById('items');

const clickerPanel = document.getElementById('clickerPanel');
const shopPanel = document.getElementById('shopPanel');
const clickerTab = document.getElementById('clickerTab');
const shopTab = document.getElementById('shopTab');

clickerTab.addEventListener('click', () => {
  clickerPanel.style.display = 'block';
  shopPanel.style.display = 'none';
  clickerTab.classList.add('active');
  shopTab.classList.remove('active');
});

shopTab.addEventListener('click', () => {
  clickerPanel.style.display = 'none';
  shopPanel.style.display = 'block';
  shopTab.classList.add('active');
  clickerTab.classList.remove('active');
});

const shopItems = [
  {
    id: 1,
    name: 'Оторванная пуговица',
    cost: 50,
    description: 'Кажется, эта пуговица служила подобием глаза для плюшевой игрушки.',
    property: 'Прибавляет +1 к заработку за клик',
    incrementCost: 50,
    img: 'img/item-1.png'
  },
  {
    id: 2,
    name: 'Страшная штука',
    cost: 250,
    description: 'Оно пугает.',
    property: 'Прибавляет +10 к заработку за клик',
    power: 10,
    stock: 5,
    img: 'img/item-2.png'
  }
];

async function loadData() {
  const snapshot = await get(ref(db, "players/" + userId));
  if (snapshot.exists()) {
    const data = snapshot.val();
    coins = data.coins ?? 0;
    clickPower = data.clickPower ?? 1;

    if (data.shopItems) {
      shopItems.forEach(item => {
        if (data.shopItems[item.id]) {
          item.stock = data.shopItems[item.id].stock ?? item.stock;
          if (item.id === 1) item.cost = data.shopItems[item.id].cost ?? item.cost;
        }
      });
    }
  }
  updateUI();
}

function saveData() {
  const shopData = {};
  shopItems.forEach(item => {
    shopData[item.id] = { stock: item.stock ?? null, cost: item.cost ?? null };
  });

  update(ref(db, "players/" + userId), {
    coins: coins,
    clickPower: clickPower,
    shopItems: shopData
  });
}

function renderShop() {
  itemsBlock.innerHTML = '';
  shopItems.forEach(item => {
    const div = document.createElement('div');
    div.className = 'item';

    const button = document.createElement('button');
    const stockEl = document.createElement('p');
    stockEl.className = 'stock';
    if (item.stock !== undefined) stockEl.textContent = `В наличии: ${item.stock}`;

    const updateButtonText = () => {
      if (item.stock !== undefined && item.stock <= 0) {
        button.textContent = 'распродано';
        button.style.color = 'gray';
        if (stockEl) stockEl.textContent = '';
      } else {
        button.textContent = `Купить за ${item.cost}`;
        button.style.fontWeight = 'bold';
        if (stockEl && item.stock !== undefined) stockEl.textContent = `В наличии: ${item.stock}`;
      }
    };

    button.addEventListener('click', () => {
      if ((item.stock === undefined || item.stock > 0) && coins >= item.cost) {
        coins -= item.cost;
        if (item.id === 1) { clickPower += 1; item.cost += item.incrementCost; }
        if (item.id === 2 && item.stock > 0) { clickPower += item.power; item.stock -= 1; }
        updateUI();
        saveData();
        updateButtonText();
      }
    });

    div.innerHTML = `
      <div class="item-top">
        <img src="${item.img}" alt="${item.name}">
        <div class="item-text">
          <b>${item.name}</b>
          <p>${item.description}</p>
          <p class='property'>${item.property}</p>
        </div>
      </div>
    `;
    if (item.stock !== undefined) div.appendChild(stockEl);
    div.appendChild(button); // кнопка внизу
    itemsBlock.appendChild(div);

    updateButtonText();
  });
  updateUI();
}

function updateUI() {
  counter.textContent = coins;
  document.querySelectorAll('.item').forEach((div, i) => {
    const btn = div.querySelector('button');
    const item = shopItems[i];
    if (item.stock !== undefined && item.stock <= 0) btn.style.color = 'gray';
    else if (coins >= item.cost) btn.style.color = 'lime';
    else btn.style.color = 'red';
  });
}

clickButton.addEventListener('click', () => { coins += clickPower; updateUI(); saveData(); });

renderShop();
loadData();
clickerPanel.style.display = 'block';
