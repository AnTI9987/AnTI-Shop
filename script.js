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
/* ---------------------------------------------- */
// все звуки берутся из папки sounds/
const sClickWood = new Audio('sounds/click-wood.mp3');
sClickWood.preload = 'auto';
const sClickClicker = new Audio('sounds/click-clicker.mp3');
sClickClicker.preload = 'auto';
const sClickButton = new Audio('sounds/click-button.mp3');
sClickButton.preload = 'auto';
const menuMusic = document.getElementById("menuMusic");

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
clickImg.style.marginTop = "50px";  // опускаем кликер-картинку на 50px вниз

// sliders (вставлены в HTML settingsPanel; если их нет — создадим позже программно)
let musicVolumeSlider = document.getElementById("musicVolumeSlider");
let soundVolumeSlider = document.getElementById("soundVolumeSlider");

// groundImg — теперь в index.html у <img id="groundImg">
const groundImg = document.getElementById("groundImg");
if(groundImg){
  // если хочешь сдвинуть картинку дополнительно, делай здесь
  // groundImg.style.transform = "translateY(-100px)";
}

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

// стиль для загрузки
splashScreen.style.background = "#000";
progressBar.style.background = "#fff";
progressPercent.style.color = "#fff";

function fakeLoad(callback){
  const splash = document.getElementById("splashScreen");
  const progress = document.getElementById("progressBar");
  const percent = document.getElementById("progressPercent");
  const playBtn = document.getElementById("playBtn");

  const menuMusic = document.getElementById("menuMusic");

  playBtn.addEventListener("click", () => {
    try {
        menuMusic.volume = musicVolume;
        const playPromise = menuMusic.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {});
        }
    } catch (e) {}
  });

  let width = 0;
  const interval = setInterval(()=>{
    width += Math.random()*2 + 0.5; // медленнее и плавнее
    if(width>100) width=100;
    progress.style.width = width + "%";
    percent.textContent = Math.floor(width) + "%";
    if(width>=100){
      clearInterval(interval);
      splash.classList.add("loaded"); // кнопка вылетает, прогресс и надпись поднимаются
      if(callback) callback();
    }
  }, 50);

  playBtn.onclick = ()=>{
    splash.style.transition = "opacity 1s ease";
    splash.style.opacity = "0";  // плавное затухание
    setTimeout(()=>{ splash.style.display = "none"; }, 1000);
  };
}

/* ---------------------------------------------- */
/* ПЕРЕМЕННЫЕ И СТАРТОВЫЕ НАСТРОЙКИ */
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

// переменные для сохранения в Firebase
let userKey = null;        // ключ — email пользователя с заменой точек
let lastSavedCoins = coins; // для отслеживания изменений монет

/* ---------------------------------------------- */
/* КНОПКА Сбросить прогресс (создаётся динамически) */
/* ---------------------------------------------- */
const resetProgressBtn = document.createElement("button");
resetProgressBtn.textContent = "Сбросить прогресс";
resetProgressBtn.style.fontFamily="'Montserrat', sans-serif";
resetProgressBtn.style.fontWeight="600";
resetProgressBtn.style.display = "block";
resetProgressBtn.style.marginTop = "12px";
loginOutBtn.parentNode.insertBefore(resetProgressBtn, loginOutBtn.nextSibling);

// подтверждение оставляем (это не кнопки авторизации)
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
      await set(ref(db, 'users/' + userKey), {coins, clickPower, items: boughtItems});
      lastSavedCoins = coins;
    }
  }
};

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

/* play audio helper: reset time and play (catch promise) */
function playSound(audio){
  try{
    if(!audio) return;
    audio.pause();
    audio.currentTime = 0;
    const p = audio.play();
    if(p && p.catch) p.catch(()=>{/* ignore autoplay errors */});
  }catch(e){}
}

