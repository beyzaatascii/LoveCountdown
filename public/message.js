// Firebase modülleri
import { database } from "./firebase-config.js";
import {
  ref,
  push,
  onChildAdded
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Kullanıcı bilgilerini al
const username = localStorage.getItem("username");
const displayName = localStorage.getItem("displayName");

if (!username || !displayName) {
  window.location.href = "login.html";
}

// Sohbet başlığı: Karşı tarafı göster
const chatWith = document.getElementById("chatWith");
if (chatWith) {
  chatWith.textContent =
    username === "beyza" ? "Onat 💙" : "Beyza 💜";
}

// Firebase mesaj referansı
const messagesRef = ref(database, "messages");

// Gönder butonu
document.getElementById("sendBtn").addEventListener("click", () => {
  const message = document.getElementById("messageInput").value.trim();
  if (!message) return;

  push(messagesRef, {
    sender: username,
    text: message,
    timestamp: Date.now()
  });

  document.getElementById("messageInput").value = "";
});

// Yardımcı: Saat formatı
function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

// Yardımcı: Tarih formatı
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

// Mesajları dinle ve DOM'a yaz
let lastMessageDate = "";
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

  msgBox.innerHTML = `
    <div class="text">${msg.text}</div>
    <div class="timestamp">${formatTime(msg.timestamp)}</div>
  `;

  messagesDiv.appendChild(msgBox);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// Mobil ekran yüksekliği uyumu
function setFullHeight() {
  document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
}
window.addEventListener('resize', setFullHeight);
window.addEventListener('load', setFullHeight);
setFullHeight();
