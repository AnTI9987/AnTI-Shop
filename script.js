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
/* ПРОГРУЗКА ЗВУКОВ — ТЕПЕРЬ ЧЕРЕЗ <audio> */
/* ---------------------------------------------- */
// iPhone НЕ даёт менять volume у new Audio(), поэтому ВСЕ звуки — только через теги в HTML
const sClickWood = document.getElementById("sClickWood");
const sClickClicker = document.getElementById("sClickClicker");
const sClickButton = document.getElementById("sClickButton");
const menuMusic = document.getElementById("menuMusic");

let musicEnabled = true;
let soundEnabled = true;

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
clickImg.style.marginTop = "50px";

const groundImg = document.getElementById("groundImg");

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

splashScreen.style.background = "#000";
progressBar.style.background = "#fff";
progressPercent.style.color = "#fff";

function fakeLoad(callback){
  const splash = document.getElementById("splashScreen");
  const progress = document.getElementById("progressBar");
  const percent = document.getElementById("progressPercent");
  const playBtn = document.getElementById("playBtn");

  let width = 0;
  const interval = setInterval(()=>{
    width += Math.random()*2 + 0.5;
    if(width>100) width=100;
    progress.style.width = width + "%";
    percent.textContent = Math.floor(width) + "%";
    if(width>=100){
      clearInterval(interval);
      splash.classList.add("loaded");
      if(callback) callback();
    }
  }, 50);

playBtn.onclick = () => {

  const unlock = (audio, volume = 0.8) => {
    if(!audio) return;
    audio.muted = false;
    audio.volume = volume;
    audio.currentTime = 0;
    audio.play().then(()=>{
      audio.pause();
      audio.currentTime = 0;
    }).catch(()=>{});
  };

  // 🔓 разблокировка ВСЕХ звуков (строго по клику)
  unlock(menuMusic, musicEnabled ? 0.8 : 0);
  unlock(sClickButton, soundEnabled ? 0.8 : 0);
  unlock(sClickClicker, soundEnabled ? 0.8 : 0);
  unlock(sClickWood, soundEnabled ? 0.8 : 0);

  // ▶ запуск фоновой музыки
  if(musicEnabled && menuMusic){
    menuMusic.currentTime = 0;
    menuMusic.play().catch(()=>{});
  }

  // ⬇⬇⬇ ВОТ ЭТО БЫЛО ПОТЕРЯНО ⬇⬇⬇
  splash.style.transition = "opacity 1s ease";
  splash.style.opacity = "0";
  setTimeout(()=>{ splash.style.display = "none"; }, 1000);
};
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

let boughtItems = { "1":0, "2":0 };

let userKey = null;
let lastSavedCoins = coins;

/* ---------------------------------------------- */
/* КНОПКА Сбросить прогресс */
/* ---------------------------------------------- */
const resetProgressBtn = document.createElement("button");
resetProgressBtn.textContent = "Сбросить прогресс";
resetProgressBtn.style.fontFamily="'Montserrat', sans-serif";
resetProgressBtn.style.fontWeight="600";
resetProgressBtn.style.display = "block";
resetProgressBtn.style.marginTop = "12px";
loginOutBtn.parentNode.insertBefore(resetProgressBtn, loginOutBtn.nextSibling);

resetProgressBtn.onclick = async () => {
  let msg = isGuest ?
    "Вы уверены, что хотите сбросить прогресс? Все локальные достижения будут испепелены!" :
    "Вы уверены, что хотите сбросить прогресс? Все достижения на вашем аккаунте будут испепелены!";

  if(confirm(msg)){
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
      await set(ref(db, 'users/' + userKey), {coins, clickPower, items: boughtItems});
      lastSavedCoins = coins;
    }
  }
};

/* ---------------------------------------------- */
/* АНИМАЦИЯ ПЛАШКИ */
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

