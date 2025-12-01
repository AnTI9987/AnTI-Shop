/* =========================================================
    FIREBASE
========================================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged }
    from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAcv5AfJPjUA-RGfcAsUiQwvucSxkJX4F0",
    authDomain: "anti-shop-99f1d.firebaseapp.com",
    databaseURL: "https://anti-shop-99f1d-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "anti-shop-99f1d",
    storageBucket: "anti-shop-99f1d.firebasestorage.app",
    messagingSenderId: "347202416802",
    appId: "1:347202416802:web:2d2df1b819be9da180e7fb"
};

const appFB = initializeApp(firebaseConfig);
const db = getDatabase(appFB);
const auth = getAuth(appFB);
const provider = new GoogleAuthProvider();

/* =========================================================
    SPLASH SCREEN
========================================================= */

const splashScreen = document.getElementById("splashScreen");
const progressBar = document.getElementById("progressBar");
const progressPercent = document.getElementById("progressPercent");

let progress = 0;

function fakeLoad(onDone) {
    progress = 1;
    progressBar.style.width = "1%";
    progressPercent.textContent = "1%";

    const interval = setInterval(() => {
        progress += 10 + Math.random() * 15;

        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);

            setTimeout(() => {
                splashScreen.style.opacity = 0;
            }, 500);

            setTimeout(() => {
                splashScreen.style.display = "none";
                if (onDone) onDone();
            }, 1000);
        }

        progressBar.style.width = Math.min(progress, 100) + "%";
        progressPercent.textContent = Math.floor(progress) + "%";

    }, 80);
}

/* =========================================================
    VARIABLES
========================================================= */

let isGuest = true;

let localUserId = localStorage.getItem("userId");
if (!localUserId) {
    localUserId = "guest_" + Math.random().toString(36).substring(2, 9);
    localStorage.setItem("userId", localUserId);
}
let userId = localUserId;

let coins = 0;
let clickPower = 1;

let plateAnimFrame = null;

function animatePlateCoins(newValue) {
    const el = document.getElementById("plateBalanceValue");

    let startVal = Number(el.textContent) || 0;
    let diff = newValue - startVal;
    let duration = 500;
    let startTime = performance.now();

    if (plateAnimFrame) cancelAnimationFrame(plateAnimFrame);

    function frame(now) {
        let t = Math.min((now - startTime) / duration, 1);
        let eased = 1 - Math.pow(1 - t, 3);

        el.textContent = Math.floor(startVal + diff * eased);

        if (t < 1) {
            plateAnimFrame = requestAnimationFrame(frame);
        } else {
            el.textContent = newValue;
        }
    }

    plateAnimFrame = requestAnimationFrame(frame);
}

/* DOM ELEMENTS */
const counterValue = document.getElementById("counterValue");
const loginOutBtn = document.getElementById("loginOutBtn");
const loginBtnEl = document.getElementById("loginBtn");

/* =========================================================
    SHOP ITEMS
========================================================= */

const shopItems = [
    {
        id: 1,
        name: 'Оторванная пуговица',
        cost: 50,
        description: 'Похожа на глаз игрушки.',
        property: '+1 за клик',
        incrementCost: 50,
        img: 'img/item-1.png'
    },
    {
        id: 2,
        name: 'Страшная штука',
        cost: 250,
        description: 'Она пугает.',
        property: '+10 за клик',
        power: 10,
        stock: 5,
        img: 'img/item-2.png'
    }
];

/* =========================================================
    COUNTER ANIMATION
========================================================= */

let animFrame = null;

function animateCounter(oldVal, newVal) {
    oldVal = Number(oldVal) || 0;
    newVal = Number(newVal) || 0;

    if (newVal - oldVal === 1) {
        counterValue.textContent = newVal;
        return;
    }

    if (animFrame) cancelAnimationFrame(animFrame);

    let start = performance.now();

    function frame(ts) {
        let p = Math.min((ts - start) / 100, 1);

        const v = Math.floor(oldVal + (newVal - oldVal) * p);

        // баланс в верхней табличке
        document.getElementById("shopBalanceValue").textContent = v;

        // баланс в кликере
        document.getElementById("shopBalanceValueClicker").textContent = v;

        if (p < 1) {
            animFrame = requestAnimationFrame(frame);
        } else {
            document.getElementById("shopBalanceValue").textContent = newVal;
            document.getElementById("shopBalanceValueClicker").textContent = newVal;
        }
    }

    animFrame = requestAnimationFrame(frame);
}