/* clicker events — тоже проигрываем звук click-clicker */
clickButton.addEventListener("click", e=>{
  // sound for clicker
  try { sClickClicker.currentTime = 0; sClickClicker.play().catch(()=>{}); } catch(e){}
  clickAction(e.clientX, e.clientY);
  animateClicker();
});
clickButton.addEventListener("touchstart", e=>{
  e.preventDefault();
  try { sClickClicker.currentTime = 0; sClickClicker.play().catch(()=>{}); } catch(e){}
  for(const t of e.changedTouches){
    clickAction(t.clientX, t.clientY);
  }
  animateClicker();
},{passive:false});

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

/* Функция покупки с моментальным сохранением */
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

  if(!isGuest) savePlayerData(); // мгновенное сохранение в БД
}

/* ---------------------------------------------- */
/* PANELS */
/* ---------------------------------------------- */
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

  // ⛔ ГЛАВНОЕ: отключаем удар, если он был
  plate.classList.remove("plate-hit");

  // если уже идёт покачивание — сбрасываем
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

function goToShop(){ swingPlate("left"); panels.style.transform="translateX(-784px)"; shopBtnEl.style.right="-60px"; settingsBtnEl.style.left="-60px"; loginBtnEl.style.left="-60px"; backToClickerBtn.style.display="block"; backToClickerBtn.style.right="-60px"; setTimeout(()=>safeSetStyle(backToClickerBtn,"right","12px",0),50); updatePricesColor(); }
function goBackFromShop(){ swingPlate("right"); panels.style.transform="translateX(-392px)"; safeSetStyle(backToClickerBtn,"right","-60px"); safeSetStyle(backToClickerBtn,"display","none",400); shopBtnEl.style.right="12px"; settingsBtnEl.style.left="12px"; loginBtnEl.style.left="12px"; }
function goToSettings(){ swingPlate("right"); panels.style.transform="translateX(0)"; shopBtnEl.style.right="-60px"; settingsBtnEl.style.left="-60px"; loginBtnEl.style.left="-60px"; backBtnEl.style.display="block"; safeSetStyle(backBtnEl,"right","12px",50); }
function goBackFromSettings(){ swingPlate("left"); panels.style.transform="translateX(-392px)"; shopBtnEl.style.right="12px"; settingsBtnEl.style.left="12px"; safeSetStyle(backBtnEl,"right","-60px"); safeSetStyle(backBtnEl,"display","none",500); loginBtnEl.style.left="12px"; }

shopBtnEl.onclick=goToShop;
settingsBtnEl.onclick=goToSettings;
backBtnEl.onclick=goBackFromSettings;
backToClickerBtn.onclick=goBackFromShop;

/* plate click: короткая анимация и звук */
const topPlateEl = document.getElementById('topPlate');
if(topPlateEl){
  topPlateEl.addEventListener('click', (e)=>{
    if(topPlateEl.style.display === 'none') return; // защита если plate скрыта
    try { sClickWood.currentTime = 0; sClickWood.play().catch(()=>{}); } catch(e) {}
    // запускаем короткую анимацию клика через класс
    topPlateEl.classList.remove('plate-hit');
    void topPlateEl.offsetWidth; // сброс для перезапуска анимации
    topPlateEl.classList.add('plate-hit');
  });

  // вместо setTimeout используем animationend для очистки класса
  topPlateEl.addEventListener('animationend', (e)=>{
    if(e.animationName === "plateHit"){ // убедись, что CSS анимация клика называется plateHit
        topPlateEl.classList.remove('plate-hit');
    }
  });
}

/* общий обработчик звука для кнопок (исключая кнопки покупки buy-btn и сам clickButton) */
document.addEventListener('click', (e)=>{
  const btn = e.target.closest('button');
  if(!btn) return;
  // не воспроизводим звук для кнопок покупки (они имеют класс buy-btn)
  if(btn.classList.contains('buy-btn')) return;
  // не воспроизводим звук для clickButton — он сам играет свой звук
  if(btn.id === 'clickButton') return;
  // кнопка авторизации/настройки/навигации и т.д. — проигрываем звук
  try { sClickButton.currentTime = 0; sClickButton.play().catch(()=>{}); } catch(e) {}
});