// Белые +монеты ↑
function spawnFloatingCoin(x,y,value){
  const el = document.createElement("div");
  el.className = "floating-coin";
  el.style.left = (x - 12) + "px";
  el.style.top  = (y - 12) + "px";
  el.innerHTML = `<span style="font-weight:700;font-size:18px;color:#ffffff;text-shadow:0 2px 6px rgba(0,0,0,0.45);">+${value}</span><img src="img/anti-coin.png" style="width:18px;height:18px;margin-left:6px;">`;
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
    counterValue.textContent = coins;
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

function playSound(audio){
  if(!soundEnabled) return;
  if(!audio) return;
  try{
    audio.currentTime = 0;
    audio.play().catch(()=>{});
  }catch(e){}
}

clickButton.addEventListener("click", e=>{
  playSound(sClickClicker);
  clickAction(e.clientX, e.clientY);
  animateClicker();
});

clickButton.addEventListener("touchstart", e=>{
  e.preventDefault();
playSound(sClickClicker);
  for(const t of e.changedTouches){
    clickAction(t.clientX, t.clientY);
  }
  animateClicker();
},{passive:false});

/* -------------------- ЧАСТЬ 2/2 -------------------- */

/* ---------------------------------------------- */
/* МАГАЗИН */
/* ---------------------------------------------- */
const baseShopItems = [
  {id:1,name:'Оторванная пуговица',baseCost:50,description:'Кажеться, раньше это служило подобием глаза для плюшевой игрушки.',property:'+1 к прибыли за клик',incrementCost:50,img:'img/item-1.png'},
  {id:2,name:'Страшная штука',baseCost:250,description:'Оно пугает.',property:'+5 к прибыли за клик',power:5,stock:5,img:'img/item-2.png'}
];
let shopItems = baseShopItems.map(item => ({...item}));

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

/* Рендер магазина */
function renderShop(){
  updateShopItems();
  itemsBlock.innerHTML="";

  const tierLabel = document.createElement("div");
  tierLabel.style.display = "flex";
  tierLabel.style.alignItems = "center";
  tierLabel.style.justifyContent = "center";
  tierLabel.style.marginBottom = "12px";

  const lineLeft = document.createElement("div");
  lineLeft.style.height = "3px";
  lineLeft.style.backgroundColor = "#FFDCC0";
  lineLeft.style.flex = "1";
  lineLeft.style.marginRight = "8px";

  const lineRight = document.createElement("div");
  lineRight.style.height = "3px";
  lineRight.style.backgroundColor = "#FFDCC0";
  lineRight.style.flex = "1";
  lineRight.style.marginLeft = "8px";

  const text = document.createElement("span");
  text.textContent = "Ⅰ ТИР";
  text.style.color = "#FFDCC0";
  text.style.fontWeight = "800";
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
    const btn=document.createElement("button");
    btn.classList.add('buy-btn'); // помечаем как кнопка покупки — чтобы общий звуковой обработчик её пропускал
    d.appendChild(btn); updateButtonText(item,btn);
    btn.addEventListener("click", ()=> purchaseItem(item) );
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

/* Покупка */
function purchaseItem(item){
  if(item.stock !== undefined && item.stock <=0) return;
  if(coins < item.cost) return;

  coins -= item.cost;
  boughtItems[item.id] = (boughtItems[item.id]||0)+1;
  clickPower += item.id===1?1:item.power||0;

  startCounterAnimation(coins);
  startPlateAnimation(coins);
  updatePricesColor();
  renderShop();

  if(!isGuest) savePlayerData();
}

/* ---------------------------------------------- */
/* PANELS и plate swing */
/* ---------------------------------------------- */
const panels = document.getElementById("panels");
let btnTimers={};

function safeSetStyle(el,prop,value,delay=0){
  const id = (el.id||Math.random()) + prop;
  if(btnTimers[id]) clearTimeout(btnTimers[id]);
  if(delay===0) el.style[prop]=value;
  else btnTimers[id]=setTimeout(()=>{ el.style[prop]=value; }, delay);
}

/* стартовое положение панелей (как в оригинале) */
panels.style.transform="translateX(-392px)";

function swingPlate(direction){
  const plate = document.getElementById("topPlate");
  if(!plate) return;

  // отключаем удар, если он был
  plate.classList.remove("plate-hit");

  // сбрасываем текущее покачивание
  plate.classList.remove("swinging");
  void plate.offsetWidth;

  let deg1 = 8, deg2 = -5, deg3 = 3;
  if(direction === "right"){
    deg1 = -deg1;
    deg2 = -deg2;
    deg3 = -deg3;
  }

  plate.style.setProperty("--deg1", deg1 + "deg");
  plate.style.setProperty("--deg2", deg2 + "deg");
  plate.style.setProperty("--deg3", deg3 + "deg");

  plate.classList.add("swinging");

  plate.addEventListener("animationend", function handler(){
    plate.classList.remove("swinging");
    plate.removeEventListener("animationend", handler);
  });
}

function goToShop(){ 
  swingPlate("left"); 
  panels.style.transform="translateX(-200vw)"; 
  shopBtnEl.style.right="-60px"; 
  settingsBtnEl.style.left="-60px"; 
  loginBtnEl.style.left="-60px"; 
  backToClickerBtn.style.display="block"; 
  backToClickerBtn.style.right="-60px"; 
  setTimeout(()=>safeSetStyle(backToClickerBtn,"right","12px",0),50); 
  updatePricesColor(); 
}
function goBackFromShop(){ 
  swingPlate("right"); 
  panels.style.transform="translateX(-100vw)"; 
  safeSetStyle(backToClickerBtn,"right","-60px"); 
  safeSetStyle(backToClickerBtn,"display","none",400); 
  shopBtnEl.style.right="12px"; 
  settingsBtnEl.style.left="12px"; 
  loginBtnEl.style.left="12px"; 
}
function goToSettings(){ 
  swingPlate("right"); 
  panels.style.transform="translateX(0)"; 
  shopBtnEl.style.right="-60px"; 
  settingsBtnEl.style.left="-60px"; 
  loginBtnEl.style.left="-60px"; 
  backBtnEl.style.display="block"; 
  safeSetStyle(backBtnEl,"right","12px",50); 
}
function goBackFromSettings(){ 
  swingPlate("left"); 
  panels.style.transform="translateX(-100vw)"; 
  shopBtnEl.style.right="12px"; 
  settingsBtnEl.style.left="12px"; 
  safeSetStyle(backBtnEl,"right","-60px"); 
  safeSetStyle(backBtnEl,"display","none",500); 
  loginBtnEl.style.left="12px"; 
}

shopBtnEl.onclick=goToShop;
settingsBtnEl.onclick=goToSettings;
backBtnEl.onclick=goBackFromSettings;
backToClickerBtn.onclick=goBackFromShop;

/* plate click: звук и короткая анимация */
const topPlateEl = document.getElementById('topPlate');
if(topPlateEl){
  topPlateEl.addEventListener('click', (e)=>{
    if(topPlateEl.style.display === 'none') return;
    try { 
      playSound(sClickWood);
    } catch(e) {}
    topPlateEl.classList.remove('plate-hit');
    void topPlateEl.offsetWidth; // сброс
    topPlateEl.classList.add('plate-hit');
  });

  // Надёжный обработчик очистки класса plate-hit на завершение анимации
  topPlateEl.addEventListener('animationend', (e)=>{
    // keyframes в CSS называются "hitPlate"
    if(e && e.animationName && e.animationName.toLowerCase().includes("hit")) {
      topPlateEl.classList.remove('plate-hit');
    }
  });
}

/* ---------------------------------------------- */
/* ГЛОБАЛЬНЫЙ ЗВУК КНОПОК (исключения buy-btn и clickButton) */
/* ---------------------------------------------- */
function handleButtonSound(e) {
    if (!soundEnabled) return;
    const btn = e.target.closest("button");
    if (!btn) return;

    if (btn.classList.contains("buy-btn")) return;
    if (btn.id === "clickButton") return;

    try {
        playSound(sClickButton);
    } catch (e) {}
}

let isTouch = false;
document.addEventListener("touchstart", () => { isTouch = true; }, { once: true });

document.addEventListener("touchstart", (e) => {
    handleButtonSound(e);
}, { passive: true });

document.addEventListener("click", (e) => {
    if (isTouch) return;
    handleButtonSound(e);
});

/* ---------------------------------------------- */
/* ГРОМКОСТИ — ИНИЦИАЛИЗАЦИЯ ПОЛЗУНКОВ И ЛОГИКА ЗАЛИВКИ */
/* ---------------------------------------------- */

const musicToggleBtn = document.getElementById("musicToggleBtn");
const soundToggleBtn = document.getElementById("soundToggleBtn");

// Музыка
musicToggleBtn.addEventListener("click", () => {
  musicEnabled = !musicEnabled;

  if(musicEnabled){
    menuMusic.volume = 0.8;
    menuMusic.play().catch(()=>{});
  } else {
    menuMusic.pause();
  }

  musicToggleBtn.querySelector("img").src =
    musicEnabled ? "img/music-volume-on.png" : "img/music-volume-off.png";
});

// Звуки
soundToggleBtn.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  soundToggleBtn.querySelector("img").src = soundEnabled ? "img/sound-volume-on.png" : "img/sound-volume-off.png";

  // volume всех звуков
  const volume = soundEnabled ? 0.8 : 0;
  if(sClickWood) sClickWood.volume = volume;
  if(sClickClicker) sClickClicker.volume = volume;
  if(sClickButton) sClickButton.volume = volume;
});

