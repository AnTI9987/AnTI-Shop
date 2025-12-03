/* FIREBASE IMPORTS */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

/* ---------------------------------------------- */
/* ПРОГРУЗКА КАРТИНОК */
/* ---------------------------------------------- */
const imagesToPreload = [
  "img/click1.png",
  "img/click2.png",
  "img/anti-coin.png",
  "img/item-1.png",
  "img/item-2.png"
];
imagesToPreload.forEach(src => {
  const img = new Image();
  img.src = src;
});

/* ---------------------------------------------- */
/* ПРОГРУЗКА ЗВУКОВ */
const sClickWood = new Audio('sounds/click-wood.mp3');
sClickWood.preload = 'auto';
const sClickClicker = new Audio('sounds/click-clicker.mp3');
sClickClicker.preload = 'auto';
const sClickButton = new Audio('sounds/click-button.mp3');
sClickButton.preload = 'auto';

/* ---------------------------------------------- */
/* ЭЛЕМЕНТЫ */
const shopBtnEl = document.getElementById("shopBtn");
const backBtnEl = document.getElementById("backBtn");
const settingsBtnEl = document.getElementById("settingsBtn");
settingsBtnEl.classList.add("settings-btn");
settingsBtnEl.style.fontFamily = "'Montserrat', sans-serif";
settingsBtnEl.style.fontWeight = "600";
const backToClickerBtn = document.getElementById("backToClickerBtn");
const loginBtnEl = document.getElementById("loginBtn");
const loginOutBtn = document.getElementById("loginOutBtn");
const clickButton = document.getElementById("clickButton");
const clickImg = document.getElementById("clickImg");
clickImg.style.display = "block";
clickImg.style.marginTop = "50px";

const groundImg = document.getElementById("groundImg");
if(groundImg){
  // groundImg.style.transform = "translateY(-100px)";
}

const plateTitleEl = document.getElementById("plateTitle");
const plateBalanceValueEl = document.getElementById("plateBalanceValue");
if (plateTitleEl) plateTitleEl.style.color = "#332614";
if (plateBalanceValueEl) plateBalanceValueEl.style.color = "#332614";

/* ---------------------------------------------- */
/* FIREBASE */
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

/* ---------------------------------------------- */
/* SPLASH */
const splashScreen = document.getElementById("splashScreen");
const progressBar = document.getElementById("progressBar");
const progressPercent = document.getElementById("progressPercent");
let progress = 0;

function fakeLoad(onDone){
  progress = 1;
  progressBar.style.width = "1%";
  progressPercent.textContent = "1%";
  const interval = setInterval(() => {
    progress += 10 + Math.random()*15;
    if(progress >= 100){
      progress = 100;
      clearInterval(interval);
      setTimeout(()=>{ splashScreen.style.opacity = 0; }, 500);
      setTimeout(()=>{ splashScreen.style.display = "none"; if(onDone) onDone(); }, 1000);
    }
    progressBar.style.width = Math.min(progress,100) + "%";
    progressPercent.textContent = Math.floor(progress) + "%";
  },80);
}

/* ---------------------------------------------- */
/* ПЕРЕМЕННЫЕ */
let isGuest = true;
let localUserId = localStorage.getItem("userId");
if(!localUserId){
  localUserId = "guest_" + Math.random().toString(36).substring(2,9);
  localStorage.setItem("userId", localUserId);
}
let userId = localUserId;

let coins = 0;
let clickPower = 1;
let plateAnimFrame = null;
const counterValue = document.getElementById("counterValue");

/* ---------------------------------------------- */
/* кнопка Сбросить прогресс */
const resetProgressBtn = document.createElement("button");
resetProgressBtn.textContent = "Сбросить прогресс";
resetProgressBtn.style.fontFamily="'Montserrat', sans-serif";
resetProgressBtn.style.fontWeight="600";
resetProgressBtn.style.display = "block";
resetProgressBtn.style.marginTop = "12px";
loginOutBtn.parentNode.insertBefore(resetProgressBtn, loginOutBtn.nextSibling);

resetProgressBtn.onclick = async () => {
  let msg = "";
  if(!isGuest){
    msg = "Вы уверены, что хотите сбросить прогресс? Все достижения на вашем аккаунте будут испепелены!";
  }else{
    msg = "Вы уверены, что хотите сбросить прогресс? Все локальные достижения будут испепелены!";
  }

  const confirmReset = confirm(msg);
  if(confirmReset){
    coins = 0;
    clickPower = 1;
    boughtItems = {"1":0,"2":0};

    document.getElementById("counterValue").textContent = coins;
    if(document.getElementById("shopBalanceValue")) document.getElementById("shopBalanceValue").textContent = coins;
    if(document.getElementById("shopBalanceValueClicker")) document.getElementById("shopBalanceValueClicker").textContent = coins;
    if(document.getElementById("plateBalanceValue")) document.getElementById("plateBalanceValue").textContent = coins;
    renderShop();
    startCounterAnimation(coins);
    startPlateAnimation(coins);

    if(!isGuest){
      await set(ref(db, 'users/' + userId), {coins, clickPower, items: boughtItems});
    }
  }
};

