// js/main.js
import { initAuth, loginWithGoogle, isUserGuest, getCurrentUser } from './auth.js';
import { initClicker } from './clicker.js';
import { initShop } from './shop.js';

let currentCoins = 1240;

async function initApp() {
    console.log("%c🚀 Запуск AnTI Shop...", "color: orange; font-size: 16px");

    await initAuth();

    initClicker();
    initShop();

    document.getElementById('headerBalanceValue').textContent = currentCoins;

    setupEventListeners();
}

function setupEventListeners() {
    const clickerBtn = document.getElementById('clickerOpenBtn');
    
    console.log("Кнопка найдена:", !!clickerBtn);

    if (clickerBtn) {
        // Убираем все старые обработчики
        clickerBtn.replaceWith(clickerBtn.cloneNode(true));
        const newBtn = document.getElementById('clickerOpenBtn');

        newBtn.style.border = "2px solid red"; // временная отладочная обводка

        newBtn.addEventListener('click', (e) => {
            console.log("%c✅ Кнопка нажата!", "color: lime; font-size: 15px");
            e.stopImmediatePropagation();

            const user = getCurrentUser();
            
            if (isUserGuest() || !user) {
                console.log("Показываем модальное окно входа");
                document.getElementById('loginModal').classList.remove('hidden');
            } else {
                console.log("Открываем кликер");
                const overlay = document.getElementById('clickerOverlay');
                overlay.classList.remove('hidden');
                overlay.style.transform = 'translateY(0)';
            }
        });

        console.log("Обработчик клика успешно повешен");
    } else {
        console.error("❌ Кнопка #clickerOpenBtn не найдена в DOM!");
    }

    // Модальное окно
    document.getElementById('googleLoginBtn').addEventListener('click', async () => {
        console.log("Нажата кнопка Google");
        const user = await loginWithGoogle();
        if (user) document.getElementById('loginModal').classList.add('hidden');
    });

    document.getElementById('closeModalBtn').addEventListener('click', () => {
        document.getElementById('loginModal').classList.add('hidden');
    });
}

document.addEventListener('DOMContentLoaded', initApp);
