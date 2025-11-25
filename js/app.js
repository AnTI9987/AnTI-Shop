document.addEventListener('DOMContentLoaded', () => {
    const clicksDisplay = document.getElementById('clicks');
    let clicks = parseInt(localStorage.getItem('clicks')) || 0;

    clicksDisplay.textContent = clicks;

    const items = [
        {
            id: 1,
            name: "пуговица",
            price: 50,
            increment: 50,
            stock: Infinity,
            stockKey: null, // бесконечный товар, не сохраняем
            button: document.getElementById('buy-1'),
            stockDisplay: document.getElementById('stock-1'),
            img: 'img/item-1.png'
        },
        {
            id: 2,
            name: "шайба",
            price: 250,
            increment: 10,
            stock: 5,
            stockKey: "stock_item_2",
            button: document.getElementById('buy-2'),
            stockDisplay: document.getElementById('stock-2'),
            img: 'img/item-2.png'
        }
    ];

    // загрузка сохранённых остатков
    items.forEach(item => {
        if (item.stockKey) {
            const savedStock = localStorage.getItem(item.stockKey);
            if (savedStock !== null) {
                item.stock = parseInt(savedStock);
            }
        }
        updateItemDisplay(item);
    });

    // обработчики покупки
    items.forEach(item => {
        item.button.addEventListener('click', () => {
            if (clicks >= item.price && item.stock > 0) {
                clicks -= item.price;
                clicksDisplay.textContent = clicks;
                localStorage.setItem('clicks', clicks);

                clicks += item.increment;
                clicksDisplay.textContent = clicks;
                localStorage.setItem('clicks', clicks);

                if (item.stock !== Infinity) {
                    item.stock--;
                    localStorage.setItem(item.stockKey, item.stock);
                }

                updateItemDisplay(item);
            }
        });
    });

    function updateItemDisplay(item) {
        // если товар закончился
        if (item.stock <= 0) {
            item.button.textContent = "распродано";
            item.button.disabled = true;
            item.stockDisplay.textContent = "в наличии: 0";
            return;
        }

        // если есть в наличии
        item.button.textContent = `купить за ${item.price}`;
        item.button.disabled = false;
        item.stockDisplay.textContent = item.stock === Infinity
            ? "в наличии: ∞"
            : `в наличии: ${item.stock}`;
    }
});