/* ---------------------------------------------- */
/* КЛИК ПО КНОПКЕ */
clickButton.addEventListener("click", () => {
  coins += clickPower;
  counterValue.textContent = coins;

  // проигрываем звук
  if(Math.random()<0.7){
    sClickWood.currentTime = 0;
    sClickWood.play();
  }else{
    sClickClicker.currentTime = 0;
    sClickClicker.play();
  }

  startCounterAnimation(coins);
  startPlateAnimation(coins);

  // анимация кнопки
  clickImg.style.transform = "scale(0.95)";
  setTimeout(() => {
    clickImg.style.transform = "scale(1)";
  }, 100);
});

/* ---------------------------------------------- */
/* АНИМАЦИЯ СЧЁТЧИКА */
function startCounterAnimation(value){
  if(counterValue){
    counterValue.textContent = value;
    counterValue.style.transform = "scale(1.2)";
    setTimeout(()=>{counterValue.style.transform = "scale(1)";},120);
  }
}

/* ---------------------------------------------- */
/* АНИМАЦИЯ ПЛАТЫ */
function startPlateAnimation(value){
  if(!plateBalanceValueEl) return;
  plateBalanceValueEl.textContent = value;
  plateBalanceValueEl.style.transform = "translateY(-10px)";
  plateBalanceValueEl.style.opacity = "0.7";
  setTimeout(()=>{
    plateBalanceValueEl.style.transform = "translateY(0px)";
    plateBalanceValueEl.style.opacity = "1";
  },150);
}

/* ---------------------------------------------- */
/* ВХОД И ВЫХОД */
loginBtnEl.addEventListener("click", async () => {
  try{
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    isGuest = false;
    userId = user.uid;
    localStorage.setItem("userId", userId);
    coins = 0; clickPower = 1; boughtItems = {"1":0,"2":0};
    // получаем данные из базы
    const snapshot = await get(ref(db,'users/' + userId));
    if(snapshot.exists()){
      const data = snapshot.val();
      coins = data.coins || 0;
      clickPower = data.clickPower || 1;
      boughtItems = data.items || {"1":0,"2":0};
    }else{
      await set(ref(db,'users/' + userId), {coins, clickPower, items:boughtItems});
    }
    counterValue.textContent = coins;
    startCounterAnimation(coins);
    startPlateAnimation(coins);
    renderShop();
  }catch(err){ console.error(err); }
});

loginOutBtn.addEventListener("click", async () => {
  try{
    await signOut(auth);
    isGuest = true;
    userId = localUserId;
    coins = 0; clickPower = 1; boughtItems = {"1":0,"2":0};
    counterValue.textContent = coins;
    startCounterAnimation(coins);
    startPlateAnimation(coins);
    renderShop();
  }catch(err){ console.error(err); }
});

/* ---------------------------------------------- */
/* SHOP RENDER */
let boughtItems = {"1":0,"2":0};
function renderShop(){
  const shopItemsEl = document.getElementById("shopItems");
  if(!shopItemsEl) return;
  shopItemsEl.innerHTML = "";

  const items = [
    {id:"1", name:"Усилитель клика", price:50, img:"img/item-1.png"},
    {id:"2", name:"Супер табличка", price:150, img:"img/item-2.png"}
  ];

  items.forEach(item=>{
    const div = document.createElement("div");
    div.className = "shop-item";
    div.style.border="2px solid #332614";
    div.style.padding="8px";
    div.style.marginBottom="8px";
    div.style.borderRadius="8px";
    div.style.cursor="pointer";
    div.style.display="flex";
    div.style.alignItems="center";
    div.style.gap="8px";

    const img = document.createElement("img");
    img.src = item.img;
    img.style.width="40px";
    img.style.height="40px";

    const nameEl = document.createElement("span");
    nameEl.textContent = item.name;
    nameEl.style.flex="1";

    const priceEl = document.createElement("span");
    priceEl.textContent = item.price + "💰";

    div.appendChild(img);
    div.appendChild(nameEl);
    div.appendChild(priceEl);

    div.addEventListener("click", () => {
      if(coins >= item.price){
        coins -= item.price;
        boughtItems[item.id] = (boughtItems[item.id] || 0) + 1;
        counterValue.textContent = coins;
        startCounterAnimation(coins);
        startPlateAnimation(coins);
        renderShop();
        sClickButton.currentTime=0;
        sClickButton.play();

        // если покупка усилителя клика
        if(item.id==="1"){
          clickPower += 1;
        }
      }else{
        alert("Недостаточно 💰");
      }
    });

    shopItemsEl.appendChild(div);
  });
      }

/* ---------------------------------------------- */
/* ANIMATION FOR PLATE (topPlate) */
const topPlateEl = document.getElementById("topPlate");
if(topPlateEl){
  topPlateEl.addEventListener("click", e => {
    playSound(sClickWood);
    // CSS анимация без фокуса (чтобы не загоралась синим)
    topPlateEl.classList.remove("plate-hit");
    void topPlateEl.offsetWidth;
    topPlateEl.classList.add("plate-hit");
    setTimeout(() => topPlateEl.classList.remove("plate-hit"), 220);
  });
}

