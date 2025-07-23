// Firebase App ve Database modüllerini içe aktar
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// Firebase config
import { firebaseConfig } from './firebase-config.js';


// Uygulamayı başlat
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Kalp gönderme işlevi
const sendHeart = document.getElementById("sendHeart");
const usernameInput = document.getElementById("username");

sendHeart.addEventListener("click", () => {
  const user = usernameInput.value.trim().toLowerCase();

  if (user !== "beyza" && user !== "onat") {
    showMessage("Lütfen 'beyza' ya da 'onat' olarak giriş yapın.");
    return;
  }

  const userRef = ref(db, "hearts/" + user);
  runTransaction(userRef, current => {
    return (current || 0) + 1;
  });

  createFallingHeart();
});

// Kalp sayılarını canlı olarak dinle
const beyzaRef = ref(db, "hearts/beyza");
const onatRef = ref(db, "hearts/onat");

onValue(beyzaRef, snapshot => {
  document.getElementById("beyzaCount").innerText = snapshot.val() || 0;
});
onValue(onatRef, snapshot => {
  document.getElementById("onatCount").innerText = snapshot.val() || 0;
});

// Kalp animasyonu
function createFallingHeart() {
  const heart = document.createElement("div");
  heart.textContent = "❤️";
  heart.style.position = "absolute";
  heart.style.left = Math.random() * 100 + "vw";
  heart.style.top = "-30px";
  heart.style.fontSize = "24px";
  heart.style.animation = "fall 3s linear forwards";
  document.querySelector(".hearts-container").appendChild(heart);

  setTimeout(() => heart.remove(), 3000);
}

// Uyarı mesajı
function showMessage(msg) {
  const bar = document.getElementById("messageBar");
  bar.textContent = msg;
  bar.style.background = "#ffd6d6";
  bar.style.padding = "10px";
  bar.style.textAlign = "center";
  bar.style.color = "#b30000";
  setTimeout(() => {
    bar.textContent = "";
    bar.style = "";
  }, 3000);
}

// Animasyon stili
const style = document.createElement("style");
style.innerHTML = `
@keyframes fall {
  to {
    transform: translateY(100vh);
    opacity: 0;
  }
}
`;
document.head.appendChild(style);

function setFullHeight() {
  document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
}
window.addEventListener('resize', setFullHeight);
window.addEventListener('load', setFullHeight);
setFullHeight();
