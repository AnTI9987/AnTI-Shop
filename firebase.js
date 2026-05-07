// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getDatabase, ref, set, get, onValue } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

// ==================== FIREBASE CONFIG ====================
const firebaseConfig = {
    apiKey: "AIzaSyAcv5AfJPjUA-RGfcAsUiQwvucSxkJX4F0",
    authDomain: "anti-shop-99f1d.firebaseapp.com",
    databaseURL: "https://anti-shop-99f1d-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "anti-shop-99f1d",
    storageBucket: "anti-shop-99f1d.firebasestorage.app",
    messagingSenderId: "347202416802",
    appId: "1:347202416802:web:2d2df1b819be9da180e7fb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export {
    db,
    auth,
    provider,
    ref,
    set,
    get,
    onValue,
    onAuthStateChanged,
    signInWithPopup,
    signOut
};
