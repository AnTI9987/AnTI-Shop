// js/main.js
import { initAuth, loginWithGoogle, isUserGuest, getCurrentUser } from './auth.js';
import { initClicker } from './clicker.js';
import { initShop } from './shop.js';

let currentCoins = 482;

async function initApp() {
    await initAuth();

    initClicker();
    initShop();

    // Обновляем баланс в шапке
    document.getElementById('headerBalanceValue').textContent = currentCoins;

    setupEventListeners();

    console.log("✅ AnTI Shop запущен в упрощённом режиме");
}

function setupEventListeners() {
    // Кнопка открытия кликера
    document.getElementById('clickerOpenBtn').addEventListener('click', () => {
        const user = getCurrentUser();
        if (isUserGuest() || !user) {
            document.getElementById('loginModal').classList.remove('hidden');
        } else {
            document.getElementById('clickerOverlay').classList.remove('hidden');
            document.getElementById('clickerOverlay').style.transform = 'translateY(0)';
        }
    });

    // Закрытие кликера
    document.getElementById('closeClickerBtn').addEventListener('click', () => {
        const overlay = document.getElementById('clickerOverlay');
        overlay.style.transform = 'translateY(-100%)';
        setTimeout(() => overlay.classList.add('hidden'), 600);
    });

    // Google Login
    document.getElementById('googleLoginBtn').addEventListener('click', async () => {
        await loginWithGoogle();
        document.getElementById('loginModal').classList.add('hidden');
    });

    document.getElementById('closeModalBtn').addEventListener('click', () => {
        document.getElementById('loginModal').classList.add('hidden');
    });
}

// Запуск
document.addEventListener('DOMContentLoaded', initApp);
