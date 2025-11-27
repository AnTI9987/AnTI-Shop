// main.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { shopItems, renderShop, updateButtonText } from './shop.js';

const firebaseConfig = { /* твоя конфигурация */ };
const appFB = initializeApp(firebaseConfig);
const db = getDatabase(appFB);
const auth = getAuth(appFB);
const provider = new GoogleAuthProvider();

export let coins = 0;
export let clickPower = 1;
let dataLoaded = false;
let lastSavedCoins = 0;
export let isGuest = true;

export let localUserId = localStorage.getItem("userId");
if(!localUserId){ localUserId="guest_"+Math.random().toString(36).substring(2,9); localStorage.setItem("userId",localUserId);}
export let userId = localUserId;

export const counterValue = document.getElementById("counterValue");
export const itemsBlock = document.getElementById("items");
export const loginOutBtn = document.getElementById("loginOutBtn");
export const shopBtnEl = document.getElementById("shopBtn");
export const backBtnEl = document.getElementById("backBtn");
export const settingsBtnEl = document.getElementById("settingsBtn");
export const loginBtnEl = document.getElementById("loginBtn");
export const panels = document.getElementById("panels");

export const splashScreen = document.getElementById("splashScreen");
export const progressBar = document.getElementById("progressBar");
export const progressPercent = document.getElementById("progressPercent");
let progress = 0;

export function updateProgress(increment){
  progress = Math.min(100, progress + increment);
  progressBar.style.width = progress + "%";
  progressPercent.textContent = progress + "%";
}

export function hideSplash(){
  splashScreen.style.opacity = 0;
  setTimeout(()=>splashScreen.style.display="none",800);
}

export async function loadData(){
  if(!isGuest){
    try{
      const snap = await get(ref(db,"players/"+userId));
      if(snap.exists()){
        const d = snap.val();
        coins = d.coins ?? 0;
        clickPower = d.clickPower ?? 1;
        lastSavedCoins = coins;
        if(d.shopItems) shopItems.forEach(item=>{
          if(d.shopItems[item.id]){
            item.cost = d.shopItems[item.id].cost ?? item.cost;
            if(item.stock !== undefined) item.stock = d.shopItems[item.id].stock ?? item.stock;
          }
        });
      }
    }catch(e){ console.error(e);}
  }
  dataLoaded = true;
  updateUI();
  renderShop(itemsBlock, coins, clickPower, dataLoaded, saveData, updateUI);
  updateProgress(40);
  hideSplash();
}

export function saveData(){
  if(!dataLoaded || isGuest) return;
  const shopState = {};
  shopItems.forEach(i => { shopState[i.id] = {cost:i.cost}; if(i.stock!==undefined)i.stock=i.stock; });
  set(ref(db,"players/"+userId),{coins, clickPower, shopItems:shopState});
  lastSavedCoins = coins;
}

export function updateUI(){
  counterValue.textContent = coins;
  document.querySelectorAll('.item button .price').forEach(p=>{
    const cost = parseInt(p.textContent);
    p.style.color = coins < cost ? "#ff3333" : "#fff";
  });
}

setInterval(()=>{ if(coins!==lastSavedCoins) saveData(); },5000);