/* ---------------------------------------------- */
/* АВТОСОХРАНЕНИЕ */
setInterval(()=>{
  if(!isGuest && coins !== lastSavedCoins){
    savePlayerData();
  }
}, 5000);

/* ---------------------------------------------- */
/* AUTH и загрузка данных пользователя */
/* ---------------------------------------------- */
function buildUserKeyFromEmail(email){
  if(!email) return null;
  return email.toLowerCase().replace(/\./g, '_');
}

async function savePlayerData() {
  if(!isGuest && userKey){
    try{
      await set(ref(db, 'users/' + userKey), {
        coins: coins,
        clickPower: clickPower,
        items: boughtItems,
      });
      lastSavedCoins = coins;
    } catch(e){
      console.error("Ошибка сохранения данных в Firebase:", e);
    }
  }
}

/* onAuthStateChanged */
onAuthStateChanged(auth, (user) => {
  if(user){
    isGuest = false;
    userId = user.uid;
    userKey = buildUserKeyFromEmail(user.email);
    updateAuthUI(user);

    get(ref(db, 'users/' + userKey)).then(snapshot=>{
      if(snapshot.exists()){
        const data = snapshot.val();

        coins = data.coins || 0;
        clickPower = data.clickPower || 1;
        boughtItems = data.items || {"1":0,"2":0};

        counterValue.textContent = coins;
        if(document.getElementById("shopBalanceValue")) document.getElementById("shopBalanceValue").textContent = coins;
        if(document.getElementById("shopBalanceValueClicker")) document.getElementById("shopBalanceValueClicker").textContent = coins;
        if(document.getElementById("plateBalanceValue")) document.getElementById("plateBalanceValue").textContent = coins;

        startCounterAnimation(coins);
        startPlateAnimation(coins);
        renderShop();

        lastSavedCoins = coins;
      } else {
        set(ref(db, 'users/' + userKey), {
          coins: coins,
          clickPower: clickPower,
          items: boughtItems
        }).then(()=>{ lastSavedCoins = coins; }).catch(e=>console.error(e));
      }
    }).catch(err=>console.error(err));

  } else {
    // гостевой режим
    isGuest = true;
    userKey = null;
    updateAuthUI(null);

    coins = 0;
    clickPower = 1;
    boughtItems = {"1":0,"2":0};

    counterValue.textContent = coins;
    if(document.getElementById("plateBalanceValue")) document.getElementById("plateBalanceValue").textContent = coins;
    if(document.getElementById("shopBalanceValue")) document.getElementById("shopBalanceValue").textContent = coins;
    if(document.getElementById("shopBalanceValueClicker")) document.getElementById("shopBalanceValueClicker").textContent = coins;

    startCounterAnimation(coins);
    startPlateAnimation(coins);
    renderShop();
  }
});

