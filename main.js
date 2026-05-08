// js/main.js
console.log("%c🚀 AnTI Shop main.js загружен успешно", "color: lime; font-size: 16px");

document.addEventListener('DOMContentLoaded', () => {
    console.log("✅ DOM готов");

    const clickerBtn = document.getElementById('clickerOpenBtn');

    if (clickerBtn) {
        clickerBtn.style.border = "2px solid #00ff00"; // временная зелёная обводка

        clickerBtn.addEventListener('click', () => {
            console.log("%cКнопка кликера нажата", "color: lime");
            document.getElementById('loginModal').classList.remove('hidden');
        });
    }

    // Закрытие модального окна
    document.getElementById('closeModalBtn').addEventListener('click', () => {
        document.getElementById('loginModal').classList.add('hidden');
    });

    console.log("🎉 Приложение инициализировано");
});
