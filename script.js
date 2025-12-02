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
/* ЭЛЕМЕНТЫ */  
/* ---------------------------------------------- */  
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
clickImg.style.marginTop = "50px"; // ✅ пункт 3: опустить на 50px вниз  
  
/* поменяли цвет заголовка и значения баланса сверху на #332614 */  
const plateTitleEl = document.getElementById("plateTitle");  
const plateBalanceValueEl = document.getElementById("plateBalanceValue");  
if (plateTitleEl) plateTitleEl.style.color = "#332614";  
if (plateBalanceValueEl) plateBalanceValueEl.style.color = "#332614";  
  
/* ---------------------------------------------- */  
/* FIREBASE */  
/* ---------------------------------------------- */  
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
/* ---------------------------------------------- */  
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
/* ---------------------------------------------- */  
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
/* АНИМАЦИЯ ПЛАШКИ (plate) */  
/* ---------------------------------------------- */  
const plateAnim = {  
  running: false,  
  startTime: 0,  
  duration: 400,  
  baseDuration: 400,  
  from: 0,  
  to: 0,  
  rafId: null  
};  
  
function startPlateAnimation(newTarget){  
  const el = document.getElementById("plateBalanceValue");  
  const now = performance.now();  
  
  if(!plateAnim.running){  
    plateAnim.running = true;  
    plateAnim.from = Number(el.textContent) || 0;  
    plateAnim.to = newTarget;  
    plateAnim.startTime = now;  
    plateAnim.duration = plateAnim.baseDuration;  
  } else {  
    const progress = Math.min((now - plateAnim.startTime) / plateAnim.duration, 1);  
    const easedProg = easeOutCubic(progress);  
    const currentDisplayed = plateAnim.from + (plateAnim.to - plateAnim.from) * easedProg;  
  
    plateAnim.from = currentDisplayed;  
    plateAnim.to = newTarget;  
    plateAnim.startTime = now;  
    plateAnim.duration = Math.max(60, plateAnim.baseDuration * 0.6);  
  }  
  
  if(plateAnim.rafId) cancelAnimationFrame(plateAnim.rafId);  
  plateTick();  
}  
  
function plateTick(){  
  const el = document.getElementById("plateBalanceValue");  
  const now = performance.now();  
  const p = Math.min((now - plateAnim.startTime) / plateAnim.duration, 1);  
  const eased = easeOutCubic(p);  
  const value = Math.floor(plateAnim.from + (plateAnim.to - plateAnim.from) * eased);  
  el.textContent = value;  
  
  if(p < 1){  
    plateAnim.rafId = requestAnimationFrame(plateTick);  
  } else {  
    plateAnim.running = false;  
    plateAnim.rafId = null;  
    el.textContent = plateAnim.to;  
  }  
}  
  
/* ---------------------------------------------- */  
/* АНИМАЦИЯ СЧЁТЧИКА */  
/* ---------------------------------------------- */  
const counterAnim = {  
  running: false,  
  startTime: 0,  
  duration: 220,  
  baseDuration: 220,  
  from: 0,  
  to: 0,  
  rafId: null  
};  
  
function startCounterAnimation(newTarget){  
  const shopEl = document.getElementById("shopBalanceValue");  
  const clickerEl = document.getElementById("shopBalanceValueClicker");  
  const mainEl = counterValue;  
  const now = performance.now();  
  
  if(!counterAnim.running){  
    counterAnim.running = true;  
    counterAnim.from = Number(mainEl.textContent) || 0;  
    counterAnim.to = newTarget;  
    counterAnim.startTime = now;  
    counterAnim.duration = counterAnim.baseDuration;  
  } else {  
    const progress = Math.min((now - counterAnim.startTime) / counterAnim.duration, 1);  
    const easedProg = easeOutCubic(progress);  
    const currentDisplayed = counterAnim.from + (counterAnim.to - counterAnim.from) * easedProg;  
  
    counterAnim.from = currentDisplayed;  
    counterAnim.to = newTarget;  
    counterAnim.startTime = now;  
    counterAnim.duration = Math.max(60, counterAnim.baseDuration * 0.6);  
  }  
  
  if(counterAnim.rafId) cancelAnimationFrame(counterAnim.rafId);  
  counterTick();  
}  
  
