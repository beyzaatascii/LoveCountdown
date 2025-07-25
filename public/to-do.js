import { database } from "./firebase-config.js";
import {
  ref,
  set,
  get,
  push,
  child,
  onValue,
  onChildAdded
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// ✅ Doğru referans bu şekilde
const todosRef = ref(database, "todos");

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
