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
/* опускаем кликер-картинку на 50px вниз */
clickImg.style.marginTop = "50px";

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

/*
  реализация variant B:
  - если анимация уже бежит и пришла новая цель, мы не рвём анимацию, а
    пересчитываем текущее значение и плавно продолжаем к новой цели,
    немного ускоряя анимацию (умножаем базовую длительность на 0.6).
*/

const plateAnim = {
  running: false,
  startTime: 0,
  duration: 400,      // базовая длительность (мс) — чуть быстрее, чем раньше
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
/* АНИМАЦИЯ СЧЁТЧИКА (центральный counter и shop balances) */
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

/* easing */
function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }

/* ---------------------------------------------- */
/* КЛИКЕР */
/* ---------------------------------------------- */

/* spawnFloatingCoin — белые +монеты с небольшой тенью */
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
  {id:1,name:'Оторванная пуговица',baseCost:50,description:'Кажеться, раньше это служило подобием глаза для плюшевой игрушки.',property:'+1 к прибыли за клик',incrementCost:50,img:'img/item-1.png'},
  {id:2,name:'Страшная штука',baseCost:250,description:'Оно пугает.',property:'+5 к прибыли за клик',power:5,stock:5,img:'img/item-2.png'}
];
let shopItems = baseShopItems.map(item => ({...item}));
let boughtItems = { "1":0, "2":0 };

const itemsBlock = document.getElementById("items");

function updateShopItems(){
  shopItems = baseShopItems.map(item=>{
    const bought = boughtItems[item.id]||0;
    const newItem = {...item};
    if(item.id===1) newItem.cost = Math.floor(item.baseCost*Math.pow(1.7,bought));
    if(item.id===2) newItem.cost = Math.floor(item.baseCost*Math.pow(3.0,bought));
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

  const tierLabel = document.createElement("div");
tierLabel.style.display = "flex";
tierLabel.style.alignItems = "center";
tierLabel.style.justifyContent = "center";
tierLabel.style.marginBottom = "12px";

const lineLeft = document.createElement("div");
lineLeft.style.height = "3px";        // толщина линии
lineLeft.style.backgroundColor = "#FFDCC0";
lineLeft.style.flex = "1";
lineLeft.style.marginRight = "8px";   // отступ от текста

const lineRight = document.createElement("div");
lineRight.style.height = "3px";       // толщина линии
lineRight.style.backgroundColor = "#FFDCC0";
lineRight.style.flex = "1";
lineRight.style.marginLeft = "8px";   // отступ от текста

const text = document.createElement("span");
text.textContent = "Ⅰ ТИР";
text.style.color = "#FFDCC0";
text.style.fontWeight = "800";        // жирнее текст
text.style.fontSize = "18px";

tierLabel.appendChild(lineLeft);
tierLabel.appendChild(text);
tierLabel.appendChild(lineRight);
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

/* === Чит-коды: UI + логика === */
const CHEAT_VERIFY_URL = null; // если есть serverless endpoint — подставь сюда строку URL

// попытка найти панель настроек (если у тебя есть специальный контейнер — присвой ему id="settingsPanel")
const settingsPanel = document.getElementById("settingsPanel") || document.getElementById("panels");

// wrapper
const cheatWrapper = document.createElement("div");
cheatWrapper.id = "cheatWrapper";
cheatWrapper.style.display = "flex";
cheatWrapper.style.flexDirection = "column";
cheatWrapper.style.alignItems = "center";
cheatWrapper.style.gap = "8px";
cheatWrapper.style.marginTop = "12px";
cheatWrapper.style.width = "100%";
cheatWrapper.style.maxWidth = "360px";

// поле ввода (выглядит как кнопка, чуть темнее)
const cheatInput = document.createElement("input");
cheatInput.id = "cheatInput";
cheatInput.type = "text";
cheatInput.placeholder = "введите чит-код";
cheatInput.maxLength = 6;
cheatInput.style.width = "100%";
cheatInput.style.boxSizing = "border-box";
cheatInput.style.padding = "12px 14px";
cheatInput.style.borderRadius = "8px";
cheatInput.style.border = "none";
cheatInput.style.fontFamily = "'Montserrat', sans-serif";
cheatInput.style.fontWeight = "700";
cheatInput.style.backgroundColor = "#e0d6c9"; // чуть темнее, чем кнопка входа
cheatInput.style.color = "#2b1f14";
cheatInput.style.textTransform = "uppercase";
cheatInput.style.textAlign = "center";
cheatInput.autocomplete = "off";
cheatInput.spellcheck = false;

// кнопка подтвердить
const cheatConfirm = document.createElement("button");
cheatConfirm.id = "cheatConfirm";
cheatConfirm.textContent = "подтвердить";
cheatConfirm.style.width = "100%";
cheatConfirm.style.padding = "12px 14px";
cheatConfirm.style.borderRadius = "8px";
cheatConfirm.style.border = "none";
cheatConfirm.style.fontFamily = "'Montserrat', sans-serif";
cheatConfirm.style.fontWeight = "700";
cheatConfirm.style.cursor = "pointer";
cheatConfirm.style.opacity = "0.5";
cheatConfirm.style.pointerEvents = "none";
cheatConfirm.style.backgroundColor = "#FFDCC0";
cheatConfirm.style.color = "#2b1f14";

const cheatHint = document.createElement("div");
cheatHint.style.fontSize = "12px";
cheatHint.style.color = "#8a6f5a";
cheatHint.style.textAlign = "center";
cheatHint.textContent = "только цифры и латинские буквы, 6 символов";

cheatWrapper.appendChild(cheatInput);
cheatWrapper.appendChild(cheatConfirm);
cheatWrapper.appendChild(cheatHint);

if (settingsPanel && loginOutBtn && settingsPanel.contains(loginOutBtn)) {
  settingsPanel.insertBefore(cheatWrapper, loginOutBtn);
} else if (settingsPanel) {
  settingsPanel.appendChild(cheatWrapper);
} else {
  document.body.appendChild(cheatWrapper);
}

// ввод: только 0-9 и A-Z, автоматически uppercase, maxlength=6
cheatInput.addEventListener("input", (e) => {
  const raw = e.target.value;
  const filtered = raw.replace(/[^0-9a-zA-Z]/g, "");
  const up = filtered.toUpperCase().slice(0, 6);
  if (up !== raw) e.target.value = up; else e.target.value = up;

  if (up.length >= 6) {
    cheatConfirm.style.opacity = "1";
    cheatConfirm.style.pointerEvents = "auto";
  } else {
    cheatConfirm.style.opacity = "0.5";
    cheatConfirm.style.pointerEvents = "none";
  }
});

cheatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && cheatConfirm.style.pointerEvents === "auto") {
    cheatConfirm.click();
  }
});

