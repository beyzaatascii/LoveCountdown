// Firebase modülleri
import { database } from "./firebase-config.js";
import {
  ref,
  onValue,
  runTransaction
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Kullanıcı kontrolü
const username = localStorage.getItem("username");
const displayName = localStorage.getItem("displayName");

if (!username || !displayName) {
  window.location.href = "login.html"; // Giriş yapılmamışsa yönlendir
}

// Hoş geldin mesajı (eğer varsa ekrana yaz)
const welcomeEl = document.getElementById("welcomeMsg");
if (welcomeEl) {
  welcomeEl.textContent = `Hoş geldin ${displayName} 💖 Kalp gönder bakalım!`;
}

// HTML elementleri
const sendHeart = document.getElementById("sendHeart");
const beyzaCount = document.getElementById("beyzaCount");
const onatCount = document.getElementById("onatCount");
const messageBar = document.getElementById("messageBar");
const heartsContainer = document.querySelector(".hearts-container");

// Kalp gönderme işlemi
sendHeart.addEventListener("click", () => {
  const user = username.toLowerCase();

  if (user !== "beyza" && user !== "onat") {
    showMessage("Kullanıcı adı geçersiz.");
    return;
  }

  const userRef = ref(database, "hearts/" + user);
  runTransaction(userRef, current => (current || 0) + 1);
  createFallingHeart();
});

// Kalp sayısını canlı olarak dinle
onValue(ref(database, "hearts/beyza"), snapshot => {
  beyzaCount.innerText = snapshot.val() || 0;
});

onValue(ref(database, "hearts/onat"), snapshot => {
  onatCount.innerText = snapshot.val() || 0;
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
  heartsContainer.appendChild(heart);

  setTimeout(() => heart.remove(), 3000);
}

// Uyarı mesajı
function showMessage(msg) {
  messageBar.textContent = msg;
  messageBar.style.background = "#ffd6d6";
  messageBar.style.padding = "10px";
  messageBar.style.textAlign = "center";
  messageBar.style.color = "#b30000";
  setTimeout(() => {
    messageBar.textContent = "";
    messageBar.style = "";
  }, 3000);
}

// Mobil uyum için yüksekliği ayarla
function setFullHeight() {
  document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
}
window.addEventListener('resize', setFullHeight);
window.addEventListener('load', setFullHeight);
setFullHeight();

// Kalp düşme animasyonu stili
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
