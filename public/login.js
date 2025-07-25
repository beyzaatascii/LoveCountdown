import { database } from "./firebase-config.js";
import {
  ref,
  get,
  child
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Giriş butonuna tıklama dinleyicisi
document.getElementById("login-btn").addEventListener("click", login);

async function login() {
  const username = document.getElementById("username").value.trim().toLowerCase();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    showMessage("Lütfen kullanıcı adı ve şifre girin!");
    return;
  }

  const userRef = ref(database);
  try {
    const snapshot = await get(child(userRef, `users/${username}`));
    if (snapshot.exists()) {
      const userData = snapshot.val();
      if (userData.password === password) {
        // localStorage'a kaydet
        localStorage.setItem("username", username);
        localStorage.setItem("displayName", userData.displayName);
        // yönlendir
        window.location.href = "menu.html";
      } else {
        showMessage("Şifre yanlış 😓");
      }
    } else {
      showMessage("Kullanıcı bulunamadı 🙃");
    }
  } catch (err) {
    console.error("Veritabanı hatası:", err);
    showMessage("Giriş sırasında bir hata oluştu 😥");
  }
}

// Uyarı mesajı
function showMessage(msg) {
  const bar = document.getElementById("messageBar");
  if (!bar) {
    alert(msg); // fallback
    return;
  }
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