/* document-level touchstart handler (for mobile) to catch button touches */
document.addEventListener('touchstart', (e)=>{
  const btn = e.target.closest('button');
  if(!btn) return;
  if(btn.classList.contains('buy-btn')) return;
  if(btn.id === 'clickButton') return;
  try { sClickButton.currentTime = 0; sClickButton.play().catch(()=>{}); } catch(e) {}
}, {passive:true});

/* ---------------------------------------------- */
/* АВТОРИЗАЦИЯ И UI КНОПОК */
/* ---------------------------------------------- */

// Делаем стиль у loginOutBtn похожим на resetProgressBtn
loginOutBtn.style.fontFamily = "'Montserrat', sans-serif";
loginOutBtn.style.fontWeight = "600";

// Обновление UI кнопок в зависимости от статуса авторизации
function updateAuthUI(user){
  if(user){
    loginOutBtn.textContent = "Выйти из аккаунта";
    loginBtnEl.style.display = "none";
  } else {
    loginOutBtn.textContent = "Войти в аккаунт";
    loginBtnEl.style.display = "block";
  }
}

// Вход через верхнюю кнопку
loginBtnEl.addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    // onAuthStateChanged обработает загрузку данных и UI
  } catch (e) {
    console.error("Ошибка входа:", e);
  }
});

// Кнопка в настройках: вход/выход
loginOutBtn.addEventListener("click", async () => {
  try {
    if(isGuest){
      // вход
      await signInWithPopup(auth, provider);
      // onAuthStateChanged обработает остальное
    } else {
      // выход
      await signOut(auth);
      // onAuthStateChanged обработает сброс интерфейса
    }
  } catch (e) {
    console.error("Ошибка авторизации/выхода:", e);
  }
});

/* ---------------------------------------------- */
/* Сохранение / Загрузка данных игрока в Firebase */
/* ---------------------------------------------- */

// Вспомогательная функция для чтения ключа из email
function buildUserKeyFromEmail(email){
  if(!email) return null;
  // заменяем все точки на нижнее подчеркивание, приводим к нижнему регистру
  return email.toLowerCase().replace(/\./g, '_');
}

// Сохраняет основной блок данных игрока (coins, clickPower, items) + volume не трогает
async function savePlayerData() {
  if(!isGuest && userKey){
    try{
      await set(ref(db, 'users/' + userKey), {
        coins: coins,
        clickPower: clickPower,
        items: boughtItems,
        // не трогаем volume здесь — она отдельно сохраняется в saveVolumeSettings
      });
      lastSavedCoins = coins;
    } catch(e){
      console.error("Ошибка сохранения данных в Firebase:", e);
    }
  }
}

// Сохраняет громкости (volume) отдельно, чтобы не перезаписывать случайно другие поля
async function saveVolumeSettings() {
  if(!isGuest && userKey){
    try{
      await set(ref(db, 'users/' + userKey + '/volume'), {
        music: musicVolume,
        sound: soundVolume
      });
    } catch(e){
      console.error("Ошибка сохранения громкости в Firebase:", e);
    }
  }
}

/* ---------------------------------------------- */
/* ПЕРИОДИЧЕСКОЕ АВТОСОХРАНЕНИЕ (каждые 5 секунд) */
/* ---------------------------------------------- */
setInterval(()=>{
  if(!isGuest && coins !== lastSavedCoins){
    savePlayerData();
  }
}, 5000);

/* ---------------------------------------------- */
/* ГРОМКОСТИ — ИНИЦИАЛИЗАЦИЯ ПОЛЗУНКОВ И ЗНАЧЕНИЙ */
/* ---------------------------------------------- */
// дефолтные значения
let musicVolume = 0.8;
let soundVolume = 0.8;

// если слайдеры ещё не в DOM (например HTML не изменён), попытаемся создать минимальные элементы безопасно
(function ensureSlidersExist(){
  if(!musicVolumeSlider || !soundVolumeSlider){
    // если sliders нет, попробуем найти их повторно (вдруг DOM ещё не отрендерился)
    musicVolumeSlider = document.getElementById("musicVolumeSlider");
    soundVolumeSlider = document.getElementById("soundVolumeSlider");
  }
})();