/* =========================================================
    CLICK LOGIC
========================================================= */

const clickImg = document.getElementById("clickImg");
const clickButton = document.getElementById("clickButton");

function spawnFloatingCoin(x, y, value) {
    const el = document.createElement("div");
    el.className = "floating-coin";

    el.style.left = (x - 10) + "px";
    el.style.top = (y - 10) + "px";

    el.innerHTML = `${value}<img src="img/anti-coin.png">`;

    document.body.appendChild(el);

    requestAnimationFrame(() => {
        el.style.transform = "translateY(-80px)";
        el.style.opacity = "0";
    });

    setTimeout(() => el.remove(), 650);
}

function clickAction(x, y) {
    coins += clickPower;

    spawnFloatingCoin(x, y, clickPower);
    animateCounter(parseInt(counterValue.textContent) || 0, coins);
    animatePlateCoins(coins);
    updatePricesColor();
}

function animateClicker() {
    clickImg.style.transform = "scale(0.93)";
    clickImg.src = "img/click2.png";

    setTimeout(() => {
        clickImg.style.transform = "scale(1)";
        clickImg.src = "img/click1.png";
    }, 100);
}

clickButton.addEventListener("click", e => {
    clickAction(e.clientX, e.clientY);
    animateClicker();
});

clickButton.addEventListener("touchstart", e => {
    e.preventDefault();

    for (const t of e.changedTouches) {
        clickAction(t.clientX, t.clientY);
    }

    animateClicker();
}, { passive: false });

/* =========================================================
    SHOP
========================================================= */

const itemsBlock = document.getElementById("items");

function updateButtonText(item, btn) {
    btn.innerHTML = "";

    if (item.stock !== undefined && item.stock <= 0) {
        btn.textContent = "распродано";
        btn.disabled = true;
        return;
    }

    const p = document.createElement("div");
    p.className = "price";
    p.innerHTML = `${item.cost}<img src="img/anti-coin.png">`;
    p.style.color = (coins < item.cost) ? "#ff3333" : "#fff";

    btn.appendChild(p);
}

function renderShop() {
    itemsBlock.innerHTML = "";

    shopItems.forEach(item => {

        const wrap = document.createElement("div");
        wrap.className = "itemWrap";

        if ((itemsBlock.children.length % 2) === 1) {
            wrap.style.background = "#8E663D";
        } else {
            wrap.style.background = "#A7794C";
        }

        const d = document.createElement("div");
        d.className = "item";
        d.style.margin = "0 auto";
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
            s.className = "stock";
            s.textContent = "В наличии: " + item.stock;
            d.appendChild(s);
        }

        const btn = document.createElement("button");
        d.appendChild(btn);

        updateButtonText(item, btn);

        btn.addEventListener("click", () => {
            if (item.stock !== undefined && item.stock <= 0) return;
            if (coins < item.cost) return;

            btn.style.transform = "scale(0.95)";
            setTimeout(() => btn.style.transform = "scale(1)", 100);

            const oldCoins = coins;

            coins -= item.cost;

            if (item.id === 1) {
                clickPower += 1;
                item.cost = Math.floor(item.cost * 1.2);
            }

            if (item.id === 2) {
                clickPower += item.power;
                item.cost += 250;
                item.stock = Math.max(0, item.stock - 1);
            }

            animateCounter(oldCoins, coins);
            animatePlateCoins(coins);
            updatePricesColor();
            renderShop();
        });

        wrap.appendChild(d);
        itemsBlock.appendChild(wrap);
    });
}

function updatePricesColor() {
    document.querySelectorAll('.item .price').forEach(p => {
        const txt = p.childNodes[0] ? p.childNodes[0].textContent : p.textContent;
        const cost = parseInt(txt) || 0;
        p.style.color = (coins < cost) ? "#ff3333" : "#fff";
    });
}
