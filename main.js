// js/main.js
import { initAuth, loginWithGoogle, isUserGuest, getCurrentUser } from './auth.js';
import { initClicker } from './clicker.js';
import { initShop } from './shop.js';

let currentCoins = 1240;

async function initApp() {
    console.log("🚀 Запуск приложения...");

    await initAuth();

    initClicker();
    initShop();

    // Обновляем баланс в шапке
    document.getElementById('headerBalanceValue').textContent = currentCoins;

    setupEventListeners();

    console.log("✅ AnTI Shop успешно запущен");
}

function setupEventListeners() {
    const clickerBtn = document.getElementById('clickerOpenBtn');
    
    if (!clickerBtn) {
        console.error("Кнопка #clickerOpenBtn не найдена!");
        return;
    }

    // Главная кнопка открытия кликера
    clickerBtn.addEventListener('click', () => {
        console.log("Клик по кнопке кликера");
        
        const user = getCurrentUser();
        
        if (isUserGuest() || !user) {
            // Показываем модальное окно входа
            document.getElementById('loginModal').classList.remove('hidden');
        } else {
            // Показываем кликер
            const overlay = document.getElementById('clickerOverlay');
            overlay.classList.remove('hidden');
            // Принудительно сбрасываем позицию
            overlay.style.transform = 'translateY(0)';
        }
    });

    // Закрытие кликера
    document.getElementById('closeClickerBtn').addEventListener('click', () => {
        const overlay = document.getElementById('clickerOverlay');
        overlay.style.transform = 'translateY(-100%)';
        setTimeout(() => {
            overlay.classList.add('hidden');
        }, 600);
    });

    // Кнопки в модальном окне
    document.getElementById('googleLoginBtn').addEventListener('click', async () => {
        console.log("Попытка входа через Google...");
        const user = await loginWithGoogle();
        if (user) {
            document.getElementById('loginModal').classList.add('hidden');
            alert("✅ Вход выполнен! Теперь можешь открыть кликер.");
        }
    });

    document.getElementById('closeModalBtn').addEventListener('click', () => {
        document.getElementById('loginModal').classList.add('hidden');
    });
}

// Запуск
document.addEventListener('DOMContentLoaded', initApp);
