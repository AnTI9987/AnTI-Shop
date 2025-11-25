let clicks = Number(localStorage.getItem("clicks")) || 0;
let clickPower = Number(localStorage.getItem("clickPower")) || 1;

let price1 = Number(localStorage.getItem("price1")) || 50;
let price2 = 250;

let stock2 = Number(localStorage.getItem("stock2"));
if (stock2 === null) stock2 = 5;

document.getElementById("clicks").textContent = clicks;
document.getElementById("price1").textContent = price1;
document.getElementById("price2").textContent = price2;
document.getElementById("stock2").textContent = "В наличии: " + stock2;

function save() {
    localStorage.setItem("clicks", clicks);
    localStorage.setItem("clickPower", clickPower);
    localStorage.setItem("price1", price1);
    localStorage.setItem("stock2", stock2);
}

document.getElementById("click-btn").onclick = () => {
    clicks += clickPower;
    document.getElementById("clicks").textContent = clicks;
    save();
};

function updateButtons() {
    let b1 = document.getElementById("buy1");
    if (clicks >= price1) b1.className = "btn-yes";
    else b1.className = "btn-no";

    let b2 = document.getElementById("buy2");
    if (stock2 <= 0) {
        b2.textContent = "распродано";
        b2.className = "btn-no";
        b2.disabled = true;
    } else if (clicks >= price2) {
        b2.className = "btn-yes";
    } else {
        b2.className = "btn-no";
    }
}

updateButtons();

document.getElementById("buy1").onclick = () => {
    if (clicks >= price1) {
        clicks -= price1;
        clickPower += 1;
        price1 = Math.floor(price1 * 1.5);

        document.getElementById("clicks").textContent = clicks;
        document.getElementById("price1").textContent = price1;

        save();
        updateButtons();
    }
};

document.getElementById("buy2").onclick = () => {
    if (stock2 <= 0) return;

    if (clicks >= price2) {
        clicks -= price2;
        clickPower += 10;
        stock2 -= 1;

        document.getElementById("clicks").textContent = clicks;
        document.getElementById("stock2").textContent = "В наличии: " + stock2;

        save();
        updateButtons();
    }
};