// применяем громкости к аудиоэлементам
try {
  if(menuMusic) menuMusic.volume = musicVolume;
  sClickWood.volume = soundVolume;
  sClickClicker.volume = soundVolume;
  sClickButton.volume = soundVolume;
} catch(e){}

// Если слайдеры существуют — установим их значения и повесим обработчики
if(musicVolumeSlider){
  musicVolumeSlider.value = musicVolume;
  musicVolumeSlider.addEventListener("input", (e) => {
    musicVolume = parseFloat(e.target.value);
    if(menuMusic) menuMusic.volume = musicVolume;
    saveVolumeSettings();
  });
}
if(soundVolumeSlider){
  soundVolumeSlider.value = soundVolume;
  soundVolumeSlider.addEventListener("input", (e) => {
    soundVolume = parseFloat(e.target.value);
    sClickWood.volume = soundVolume;
    sClickClicker.volume = soundVolume;
    sClickButton.volume = soundVolume;
    saveVolumeSettings();
  });
}

/* ---------------------------------------------- */
/* ОБРАБОТЧИКИ СОСТОЯНИЯ АВТОРИЗАЦИИ И ЗАГРУЗКА ДАННЫХ */
/* ---------------------------------------------- */
onAuthStateChanged(auth, (user) => {
  if(user){
    isGuest = false;
    userId = user.uid;
    userKey = buildUserKeyFromEmail(user.email);
    updateAuthUI(user);

    // загружаем данные игрока из Firebase
    get(ref(db, 'users/' + userKey)).then(snapshot=>{
      if(snapshot.exists()){
        const data = snapshot.val();

        coins = data.coins || 0;
        clickPower = data.clickPower || 1;
        boughtItems = data.items || {"1":0,"2":0};

        // загружаем громкости, если они есть
        if(data.volume){
          musicVolume = (data.volume.music !== undefined) ? Number(data.volume.music) : 0.8;
          soundVolume = (data.volume.sound !== undefined) ? Number(data.volume.sound) : 0.8;

          // если слайдеры есть — установим значения
          if(musicVolumeSlider) musicVolumeSlider.value = musicVolume;
          if(soundVolumeSlider) soundVolumeSlider.value = soundVolume;

          if(menuMusic) menuMusic.volume = musicVolume;
          sClickWood.volume = soundVolume;
          sClickClicker.volume = soundVolume;
          sClickButton.volume = soundVolume;
        }

        // обновляем UI
        counterValue.textContent = coins;
        if(document.getElementById("shopBalanceValue")) document.getElementById("shopBalanceValue").textContent = coins;
        if(document.getElementById("shopBalanceValueClicker")) document.getElementById("shopBalanceValueClicker").textContent = coins;
        if(document.getElementById("plateBalanceValue")) document.getElementById("plateBalanceValue").textContent = coins;

        startCounterAnimation(coins);
        startPlateAnimation(coins);
        renderShop();

        lastSavedCoins = coins;
      } else {
        // если записи нет, инициализируем её (можно оставить пустой — но не перезаписываем volume)
        // создадим начальную запись с текущими значениями
        set(ref(db, 'users/' + userKey), {
          coins: coins,
          clickPower: clickPower,
          items: boughtItems
        }).then(()=>{ lastSavedCoins = coins; }).catch(e=>console.error(e));
      }
    }).catch(err=>console.error(err));

  } else {
    // вышли в гостевой режим — обнуляем интерфейс
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

    // вернуть дефолтные громкости (не будем сохранять их)
    musicVolume = 0.8;
    soundVolume = 0.8;
    if(musicVolumeSlider) musicVolumeSlider.value = musicVolume;
    if(soundVolumeSlider) soundVolumeSlider.value = soundVolume;
    if(menuMusic) menuMusic.volume = musicVolume;
    sClickWood.volume = soundVolume;
    sClickClicker.volume = soundVolume;
    sClickButton.volume = soundVolume;

    startCounterAnimation(coins);
    startPlateAnimation(coins);
    renderShop();
  }
});

/* ---------------------------------------------- */
/* START */
/* ---------------------------------------------- */
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
