// js/main.js
console.log("%c🚀 main.js загружен", "color: orange; font-size: 16px");

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded сработал");

    const btn = document.getElementById('clickerOpenBtn');
    
    if (btn) {
        console.log("✅ Кнопка найдена в DOM");

        btn.style.border = "3px solid lime"; // яркая обводка если найдена

        btn.addEventListener('click', () => {
            console.log("%c✅ КНОПКА НАЖАТА!", "color: lime; font-size: 18px; font-weight: bold");
            alert("Кнопка работает! ✅\n\nСейчас должно появиться окно входа.");
            
            document.getElementById('loginModal').classList.remove('hidden');
        });
    } else {
        console.error("❌ Кнопка НЕ найдена!");
    }
});
