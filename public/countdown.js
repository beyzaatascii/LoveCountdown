const meetDate = new Date("2025-12-09");
const today = new Date();
today.setHours(0, 0, 0, 0);

const diffTime = meetDate - today;
const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
document.getElementById("countdown").textContent =
  diffDays > 0
    ? `${diffDays} gün kaldı!`
    : diffDays === 0
    ? "1. Level Başarıyla Tamamlandı ! ❤"
    : "Düşünebiliyor musun bu kadar zamandır beraberizzz! 🫶";

const calendar = document.getElementById("calendar");

const year = 2025;
const month = 12; // Ağustos (0-based)

const firstDay = new Date(year, month, 1).getDay();
const lastDate = new Date(year, month + 1, 0).getDate();

for (let i = 0; i < firstDay; i++) {
  const emptyCell = document.createElement("div");
  calendar.appendChild(emptyCell);
}

for (let day = 1; day <= lastDate; day++) {
  const dayEl = document.createElement("div");
  dayEl.className = "day";
  dayEl.textContent = day;

  const thisDate = new Date(year, month, day);

  if (
    thisDate.getFullYear() === today.getFullYear() &&
    thisDate.getMonth() === today.getMonth() &&
    thisDate.getDate() === today.getDate()
  ) {
    dayEl.classList.add("today");
  }

  if (day === 9) {
    dayEl.classList.add("love-day");
    dayEl.textContent = "💖";
  }

  calendar.appendChild(dayEl);
}

function setFullHeight() {
  document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
}
window.addEventListener('resize', setFullHeight);
setFullHeight();
