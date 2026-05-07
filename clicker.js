// js/clicker.js
let coins = 0;
let clickPower = 1;
let boughtItems = {};

let clickerBalanceEl, clickImg, clickButton;

export function initClicker() {
    clickerBalanceEl = document.getElementById('clickerBalanceValue');
    clickImg = document.getElementById('clickImg');
    clickButton = document.getElementById('clickButton');

    // Клик мышью
    clickButton.addEventListener('click', (e) => {
        handleClick(e.clientX, e.clientY);
        animateClick();
    });

    // Клик тачем (мобильные)
    clickButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        for (let touch of e.changedTouches) {
            handleClick(touch.clientX, touch.clientY);
        }
        animateClick();
    }, { passive: false });
}

function handleClick(x, y) {
    coins += clickPower;
    
    updateClickerBalance();
    createFloatingCoin(x, y, clickPower);
    
    // Можно добавить звук здесь позже
}

function animateClick() {
    clickImg.style.transform = 'scale(0.85)';
    setTimeout(() => {
        clickImg.style.transform = 'scale(1)';
    }, 80);
}

function createFloatingCoin(x, y, value) {
    const coin = document.createElement('div');
    coin.className = 'floating-coin';
    coin.style.left = `${x - 20}px`;
    coin.style.top = `${y - 20}px`;
    coin.innerHTML = `+${value} <img src="img/anti-coin.png" alt="">`;
    
    document.getElementById('clickerOverlay').appendChild(coin);

    setTimeout(() => {
        coin.style.transform = 'translateY(-120px)';
        coin.style.opacity = '0';
    }, 10);

    setTimeout(() => coin.remove(), 800);
}

export function updateClickerBalance() {
    if (clickerBalanceEl) {
        clickerBalanceEl.textContent = Math.floor(coins);
    }
}

export function getCoins() {
    return coins;
}

export function getClickPower() {
    return clickPower;
}

export function addCoins(amount) {
    coins += amount;
    updateClickerBalance();
}

export function setPlayerData(data) {
    if (data) {
        coins = data.coins || 0;
        clickPower = data.clickPower || 1;
        boughtItems = data.boughtItems || {};
        updateClickerBalance();
    }
}

export function getPlayerDataForSave() {
    return {
        coins: Math.floor(coins),
        clickPower: clickPower,
        boughtItems: boughtItems
    };
}
