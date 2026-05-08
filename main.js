// js/main.js — ТЕСТОВАЯ ВЕРСИЯ БЕЗ ИМПОРТОВ

document.addEventListener('DOMContentLoaded', () => {
    console.log("%c🚀 Тестовая версия main.js загружена", "color: orange; font-size: 18px");

    const btn = document.getElementById('clickerOpenBtn');

    if (btn) {
        console.log("%c✅ Кнопка найдена в DOM", "color: lime");

        // Яркая обводка для видимости
        btn.style.border = "4px solid lime";
        btn.style.background = "rgba(0, 255, 0, 0.1)";

        btn.addEventListener('click', function(e) {
            console.log("%c🔥 КНОПКА НАЖАТА!", "color: red; font-size: 20px; font-weight: bold");
            alert("✅ Кнопка работает!\n\nМодальное окно должно открыться.");
            
            document.getElementById('loginModal').classList.remove('hidden');
        });

        console.log("Обработчик клика добавлен");
    } else {
        console.error("❌ Кнопка НЕ найдена");
    }
});
