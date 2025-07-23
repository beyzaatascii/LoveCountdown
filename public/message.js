// Firebase modülleri
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Firebase Config
import { firebaseConfig } from './firebase-config.js';


// Uygulamayı başlat
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const messagesRef = ref(db, "messages");

// Gönder butonu tıklanınca mesajı Firebase'e kaydet
document.getElementById("sendBtn").addEventListener("click", () => {
  const username = document.getElementById("username").value.trim();
  const message = document.getElementById("messageInput").value.trim();

  if (!username || !message) return;

  push(messagesRef, {
    sender: username,
    text: message,
    timestamp: Date.now()
  });

  document.getElementById("messageInput").value = "";
});

// Yardımcı: Saat formatla
function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

// Yardımcı: Tarih formatla (Bugün / Dün / Tarih)
function formatDate(timestamp) {
  const now = new Date();
  const date = new Date(timestamp);

  const isToday = now.toDateString() === date.toDateString();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = yesterday.toDateString() === date.toDateString();

  if (isToday) return "Bugün";
  if (isYesterday) return "Dün";

  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

// Son tarih ayraç kontrolü için
let lastMessageDate = "";

// Yeni mesaj geldiğinde ekrana yazdır
onChildAdded(messagesRef, snapshot => {
  const msg = snapshot.val();
  const messagesDiv = document.getElementById("messages");

  const currentDate = formatDate(msg.timestamp);
  if (currentDate !== lastMessageDate) {
    lastMessageDate = currentDate;

    const separator = document.createElement("div");
    separator.classList.add("date-separator");
    separator.innerText = currentDate;
    messagesDiv.appendChild(separator);
  }

  const msgBox = document.createElement("div");
  msgBox.classList.add("message");

  if (msg.sender.toLowerCase() === "beyza") {
    msgBox.classList.add("beyza");
  } else {
    msgBox.classList.add("onat");
  }

  const time = formatTime(msg.timestamp);

  msgBox.innerHTML = `
    <div class="text">${msg.text}</div>
    <div class="timestamp">${time}</div>
  `;

  messagesDiv.appendChild(msgBox);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// Tam ekran uyumu için
function setFullHeight() {
  document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
}
window.addEventListener('resize', setFullHeight);
setFullHeight();