/* Кнопки входа/выход */
loginBtnEl.addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (e) {
    console.error("Ошибка входа:", e);
  }
});

loginOutBtn.addEventListener("click", async () => {
  try {
    if(isGuest){
      await signInWithPopup(auth, provider);
    } else {
      await signOut(auth);
    }
  } catch (e) {
    console.error("Ошибка авторизации/выхода:", e);
  }
});

function updateAuthUI(user){
  if(user){
    loginOutBtn.textContent = "Выйти из аккаунта";
    loginBtnEl.style.display = "none";
  } else {
    loginOutBtn.textContent = "Войти в аккаунт";
    loginBtnEl.style.display = "block";
  }
}

/* ---------------------------------------------- */
/* START — запуск */
fakeLoad(()=>{
  // корректируем позицию панелей на старт
  panels.style.transform="translateX(-100vw)";
  renderShop();
  if(document.getElementById("topPlate")) document.getElementById("topPlate").style.display="block";

  // инициализация значений на UI
  if(counterValue) counterValue.textContent = coins;
  if(document.getElementById("shopBalanceValue")) document.getElementById("shopBalanceValue").textContent = coins;
  if(document.getElementById("shopBalanceValueClicker")) document.getElementById("shopBalanceValueClicker").textContent = coins;
  if(document.getElementById("plateBalanceValue")) document.getElementById("plateBalanceValue").textContent = coins;
});