function counterTick(){  
  const shopEl = document.getElementById("shopBalanceValue");  
  const clickerEl = document.getElementById("shopBalanceValueClicker");  
  const mainEl = counterValue;  
  const now = performance.now();  
  const p = Math.min((now - counterAnim.startTime) / counterAnim.duration, 1);  
  const eased = easeOutCubic(p);  
  const value = Math.floor(counterAnim.from + (counterAnim.to - counterAnim.from) * eased);  
  
  if(shopEl) shopEl.textContent = value;  
  if(clickerEl) clickerEl.textContent = value;  
  if(mainEl) mainEl.textContent = value;  
  
  if(p < 1){  
    counterAnim.rafId = requestAnimationFrame(counterTick);  
  } else {  
    counterAnim.running = false;  
    counterAnim.rafId = null;  
    if(shopEl) shopEl.textContent = counterAnim.to;  
    if(clickerEl) clickerEl.textContent = counterAnim.to;  
    if(mainEl) mainEl.textContent = counterAnim.to;  
  }  
}  
  
function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }  
  
/* ---------------------------------------------- */  
/* КЛИКЕР */  
/* ---------------------------------------------- */  
function spawnFloatingCoin(x,y,value){  
  const el = document.createElement("div");  
  el.className = "floating-coin";  
  el.style.left = (x - 12) + "px";  
  el.style.top  = (y - 12) + "px";  
  el.style.position = "absolute";  
  el.style.pointerEvents = "none";  
  el.style.zIndex = 9999;  
  el.innerHTML = `<span style="font-weight:700;font-size:18px;color:#ffffff;text-shadow:0 2px 6px rgba(0,0,0,0.45);">+${value}</span><img src="img/anti-coin.png" style="width:18px;height:18px;margin-left:6px;vertical-align:middle;">`;  
  document.body.appendChild(el);  
  
  requestAnimationFrame(()=>{  
    el.style.transition = "transform 0.7s ease-out, opacity 0.7s ease-out";  
    el.style.transform = "translateY(-80px)";  
    el.style.opacity = "0";  
  });  
  
  setTimeout(()=>el.remove(), 750);  
}  
  
function clickAction(x,y){  
  if(clickPower === 1){  
    coins += 1;  
    document.getElementById("counterValue").textContent = coins;  
    if(document.getElementById("shopBalanceValue")) document.getElementById("shopBalanceValue").textContent = coins;  
    if(document.getElementById("shopBalanceValueClicker")) document.getElementById("shopBalanceValueClicker").textContent = coins;  
    if(document.getElementById("plateBalanceValue")) document.getElementById("plateBalanceValue").textContent = coins;  
    spawnFloatingCoin(x,y,1);  
    updatePricesColor();  
    return;  
  }  
  
  const oldCoins = coins;  
  coins += clickPower;  
  startCounterAnimation(coins);  
  startPlateAnimation(coins);  
  spawnFloatingCoin(x,y,clickPower);  
  updatePricesColor();  
}  
  
function animateClicker(){  
  clickImg.style.transform = "scale(0.93)";  
  clickImg.src = "img/click2.png";  
  setTimeout(()=>{  
    clickImg.style.transform = "scale(1)";  
    clickImg.src = "img/click1.png";  
  }, 100);  
}  
  
clickButton.addEventListener("click", e=>{  
  clickAction(e.clientX, e.clientY);  
  animateClicker();  
});  
clickButton.addEventListener("touchstart", e=>{  
  e.preventDefault();  
  for(const t of e.changedTouches){  
    clickAction(t.clientX, t.clientY);  
  }  
  animateClicker();  
},{passive:false});  
  
/* ---------------------------------------------- */  
/* МАГАЗИН */  
const baseShopItems = [  
  {id:1,name:'Оторванная пуговица',baseCost:50,description:'Кажеться, раньше это служило подобием глаза для плюшевой игрушки.',property:'+1 к прибыли за клик',incrementCost:50,img:'img/item-1.png'}, // ✅ пункт 1: свойство  
  {id:2,name:'Страшная штука',baseCost:250,description:'Оно пугает.',property:'+5 к прибыли за клик',power:5,stock:5,img:'img/item-2.png'} // ✅ пункт 2  
];  
let shopItems = baseShopItems.map(item => ({...item}));  
let boughtItems = { "1":0, "2":0 };  
  
const itemsBlock = document.getElementById("items");  
  
