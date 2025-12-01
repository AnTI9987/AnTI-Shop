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

/* =========================================================
    SAVE PROGRESS
========================================================= */

async function saveProgress() {
    if (isGuest) return;

    const data = {
        coins,
        clickPower,
        shopItems
    };

    await set(ref(db, 'users/' + userId), data);
}

setInterval(saveProgress, 5000);

/* =========================================================
    LOGIN / LOGOUT
========================================================= */

loginBtnEl.onclick = async () => {
    try {
        await signInWithPopup(auth, provider);
    } catch (e) {
        console.error(e);
    }
};

loginOutBtn.onclick = async () => {
    if (isGuest) {
        await signInWithPopup(auth, provider);
        return;
    }

    await signOut(auth);

    alert("Вы вышли из аккаунта");

    isGuest = true;
    userId = localUserId;
    coins = 0;
    clickPower = 1;

    // сбросить магазин
    shopItems.forEach(i => {
        if (i.id === 2) i.stock = 5;
        if (i.id === 1) i.cost = 50;
    });

    animateCounter(0, 0);
    renderShop();
};

/* =========================================================
    AUTH STATE CHANGE
========================================================= */

onAuthStateChanged(auth, async user => {

    if (user) {
        isGuest = false;
        userId = user.uid;

        loginOutBtn.textContent = "Выйти из аккаунта";
        loginBtnEl.style.display = "none";

        const snap = await get(ref(db, 'users/' + userId));

        if (snap.exists()) {
            const data = snap.val();
            coins = data.coins || 0;
            clickPower = data.clickPower || 1;

            if (data.shopItems) {
                data.shopItems.forEach((si, i) => {
                    shopItems[i].cost = si.cost;
                    if (shopItems[i].stock !== undefined)
                        shopItems[i].stock = si.stock;
                });
            }
        }

        animateCounter(0, coins);
        animatePlateCoins(coins);
        renderShop();

    } else {
        isGuest = true;
        loginOutBtn.textContent = "Войти в аккаунт";
    }
});

/* =========================================================
    PANELS & NAVIGATION
========================================================= */

const panels = document.getElementById("panels");
let btnTimers = {};

function safeSetStyle(el, prop, value, delay = 0) {
    const id = el.id + prop;

    if (btnTimers[id]) clearTimeout(btnTimers[id]);

    if (delay === 0) {
        el.style[prop] = value;
    } else {
        btnTimers[id] = setTimeout(() => {
            el.style[prop] = value;
        }, delay);
    }
}

const shopBtnEl = document.getElementById("shopBtn");
const backBtnEl = document.getElementById("backBtn");
const settingsBtnEl = document.getElementById("settingsBtn");
const backToClickerBtn = document.getElementById("backToClickerBtn");

panels.style.transform = "translateX(-392px)";

/* =========================================================
    TOP PLATE SWING ANIMATION
========================================================= */

function swingPlate(direction) {
    const plate = document.getElementById("topPlate");

    plate.style.animation = "none";
    void plate.offsetWidth;

    let deg1 = 8, deg2 = -5, deg3 = 3;

    if (direction === "right") {
        deg1 = -deg1;
        deg2 = -deg2;
        deg3 = -deg3;
    }

    plate.style.setProperty("--deg1", deg1 + "deg");
    plate.style.setProperty("--deg2", deg2 + "deg");
    plate.style.setProperty("--deg3", deg3 + "deg");

    plate.style.animation = "swingSuspended 0.9s ease-in-out";

    plate.addEventListener("animationend", function handler() {
        plate.style.transform = "translateX(-50%) rotate(0deg)";
        plate.style.animation = "none";
        plate.removeEventListener("animationend", handler);
    });
}

/* =========================================================
    PANEL TRANSITIONS
========================================================= */

function goToShop() {
    swingPlate("left");

    panels.style.transform = "translateX(-784px)";

    shopBtnEl.style.right = "-60px";
    settingsBtnEl.style.left = "-60px";
    loginBtnEl.style.left = "-60px";

    backToClickerBtn.style.display = "block";
    backToClickerBtn.style.right = "-60px";

    setTimeout(() => safeSetStyle(backToClickerBtn, "right", "12px"), 50);

    updatePricesColor();
}

function goBackFromShop() {
    swingPlate("right");

    panels.style.transform = "translateX(-392px)";

    safeSetStyle(backToClickerBtn, "right", "-60px");
    safeSetStyle(backToClickerBtn, "display", "none", 400);

    shopBtnEl.style.right = "12px";
    settingsBtnEl.style.left = "12px";
    loginBtnEl.style.left = "12px";
}

function goToSettings() {
    swingPlate("right");

    panels.style.transform = "translateX(0)";

    shopBtnEl.style.right = "-60px";
    settingsBtnEl.style.left = "-60px";
    loginBtnEl.style.left = "-60px";

    backBtnEl.style.display = "block";
    safeSetStyle(backBtnEl, "right", "12px", 50);
}

function goBackFromSettings() {
    swingPlate("left");

    panels.style.transform = "translateX(-392px)";

    shopBtnEl.style.right = "12px";
    settingsBtnEl.style.left = "12px";

    safeSetStyle(backBtnEl, "right", "-60px");
    safeSetStyle(backBtnEl, "display", "none", 500);

    loginBtnEl.style.left = "12px";
}

/* BUTTON EVENTS */
shopBtnEl.onclick = goToShop;
settingsBtnEl.onclick = goToSettings;
backBtnEl.onclick = goBackFromSettings;
backToClickerBtn.onclick = goBackFromShop;

/* =========================================================
    INITIAL STARTUP
========================================================= */

fakeLoad(() => {
    panels.style.transform = "translateX(-392px)";
    renderShop();
    document.getElementById("topPlate").style.display = "block";
    animateCounter(0, coins);
    updatePricesColor();
});

/* =========================================================
    RESPONSIVE FIXES / TOUCH SUPPORT / MOBILE UX
========================================================= */

// убрать выделение при тапах
document.addEventListener("touchstart", () => {}, { passive: true });

// отключение контекстного меню (по желанию — можешь удалить)
document.addEventListener("contextmenu", e => e.preventDefault());

// переходы и кнопки на мобильных
let lastTouch = 0;
document.addEventListener("touchend", () => {
    lastTouch = Date.now();
});

/* =========================================================
    DEBUG (можно удалить)
========================================================= */

// показать текущее состояние игрока
window.debugState = () => {
    console.log({
        coins,
        clickPower,
        shopItems,
        userId,
        isGuest
    });
};

// очистить сохранения Firebase (только для теста)
window.resetFirebase = async () => {
    if (isGuest) return alert("Вы не авторизованы!");
    await set(ref(db, 'users/' + userId), null);
    alert("данные удалены");
};

/* =========================================================
    END
========================================================= */
