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
/* АНИМАЦИЯ ПЛАШКИ */
/* ---------------------------------------------- */
function animatePlateCoins(newValue){
    const el = document.getElementById("plateBalanceValue");
    let startVal = Number(el.textContent) || 0;
    const diff = newValue - startVal;
    const duration = 500;
    const startTime = performance.now();
    if(plateAnimFrame) cancelAnimationFrame(plateAnimFrame);
    function frame(now){
        let t = Math.min((now-startTime)/duration,1);
        let eased = 1 - Math.pow(1-t,3);
        el.textContent = Math.floor(startVal + diff*eased);
        if(t<1) plateAnimFrame = requestAnimationFrame(frame);
        else el.textContent = newValue;
    }
    plateAnimFrame = requestAnimationFrame(frame);
}

/* ---------------------------------------------- */
/* ТОВАРЫ */
/* ---------------------------------------------- */
const baseShopItems = [
  {id:1,name:'Оторванная пуговица',baseCost:50,description:'Кажеться, раньше это служило подобием глаза для плюшевой игрушки.',property:'Прибавляет +1 к прибыли за клик',incrementCost:50,img:'img/item-1.png'},
  {id:2,name:'Страшная штука',baseCost:250,description:'Оно пугает.',property:'Прибавляет +10 к прибыли за клик',power:10,stock:5,img:'img/item-2.png'}
];
let shopItems = baseShopItems.map(item => ({...item}));
let boughtItems = { "1":0, "2":0 };

/* ---------------------------------------------- */
/* АНИМАЦИЯ СЧЁТЧИКА */
/* ---------------------------------------------- */
let animFrame = null;
function animateCounter(oldVal,newVal){
  oldVal = Number(oldVal)||0;
  newVal = Number(newVal)||0;
  if(newVal-oldVal===1){ counterValue.textContent = newVal; return; }
  if(animFrame) cancelAnimationFrame(animFrame);
  let start = performance.now();
  function frame(ts){
    let p = Math.min((ts-start)/100,1);
    document.getElementById("shopBalanceValue").textContent = Math.floor(oldVal + (newVal-oldVal)*p);
    document.getElementById("shopBalanceValueClicker").textContent = Math.floor(oldVal + (newVal-oldVal)*p);
    counterValue.textContent = Math.floor(oldVal + (newVal-oldVal)*p);
    if(p<1) animFrame=requestAnimationFrame(frame);
    else {
      document.getElementById("shopBalanceValue").textContent = newVal;
      document.getElementById("shopBalanceValueClicker").textContent = newVal;
      counterValue.textContent = newVal;
    }
  }
  animFrame = requestAnimationFrame(frame);
}

/* ---------------------------------------------- */
/* КЛИКЕР */
/* ---------------------------------------------- */
function spawnFloatingCoin(x,y,value){
  const el = document.createElement("div");
  el.className="floating-coin";
  el.style.left = (x-12) + "px";
  el.style.top = (y-12) + "px";
  el.style.position = "absolute";
  el.style.pointerEvents = "none";
  el.style.zIndex = 9999;
  el.innerHTML = `<b style="font-size:18px;color:#ffd700">+${value}</b><img src="img/anti-coin.png" style="width:18px;height:18px;">`;
  document.body.appendChild(el);
  setTimeout(()=>{ el.style.transform="translateY(-80px)"; el.style.opacity="0"; el.style.transition="all 0.7s ease-out"; },10);
  setTimeout(()=>el.remove(),700);
}

function clickAction(x,y){
  coins += clickPower;
  animateCounter(coins-clickPower, coins);
  animatePlateCoins(coins);
  spawnFloatingCoin(x,y,clickPower);
  updatePricesColor();
}

function animateClicker(){
  clickImg.style.transform = "scale(0.93)";
  clickImg.src = "img/click2.png";
  setTimeout(()=>{
    clickImg.style.transform = "scale(1)";
    clickImg.src = "img/click1.png";
  },100);
}

clickButton.addEventListener("click", e=>{
  const rect = clickButton.getBoundingClientRect();
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
/* ---------------------------------------------- */
const itemsBlock = document.getElementById("items");
function updateShopItems(){
  shopItems = baseShopItems.map(item=>{
    const bought = boughtItems[item.id]||0;
    const newItem = {...item};
    if(item.id===1) newItem.cost = Math.floor(item.baseCost*Math.pow(1.2,bought));
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
      animateCounter(coins+item.cost, coins);
      animatePlateCoins(coins);
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
loginBtnEl.style.fontWeight="600";
loginBtnEl.onclick=async()=>{ try{ await signInWithPopup(auth, provider); }catch(e){console.error(e);} };
loginOutBtn.style.fontFamily="'Montserrat', sans-serif";
loginOutBtn.style.fontWeight="600";
loginOutBtn.onclick=async()=>{
  if(isGuest){ await signInWithPopup(auth,provider); return; }
  await signOut(auth);
  alert("Вы вышли из аккаунта");
  isGuest=true; userId=localUserId; coins=0; clickPower=1;
  boughtItems={ "1":0,"2":0 };
  renderShop(); animateCounter(0,0); animatePlateCoins(0);
};

onAuthStateChanged(auth,async user=>{
  if(user){
    isGuest=false;
    userId=user.email.replaceAll(".","_");
    loginOutBtn.textContent="Выйти из аккаунта";
    loginBtnEl.style.display="none";
    const snap = await get(ref(db,'users/'+userId));
    if(snap.exists()){
      const data=snap.val();
      coins=data.coins||0;
      clickPower=data.clickPower||1;
      boughtItems=data.items||{ "1":0,"2":0 };
    }
    renderShop(); animateCounter(0,coins); animatePlateCoins(coins);
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

document.addEventListener("visibilitychange",()=>{ if(!document.hidden){ clickImg.style.display="block"; animatePlateCoins(coins); animateCounter(parseInt(counterValue.textContent)||0, coins); } });

/* ---------------------------------------------- */
/* СТАРТ */
fakeLoad(()=>{
  panels.style.transform="translateX(-392px)";
  renderShop();
  document.getElementById("topPlate").style.display="block";
  animateCounter(0,coins);
  animatePlateCoins(coins);
});