function updateShopItems(){  
  shopItems = baseShopItems.map(item=>{  
    const bought = boughtItems[item.id]||0;  
    const newItem = {...item};  
    if(item.id===1) newItem.cost = Math.floor(item.baseCost*Math.pow(1.5,bought)); // ✅ пункт 1: множитель ×1.5  
    if(item.id===2) newItem.cost = item.baseCost + 250*bought;  
    if(item.stock!==undefined) newItem.stock = Math.max(0,item.stock-bought);  
    return newItem;  
  });  
}  
  
function updateButtonText(item,btn){  
  btn.style.fontFamily="'Montserrat', sans-serif";  
  btn.style.fontWeight="600";  
  btn.innerHTML="";  
  if(item.stock!==undefined && item.stock<=0){  
    btn.textContent="распродано";  
    btn.disabled=true;  
    return;  
  }  
  const p = document.createElement("div");  
  p.className="price";  
  p.innerHTML = `${item.cost}<img src="img/anti-coin.png">`;  
  p.style.color=(coins<item.cost)?"#ff3333":"#fff";  
  btn.appendChild(p);  
}  
  
function renderShop(){  
  updateShopItems();  
  itemsBlock.innerHTML="";  
  
  // ✅ пункт 4: добавить надпись над первым товаром  
  const tierLabel = document.createElement("div");  
  tierLabel.style.textAlign="center";  
  tierLabel.style.color="#FFDCC0";  
  tierLabel.style.fontWeight="600";  
  tierLabel.style.margin="10px 0";  
  tierLabel.innerHTML=`<span style="margin-right:20px;">────────</span> Ⅰ ТИР <span style="margin-left:20px;">────────</span>`;  
  itemsBlock.appendChild(tierLabel);  
  
  shopItems.forEach(item=>{  
    const wrap = document.createElement("div"); wrap.className="itemWrap"; wrap.style.background="none";  
    const d = document.createElement("div"); d.className="item"; d.style.margin="0 auto"; d.style.backgroundImage='url("img/item-frame.png")';  
    d.innerHTML=`  
      <div class="item-top">  
        <img src="${item.img}">  
        <div class="item-text">  
          <b>${item.name}</b>  
          <p>${item.description}</p>  
          <p class="prop">${item.property}</p>  
        </div>  
      </div>  
    `;  
    if(item.stock!==undefined){  
      const s=document.createElement("p"); s.className="stock"; s.textContent="В наличии: "+item.stock; d.appendChild(s);  
    }  
    const btn=document.createElement("button"); d.appendChild(btn); updateButtonText(item,btn);  
    btn.addEventListener("click",()=>{  
      if(item.stock!==undefined && item.stock<=0) return;  
      if(coins<item.cost) return;  
      coins-=item.cost;  
      boughtItems[item.id] = (boughtItems[item.id]||0)+1;  
      clickPower += item.id===1?1:item.power||0;  
      startCounterAnimation(coins);  
      startPlateAnimation(coins);  
      updatePricesColor();  
      renderShop();  
    });  
    wrap.appendChild(d);  
    itemsBlock.appendChild(wrap);  
  });  
}  
  
function updatePricesColor(){  
  document.querySelectorAll('.item .price').forEach(p=>{  
    const txt=p.childNodes[0]?p.childNodes[0].textContent:p.textContent;  
    const cost=parseInt(txt)||0;  
    p.style.color=(coins<cost)?"#ff3333":"#fff";  
  });  
}  
  
/* ---------------------------------------------- */  
/* SAVE */  
async function saveProgress(){  
  if(isGuest) return;  
  await set(ref(db,'users/'+userId), {coins, clickPower, items:boughtItems});  
}  
setInterval(saveProgress,5000);  
  
/* ---------------------------------------------- */  
/* AUTH */  
loginBtnEl.style.fontFamily="'Montserrat', sans-serif";  
loginBtnEl.style.fontWeight = "600";  
loginBtnEl.onclick=async()=>{ try{ await signInWithPopup(auth, provider); }catch(e){console.error(e);} };  
loginOutBtn.style.fontFamily="'Montserrat', sans-serif";  
loginOutBtn.style.fontWeight = "600";  
loginOutBtn.onclick=async()=>{  
  if(isGuest){ await signInWithPopup(auth,provider); return; }  
  await signOut(auth);  
  alert("Вы вышли из аккаунта");  
  isGuest=true; userId=localUserId; coins=0; clickPower=1;  
  boughtItems={ "1":0,"2":0 };  
  document.getElement
