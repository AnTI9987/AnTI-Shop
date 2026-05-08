// js/main.js — СТАБИЛЬНАЯ ВЕРСИЯ

console.log("%c🚀 AnTI Shop запущен (обычный скрипт)", "color: lime; font-size: 16px");

document.addEventListener('DOMContentLoaded', () => {
    console.log("✅ DOM полностью загружен");

    const clickerBtn = document.getElementById('clickerOpenBtn');

    if (clickerBtn) {
        console.log("✅ Кнопка кликера найдена");

        // Яркая обводка для проверки
        clickerBtn.style.border = "3px solid lime";
        clickerBtn.style.background = "rgba(0, 255, 0, 0.1)";

        clickerBtn.addEventListener('click', () => {
            console.log("%c🔥 Кнопка нажата успешно!", "color: lime; font-size: 18px");
            document.getElementById('loginModal').classList.remove('hidden');
        });
    } else {
        console.error("❌ Кнопка #clickerOpenBtn не найдена");
    }

    // Закрытие модального окна
    const closeModalBtn = document.getElementById('closeModalBtn');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            document.getElementById('loginModal').classList.add('hidden');
        });
    }
});
