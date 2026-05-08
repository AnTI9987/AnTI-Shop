// js/main.js
console.log("%c🚀 main.js загружен", "color: orange; font-size: 16px");

document.addEventListener('DOMContentLoaded', () => {
    console.log("✅ DOMContentLoaded");

    const btn = document.getElementById('clickerOpenBtn');
    
    if (btn) {
        console.log("✅ Кнопка найдена");

        // Убираем все предыдущие обработчики и добавляем новый
        btn.replaceWith(btn.cloneNode(true));
        const newBtn = document.getElementById('clickerOpenBtn');

        newBtn.addEventListener('click', (e) => {
            console.log("%c✅ КЛИК ПО КНОПКЕ ЗАРЕГИСТРИРОВАН!", "color: lime; font-size: 18px; font-weight: bold");
            e.stopImmediatePropagation();
            
            alert("Кнопка работает!\n\nСейчас должно открыться окно входа.");
            document.getElementById('loginModal').classList.remove('hidden');
        });

        console.log("Обработчик повешен");
    }
});