/* ---------------------------------------------- */
/* GENERAL BUTTON SOUND HANDLER (excluding buy-btn and clickButton) */
document.addEventListener("click", e => {
  const btn = e.target.closest("button");
  if(!btn) return;
  if(btn.classList.contains("buy-btn")) return;
  if(btn.id === "clickButton") return;
  playSound(sClickButton);
});

document.addEventListener("touchstart", e => {
  const btn = e.target.closest("button");
  if(!btn) return;
  if(btn.classList.contains("buy-btn")) return;
  if(btn.id === "clickButton") return;
  playSound(sClickButton);
}, {passive:true});

/* ---------------------------------------------- */
/* PANEL NAVIGATION */
function swingPlate(direction){
  if(!topPlateEl) return;
  topPlateEl.style.animation="none"; void topPlateEl.offsetWidth;

  let deg1=8, deg2=-5, deg3=3;
  if(direction==="right"){ deg1=-deg1; deg2=-deg2; deg3=-deg3; }

  topPlateEl.style.setProperty("--deg1", deg1+"deg");
  topPlateEl.style.setProperty("--deg2", deg2+"deg");
  topPlateEl.style.setProperty("--deg3", deg3+"deg");
  topPlateEl.style.animation="swingSuspended 0.9s ease-in-out";
  topPlateEl.addEventListener("animationend", function handler(){
    topPlateEl.style.transform="translateX(-50%) rotate(0deg)";
    topPlateEl.style.animation="none";
    topPlateEl.removeEventListener("animationend", handler);
  });
}

function goToShop(){ swingPlate("left"); panels.style.transform="translateX(-784px)"; }
function goBackFromShop(){ swingPlate("right"); panels.style.transform="translateX(-392px)"; }
function goToSettings(){ swingPlate("right"); panels.style.transform="translateX(0)"; }
function goBackFromSettings(){ swingPlate("left"); panels.style.transform="translateX(-392px)"; }

shopBtnEl.onclick = goToShop;
backToClickerBtn.onclick = goBackFromShop;
settingsBtnEl.onclick = goToSettings;
backBtnEl.onclick = goBackFromSettings;

/* ---------------------------------------------- */
/* SAVE PROGRESS */
async function saveProgress(){
  if(isGuest) return;
  await set(ref(db,'users/'+userId), {coins, clickPower, items:boughtItems});
}
setInterval(saveProgress, 5000);

/* ---------------------------------------------- */
/* VISIBILITY CHANGE */
document.addEventListener("visibilitychange", () => {
  if(!document.hidden){
    clickImg.style.display="block";
    startPlateAnimation(coins);
    startCounterAnimation(coins);
  }
});

/* ---------------------------------------------- */
/* FAKE LOAD / SPLASH */
fakeLoad(() => {
  panels.style.transform="translateX(-392px)";
  renderShop();
  if(topPlateEl) topPlateEl.style.display="block";
  counterValue.textContent = coins;
  startCounterAnimation(coins);
  startPlateAnimation(coins);
});

/* ---------------------------------------------- */
/* TOUCH AND CLICK PREVENT DEFAULT ON CLICK BUTTON */
clickButton.addEventListener("touchstart", e => {
  e.preventDefault();
  for(const t of e.changedTouches){
    coins += clickPower;
    startCounterAnimation(coins);
    startPlateAnimation(coins);
    spawnFloatingCoin(t.clientX, t.clientY, clickPower);
    animateClicker();
    playSound(sClickClicker);
  }
},{passive:false});

/* ---------------------------------------------- */
/* SPAWN FLOATING COINS */
function spawnFloatingCoin(x, y, value){
  const el = document.createElement("div");
  el.className = "floating-coin";
  el.style.left = (x-12)+"px";
  el.style.top = (y-12)+"px";
  el.style.position = "absolute";
  el.style.pointerEvents = "none";
  el.style.zIndex = 9999;
  el.innerHTML = `<span style="font-weight:700;font-size:18px;color:#fff;text-shadow:0 2px 6px rgba(0,0,0,0.45);">+${value}</span>
                  <img src="img/anti-coin.png" style="width:18px;height:18px;margin-left:6px;vertical-align:middle;">`;
  document.body.appendChild(el);

  requestAnimationFrame(()=>{
    el.style.transition = "transform 0.7s ease-out, opacity 0.7s ease-out";
    el.style.transform = "translateY(-80px)";
    el.style.opacity = "0";
  });
  setTimeout(()=>el.remove(), 750);
}

/* ---------------------------------------------- */
/* CLICK BUTTON ANIMATION */
function animateClicker(){
  clickImg.style.transform = "scale(0.93)";
  clickImg.src = "img/click2.png";
  setTimeout(()=>{
    clickImg.style.transform = "scale(1)";
    clickImg.src = "img/click1.png";
  }, 100);
}
