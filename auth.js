// js/auth.js
import { auth, provider, signInWithPopup, signOut, onAuthStateChanged, ref, set, get, db } from './firebase.js';

let currentUser = null;
let isGuest = true;

export function initAuth() {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                currentUser = user;
                isGuest = false;
                console.log("✅ Авторизован:", user.email);
            } else {
                currentUser = null;
                isGuest = true;
                console.log("👤 Гостевой режим");
            }
            resolve();
        });
    });
}

export function getCurrentUser() {
    return currentUser;
}

export function isUserGuest() {
    return isGuest;
}

// Вход через Google
export async function loginWithGoogle() {
    try {
        const result = await signInWithPopup(auth, provider);
        return result.user;
    } catch (error) {
        console.error("Ошибка входа через Google:", error);
        return null;
    }
}

// Выход
export async function logout() {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Ошибка выхода:", error);
    }
}

// Сохранение данных игрока
export async function savePlayerData(userId, data) {
    if (!userId) return false;
    
    try {
        await set(ref(db, 'users/' + userId), {
            coins: data.coins || 0,
            clickPower: data.clickPower || 1,
            boughtItems: data.boughtItems || {},
            lastUpdated: Date.now()
        });
        return true;
    } catch (e) {
        console.error("Ошибка сохранения данных:", e);
        return false;
    }
}

// Загрузка данных игрока
export async function loadPlayerData(userId) {
    if (!userId) return null;
    
    try {
        const snapshot = await get(ref(db, 'users/' + userId));
        if (snapshot.exists()) {
            return snapshot.val();
        }
        return null;
    } catch (e) {
        console.error("Ошибка загрузки данных:", e);
        return null;
    }
}
