const calendarDays = document.getElementById("calendar-days");
const monthYear = document.getElementById("month-year");
const prevMonthBtn = document.getElementById("prev-month");
const nextMonthBtn = document.getElementById("next-month");
const calendarWeekdays = document.getElementById("calendar-weekdays");

let currentDate = new Date();

// Numele zilelor (începând cu Luni)
const weekdays = ["Lun", "Mar", "Mie", "Joi", "Vin", "Sâm", "Dum"];

function renderWeekdays() {
  calendarWeekdays.innerHTML = "";
  weekdays.forEach(day => {
    const div = document.createElement("div");
    div.textContent = day;
    if(day == "Sâm" || day == "Dum") {
        div.style = "color: #0d5d2b; background-color: white; padding: 10px; border: 1px solid hsl(124 0% 21.5%); border-top: 2px solid hsl(124 0% 21.5%); border-bottom: 2px solid hsl(124 0% 21.5%);";

    }
    else { 
        div.style = "color: white; background-color: #0d5d2b; padding: 10px; border: 1px solid hsl(124 0% 21.5%); border-top: 2px solid hsl(124 0% 21.5%); border-bottom: 2px solid hsl(124 0% 21.5%);";
    }
    calendarWeekdays.appendChild(div);
  });
}

function renderCalendar(date) {
  calendarDays.innerHTML = ""; // golim zilele
  const year = date.getFullYear();
  const month = date.getMonth();

  // Titlul lunii
  const monthNames = [
    "Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
    "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"
  ];
  monthYear.textContent = `${monthNames[month]} ${year}`;

  // Ziua săptămânii pentru prima zi din lună (0=Duminică)
  let firstDay = new Date(year, month, 1).getDay(); 
  firstDay = firstDay === 0 ? 6 : firstDay - 1; // ajustăm să înceapă cu Luni

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Spații goale pentru prima săptămână
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    calendarDays.appendChild(empty);
  }

  // Zilele lunii
  for (let i = 1; i <= daysInMonth; i++) {
    const dayBtn = document.createElement("button");
    dayBtn.textContent = i;
    dayBtn.addEventListener("click", () => {
      alert(`Ai selectat: ${i} ${monthNames[month]} ${year}`);
      // aici putem afișa intervalele pranz/seara
    });
    calendarDays.appendChild(dayBtn);
  }
}

// Navigare între luni
prevMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar(currentDate);
});

nextMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar(currentDate);
});

// Initializare
renderWeekdays();
renderCalendar(currentDate);
