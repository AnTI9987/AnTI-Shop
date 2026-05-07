// js/main.js
import { initAuth, loginWithGoogle, isUserGuest, getCurrentUser, savePlayerData, loadPlayerData } from './auth.js';
import { initClicker, getCoins, addCoins, setPlayerData, getPlayerDataForSave, updateClickerBalance } from './clicker.js';
import { initShop, updateShopPrices } from './shop.js';

// ==================== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ====================
let currentCoins = 0;
let autoSaveInterval = null;

// ==================== DOM ЭЛЕМЕНТЫ ====================
const headerBalanceValue = document.getElementById('headerBalanceValue');
const clickerOverlay = document.getElementById('clickerOverlay');
const loginModal = document.getElementById('loginModal');

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
async function initApp() {
    await initAuth();
    
    // Загружаем данные если пользователь авторизован
    const user = getCurrentUser();
    if (user) {
        const savedData = await loadPlayerData(user.email.replace(/\./g, '_'));
        if (savedData) {
            setPlayerData(savedData);
            currentCoins = savedData.coins || 0;
        }
    }

    initClicker();
    initShop();
    
    updateAllBalances();
    setupEventListeners();
    
    // Автосохранение каждые 8 секунд
    autoSaveInterval = setInterval(autoSave, 8000);
    
    console.log("🚀 AnTI Shop запущен!");
}

// ==================== ОБНОВЛЕНИЕ БАЛАНСОВ ====================
function updateAllBalances() {
    currentCoins = getCoins();
    
    // Обновляем в хедере
    headerBalanceValue.textContent = Math.floor(currentCoins);
    
    // Обновляем цены в магазине
    updateShopPrices(currentCoins);
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {

    // Открытие кликера
    document.getElementById('clickerOpenBtn').addEventListener('click', openClicker);

    // Закрытие кликера
    document.getElementById('closeClickerBtn').addEventListener('click', closeClicker);

    // Модальное окно входа
    document.getElementById('googleLoginBtn').addEventListener('click', handleGoogleLogin);
    document.getElementById('closeModalBtn').addEventListener('click', () => {
        loginModal.classList.add('hidden');
    });

    // Глобальная покупка (вызывается из shop.js)
    window.attemptPurchase = attemptPurchase;
}

// ==================== КЛИКЕР ====================
function openClicker() {
    const user = getCurrentUser();
    
    if (isUserGuest() || !user) {
        loginModal.classList.remove('hidden');
        return;
    }

    // Показываем кликер с анимацией сверху вниз
    clickerOverlay.classList.remove('hidden');
    clickerOverlay.style.transform = 'translateY(-100%)';
    
    // Запускаем анимацию появления
    setTimeout(() => {
        clickerOverlay.style.transition = 'transform 0.65s cubic-bezier(0.25, 0.1, 0.2, 1)';
        clickerOverlay.style.transform = 'translateY(0)';
    }, 10);
}

function closeClicker() {
    clickerOverlay.style.transition = 'transform 0.55s cubic-bezier(0.4, 0.0, 0.2, 1)';
    clickerOverlay.style.transform = 'translateY(-100%)';
    
    setTimeout(() => {
        clickerOverlay.classList.add('hidden');
        updateAllBalances(); // синхронизируем баланс после закрытия
    }, 600);
}

// ==================== ПОКУПКА ====================
function attemptPurchase(item) {
    const user = getCurrentUser();
    if (isUserGuest() || !user) {
        loginModal.classList.remove('hidden');
        return;
    }

    if (currentCoins < item.cost) {
        alert("Недостаточно Анти-коинов!");
        return;
    }

    // Совершаем покупку
    currentCoins -= item.cost;
    addCoins(0); // обновляем внутреннее состояние

    alert(`✅ Куплено: \( {item.name}\n+ \){item.power} к силе клика!`);
    
    updateAllBalances();
    saveCurrentProgress();
}

// ==================== АВТОСОХРАНЕНИЕ ====================
async function saveCurrentProgress() {
    const user = getCurrentUser();
    if (!user) return;

    const userId = user.email.replace(/\./g, '_');
    const data = getPlayerDataForSave();
    
    await savePlayerData(userId, data);
}

async function autoSave() {
    await saveCurrentProgress();
}

// ==================== ЗАПУСК ====================
document.addEventListener('DOMContentLoaded', initApp);