function applyCheatEffect(effect) {
  if (!effect) return;
  if (effect.reset) {
    coins = 0;
    clickPower = 1;
    boughtItems = Object.keys(boughtItems || {}).reduce((acc, k) => { acc[k] = 0; return acc; }, {});
    if (document.getElementById("counterValue")) document.getElementById("counterValue").textContent = coins;
    if (document.getElementById("shopBalanceValue")) document.getElementById("shopBalanceValue").textContent = coins;
    if (document.getElementById("shopBalanceValueClicker")) document.getElementById("shopBalanceValueClicker").textContent = coins;
    if (document.getElementById("plateBalanceValue")) document.getElementById("plateBalanceValue").textContent = coins;
    renderShop();
  }
  if (effect.coins) {
    coins += Number(effect.coins) || 0;
    startCounterAnimation(coins);
    startPlateAnimation(coins);
  }
  if (effect.clickPower) {
    clickPower += Number(effect.clickPower) || 0;
  }
}

async function verifyCheat(code) {
  code = (code || "").toUpperCase().slice(0, 6);
  if (!code || code.length < 6) return { ok: false, msg: "код слишком короткий" };

  if (CHEAT_VERIFY_URL) {
    try {
      const resp = await fetch(CHEAT_VERIFY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, userId: isGuest ? null : userId })
      });
      const data = await resp.json();
      return data;
    } catch (e) {
      console.error(e);
      return { ok: false, msg: "ошибка проверки" };
    }
  }

  try {
    const snap = await get(ref(db, "cheatCodes/" + code));
    if (!snap.exists()) return { ok: false, msg: "неверный код" };
    const effect = snap.val();
    return { ok: true, effect };
  } catch (e) {
    console.error(e);
    return { ok: false, msg: "ошибка сети" };
  }
}

cheatConfirm.addEventListener("click", async () => {
  const code = cheatInput.value.trim().toUpperCase();
  if (code.length < 6) return;

  cheatConfirm.textContent = "проверка...";
  cheatConfirm.style.pointerEvents = "none";
  cheatConfirm.style.opacity = "0.7";

  const res = await verifyCheat(code);

  if (res && res.ok) {
    const effect = res.effect || {};
    if (effect.reset) {
      applyCheatEffect({ reset: true });
      if (!isGuest && userId) {
        try { await set(ref(db, 'users/' + userId), null); } catch (e) { console.error(e); }
      }
      alert("Чит-код применён: игровые данные сброшены.");
    } else {
      applyCheatEffect(effect);
      alert("чит-код применён");
    }
  } else {
    alert(res && res.msg ? res.msg : "неверный код");
  }

  cheatConfirm.textContent = "подтвердить";
  cheatInput.value = "";
  cheatConfirm.style.opacity = "0.5";
  cheatConfirm.style.pointerEvents = "none";
});
/* === конец блока чит-кодов === */

