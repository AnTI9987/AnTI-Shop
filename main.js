// js/main.js
console.log("%c🚀 AnTI Shop запущен", "color: lime; font-size: 16px");

document.addEventListener('DOMContentLoaded', () => {
    console.log("✅ DOM загружен");

    const clickerBtn = document.getElementById('clickerOpenBtn');

    if (clickerBtn) {
        clickerBtn.style.border = "2px solid lime";   // убираем позже

        clickerBtn.addEventListener('click', () => {
            console.log("Кнопка нажата");
            document.getElementById('loginModal').classList.remove('hidden');
        });
    }

    // Закрытие модального окна
    document.getElementById('closeModalBtn').addEventListener('click', () => {
        document.getElementById('loginModal').classList.add('hidden');
    });

    console.log("🎯 Обработчики событий установлены");
});
