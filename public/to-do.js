// Firebase modüllerini içe aktar
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onChildAdded
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// 🔑 Firebase yapılandırman
import { firebaseConfig } from './firebase-config.js';


// Firebase başlat
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const todosRef = ref(db, "todos");

// Elementler
const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");

// Görev ekle
addTaskBtn.addEventListener("click", () => {
  const text = taskInput.value.trim();
  if (text !== "") {
    push(todosRef, { text });
    taskInput.value = "";
  }
});

// Firebase'den görev eklenince
onChildAdded(todosRef, (data) => {
  const taskText = data.val().text;
  const taskId = data.key;

  const li = document.createElement("li");
  li.setAttribute("data-id", taskId);

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";

  const span = document.createElement("span");
  span.textContent = taskText;

  checkbox.addEventListener("change", () => {
    li.classList.toggle("completed", checkbox.checked);
  });

  li.appendChild(checkbox);
  li.appendChild(span);
  taskList.appendChild(li);
});