loginOutBtn.onclick=async()=>{          
  if(isGuest){ await signInWithPopup(auth,provider); return; }          
  await signOut(auth);          
  alert("Вы вышли из аккаунта");          
  isGuest=true; userId=localUserId; coins=0; clickPower=1;          
  boughtItems={ "1":0,"2":0 };          
  // при выходе сбрасываем отображения мгновенно          
  document.getElementById("counterValue").textContent = 0;          
  if(document.getElementById("shopBalanceValue")) document.getElementById("shopBalanceValue").textContent = 0;          
  if(document.getElementById("shopBalanceValueClicker")) document.getElementById("shopBalanceValueClicker").textContent = 0;          
  if(document.getElementById("plateBalanceValue")) document.getElementById("plateBalanceValue").textContent = 0;          
  renderShop();          
};          
          
onAuthStateChanged(auth,async user=>{          
  if(user){          
    isGuest=false;          
    userId=user.email.replaceAll(".","_");          
    loginOutBtn.textContent="Выйти из аккаунта";          
    loginBtnEl.style.display="none";          
    const snap = await get(ref(db,'users/'+userId));          
    if(snap.exists()){          
      const data = snap.val();          
      coins=data.coins||0;          
      clickPower=data.clickPower||1;          
      boughtItems=data.items||{ "1":0,"2":0 };          
    }          
    renderShop(); startCounterAnimation(coins); startPlateAnimation(coins);          
  }else{          
    isGuest=true;          
    loginOutBtn.textContent="Войти в аккаунт";          
  }          
});          
          
/* ---------------------------------------------- */          
/* PANELS */          
const panels = document.getElementById("panels");          
let btnTimers={};          
          
function safeSetStyle(el,prop,value,delay=0){          
  const id = el.id + prop;          
  if(btnTimers[id]) clearTimeout(btnTimers[id]);          
  if(delay===0) el.style[prop]=value;          
  else btnTimers[id]=setTimeout(()=>{ el.style[prop]=value; }, delay);          
}          
          
panels.style.transform="translateX(-392px)";          
function swingPlate(direction){          
  const plate = document.getElementById("topPlate");          
  plate.style.animation="none"; void plate.offsetWidth;          
  let deg1=8, deg2=-5, deg3=3;          
  if(direction==="right"){ deg1=-deg1; deg2=-deg2; deg3=-deg3; }          
  plate.style.setProperty("--deg1",deg1+"deg");          
  plate.style.setProperty("--deg2",deg2+"deg");          
  plate.style.setProperty("--deg3",deg3+"deg");          
  plate.style.animation="swingSuspended 0.9s ease-in-out";          
  plate.addEventListener("animationend",function handler(){          
    plate.style.transform="translateX(-50%) rotate(0deg)";          
    plate.style.animation="none";          
    plate.removeEventListener("animationend",handler);          
  });          
}          
          
function goToShop(){ swingPlate("left"); panels.style.transform="translateX(-784px)"; shopBtnEl.style.right="-60px"; settingsBtnEl.style.left="-60px"; loginBtnEl.style.left="-60px"; backToClickerBtn.style.display="block"; backToClickerBtn.style.right="-60px"; setTimeout(()=>safeSetStyle(backToClickerBtn,"right","12px",0),50); updatePricesColor(); }          
function goBackFromShop(){ swingPlate("right"); panels.style.transform="translateX(-392px)"; safeSetStyle(backToClickerBtn,"right","-60px"); safeSetStyle(backToClickerBtn,"display","none",400); shopBtnEl.style.right="12px"; settingsBtnEl.style.left="12px"; loginBtnEl.style.left="12px"; }          
function goToSettings(){ swingPlate("right"); panels.style.transform="translateX(0)"; shopBtnEl.style.right="-60px"; settingsBtnEl.style.left="-60px"; loginBtnEl.style.left="-60px"; backBtnEl.style.display="block"; safeSetStyle(backBtnEl,"right","12px",50); }          
function goBackFromSettings(){ swingPlate("left"); panels.style.transform="translateX(-392px)"; shopBtnEl.style.right="12px"; settingsBtnEl.style.left="12px"; safeSetStyle(backBtnEl,"right","-60px"); safeSetStyle(backBtnEl,"display","none",500); loginBtnEl.style.left="12px"; }          
          
shopBtnEl.onclick=goToShop;          
settingsBtnEl.onclick=goToSettings;          
backBtnEl.onclick=goBackFromSettings;          
backToClickerBtn.onclick=goBackFromShop;          
          
document.addEventListener("visibilitychange",()=>{ if(!document.hidden){ clickImg.style.display="block"; startPlateAnimation(coins); startCounterAnimation(coins); } });          
          
/* ---------------------------------------------- */          
/* СТАРТ */          
fakeLoad(()=>{          
  panels.style.transform="translateX(-392px)";          
  renderShop();          
  document.getElementById("topPlate").style.display="block";          
  // инициализация видимостей значений          
  document.getElementById("counterValue").textContent = coins;          
  if(document.getElementById("shopBalanceValue")) document.getElementById("shopBalanceValue").textContent = coins;          
  if(document.getElementById("shopBalanceValueClicker")) document.getElementById("shopBalanceValueClicker").textContent = coins;          
  if(document.getElementById("plateBalanceValue")) document.getElementById("plateBalanceValue").textContent = coins;          
  // запускаем пустую анимацию синхронизации (если нужно)          
});
