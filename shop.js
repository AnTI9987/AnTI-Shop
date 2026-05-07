// js/shop.js
let shopItems = [];

const baseItems = [
    {
        id: 1,
        name: "Оторванная пуговица",
        description: "Кажется, раньше это служило подобием глаза для плюшевой игрушки.",
        cost: 50,
        power: 1,
        img: "img/item-1.png"
    },
    {
        id: 2,
        name: "Страшная штука",
        description: "Оно пугает. Реально пугает.",
        cost: 250,
        power: 5,
        img: "img/item-2.png",
        limited: true
    }
];

export function initShop() {
    shopItems = baseItems.map(item => ({ ...item }));
    renderShop();
}

function renderShop() {
    const container = document.getElementById('itemsContainer');
    const emptyState = document.getElementById('emptyState');
    
    container.innerHTML = '';

    if (shopItems.length === 0) {
        emptyState.style.display = 'block';
        return;
    } else {
        emptyState.style.display = 'none';
    }

    shopItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'shop-item';
        card.innerHTML = `
            <div class="item-image">
                <img src="\( {item.img}" alt=" \){item.name}">
            </div>
            <div class="item-info">
                <h3>${item.name}</h3>
                <p class="item-desc">${item.description}</p>
                <div class="item-power">+${item.power} к клику</div>
                <button class="buy-btn" data-id="${item.id}">
                    <span class="price">${item.cost}</span>
                    <img src="img/anti-coin.png" alt="Анти-коин">
                </button>
            </div>
        `;

        container.appendChild(card);
    });

    // Добавляем обработчики покупки
    document.querySelectorAll('.buy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            purchaseItem(id);
        });
    });
}

function purchaseItem(id) {
    const item = shopItems.find(i => i.id === id);
    if (!item) return;

    // Проверка баланса будет в main.js (через глобальное состояние)
    window.attemptPurchase(item);
}

export function updateShopPrices(coins) {
    document.querySelectorAll('.buy-btn').forEach(btn => {
        const priceEl = btn.querySelector('.price');
        if (!priceEl) return;
        
        const cost = parseInt(priceEl.textContent);
        if (coins < cost) {
            btn.style.opacity = '0.6';
            btn.style.cursor = 'not-allowed';
        } else {
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        }
    });
}

export { baseItems };
