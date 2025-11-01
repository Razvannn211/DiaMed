// 🔹 Importuri Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  set,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

// 🔹 Configurare Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDxAJYVyQNs0wz06mgpqgktHqJIV9nmsJ4",
  authDomain: "dia-med1.firebaseapp.com",
  databaseURL:
    "https://dia-med1-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "dia-med1",
  storageBucket: "dia-med1.firebasestorage.app",
  messagingSenderId: "257820925381",
  appId: "1:257820925381:web:10bf647387a385709effac",
};

const app = initializeApp(firebaseConfig);
const bazaDate = getDatabase(app);

// 🔹 Elemente principale
const zileCalendar = document.getElementById("calendar-days");
const lunaAn = document.getElementById("month-year");
const butonInapoi = document.getElementById("prev-month");
const butonInainte = document.getElementById("next-month");
const zileSaptamana = document.getElementById("calendar-weekdays");

// 🔹 Variabile pentru data curentă
let dataCurenta = new Date();
let ziSelectata, lunaSelectata, anSelectat;

// 🔹 Denumiri zile
const saptamana = ["Lun", "Mar", "Mie", "Joi", "Vin", "Sâm", "Dum"];
function afiseazaZileSaptamana() {
  zileSaptamana.innerHTML = "";
  saptamana.forEach((zi) => {
    const div = document.createElement("div");
    div.textContent = zi;
    if (zi == "Sâm" || zi == "Dum") {
      div.style = "color: #0d5d2b; background-color: white; padding: 10px;";
    } else {
      div.style = "color: white; background-color: #0d5d2b; padding: 10px;";
    }
    zileSaptamana.appendChild(div);
  });
}

// 🔹 Program prestabilit pentru fiecare zi
const programZilnic = {
  1: [
    // Luni
    { start: "08:00", end: "09:15", tip: "Pacienți cronici" },
    { start: "09:30", end: "10:30", tip: "Rețete" },
    { start: "10:45", end: "11:45", tip: "Rezultate" },
  ],
  2: [
    // Marți
    { start: "08:00", end: "09:15", tip: "Pacienți cronici" },
    { start: "09:30", end: "10:30", tip: "Rețete" },
    { start: "10:45", end: "11:45", tip: "Rezultate" },
  ],
  3: [
    // Miercuri
    { start: "14:00", end: "15:15", tip: "Pacienți cronici" },
    { start: "15:30", end: "16:15", tip: "Rețete" },
    { start: "16:30", end: "17:15", tip: "Rezultate" },
  ],
  4: [
    // Joi
    { start: "08:00", end: "09:15", tip: "Pacienți cronici" },
    { start: "09:30", end: "10:30", tip: "Rețete" },
    { start: "10:45", end: "11:45", tip: "Rezultate" },
  ],
  5: [
    // Vineri
    { start: "14:00", end: "14:45", tip: "Pacienți cronici" },
    { start: "14:45", end: "17:00", tip: "Pacienți cronici" },
  ],
};

// 🔹 Funcție pentru generarea programărilor din 15 în 15 minute
function genereazaProgramari(start, end) {
  const sloturi = [];
  const [startH, startM] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);

  let curent = new Date();
  curent.setHours(startH, startM, 0, 0);

  const limita = new Date();
  limita.setHours(endH, endM, 0, 0);

  while (curent < limita) {
    const inceput = `${String(curent.getHours()).padStart(2, "0")}:${String(
      curent.getMinutes()
    ).padStart(2, "0")}`;
    curent.setMinutes(curent.getMinutes() + 15);
    const sfarsit = `${String(curent.getHours()).padStart(2, "0")}:${String(
      curent.getMinutes()
    ).padStart(2, "0")}`;
    sloturi.push(`${inceput} - ${sfarsit}`);
  }
  return sloturi;
}

// 🔹 Afișare calendar
async function afiseazaCalendar(data) {
  butonInapoi.disabled = true;
  butonInainte.disabled = true;
  zileCalendar.innerHTML = "";

  const an = data.getFullYear();
  const luna = data.getMonth();

  const luniNume = [
    "Ianuarie",
    "Februarie",
    "Martie",
    "Aprilie",
    "Mai",
    "Iunie",
    "Iulie",
    "August",
    "Septembrie",
    "Octombrie",
    "Noiembrie",
    "Decembrie",
  ];
  lunaAn.textContent = `${luniNume[luna]} ${an} (Se încarcă...)`;
  let primaZi = new Date(an, luna, 1).getDay();
  primaZi = primaZi === 0 ? 6 : primaZi - 1;
  for (let i = 0; i < primaZi; i++) {
    const gol = document.createElement("button");
    gol.textContent = "";
    zileCalendar.appendChild(gol);
  }
  const zileLuna = new Date(an, luna + 1, 0).getDate();

  const promisiuni = [];
  for (let i = 1; i <= zileLuna; i++) {
    const refZi = ref(bazaDate, `/ani/${an}/${luna + 1}/${i}`);
    promisiuni.push(get(refZi));
  }

  const rezultate = await Promise.all(promisiuni);
    let ultimaZiSaptamana;
  for (let i = 1; i <= zileLuna; i++) {
    const butonZi = document.createElement("button");
    butonZi.textContent = i;

    const dataZi = new Date(an, luna, i);
    if (dataZi < new Date()) butonZi.style.color = "gray";

    butonZi.addEventListener("click", () => {
      ziSelectata = i;
      lunaSelectata = luna + 1;
      anSelectat = an;
      afiseazaPopup(i, luna + 1, an);
    });
    const snapshot = rezultate[i - 1];
    const date = snapshot.val();
    if (date) {
      const areSloturi = Object.values(date).some(
        (interval) => interval && interval.length > 0
      );
      if (areSloturi) butonZi.style.backgroundColor = "lightblue";
    }
    ultimaZiSaptamana = (primaZi + i - 1) % 7;
    zileCalendar.appendChild(butonZi);
  }
  butonInapoi.disabled = false;
  butonInainte.disabled = false;
  lunaAn.textContent = `${luniNume[luna]} ${an}`;
  while (ultimaZiSaptamana != 6) {
    const gol = document.createElement("button");
    gol.textContent = "";
    zileCalendar.appendChild(gol);
    ultimaZiSaptamana++;
  }
}

// 🔹 Elemente popup
const popup = document.getElementById("popup");
const selectOra = document.getElementById("slot-select");
const butonAdauga = document.getElementById("add-slot-btn");

// 🔹 Sloturi disponibile în funcție de zi
function afiseazaSloturiDisponibile(zi, luna, an) {
  selectOra.innerHTML = "";
  const data = new Date(an, luna - 1, zi);
  let ziSapt = data.getDay();
  ziSapt = ziSapt === 0 ? 7 : ziSapt; // Duminică devine 7

  const program = programZilnic[ziSapt];
  if (!program) {
    const opt = document.createElement("option");
    opt.textContent = "Fără program în această zi";
    selectOra.appendChild(opt);
    return;
  }

  program.forEach(({ start, end, tip }) => {
    const sloturi = genereazaProgramari(start, end);
    const optgroup = document.createElement("optgroup");
    optgroup.label = `${tip} (${start}–${end})`;

    sloturi.forEach((slot) => {
      const opt = document.createElement("option");
      opt.value = slot;
      opt.textContent = slot;
      optgroup.appendChild(opt);
    });

    selectOra.appendChild(optgroup);
  });
}
const zileSaptamanareal = [
  "Joi",
  "Vineri",
  "Sambata",
  "Duminica",
  "Luni",
  "Marti",
  "Miercuri",
];
// 🔹 Afișare popup
window.afiseazaPopup = async function (zi, luna, an) {
  popup.style.display = "block";
  let datapopup = new Date(an, luna, zi);
  let day = datapopup.getDay();
  let dayname = zileSaptamanareal[day];
  console.log(dayname);
  let texttitle = "Adaugă intervale pentru: ";
  document.getElementById("popup-title").textContent =
    `Adaugă intervale pentru:  ${zi}/${luna}/${an} -` + dayname;
  afiseazaSloturiDisponibile(zi, luna, an);
  const listaOre = document.getElementById("lista-ore");
  listaOre.innerHTML = "Se încarcă...";

  const refZi = ref(bazaDate, `/ani/${an}/${luna}/${zi}`);
  const snapshot = await get(refZi);
  const date = snapshot.val();
  if (date) {
    listaOre.innerHTML = "";
    for (const [tip, sloturi] of Object.entries(date)) {
      const titlu = document.createElement("h4");
      titlu.textContent = tip;
      listaOre.appendChild(titlu);

      sloturi.forEach((slot) => {
        const divSlot = document.createElement("div");
        divSlot.style.display = "flex";
        divSlot.style.justifyContent = "space-between";
        divSlot.style.marginBottom = "5px";

        const textOra = document.createElement("span");
        textOra.textContent = slot;

        const butonSterge = document.createElement("button");
        butonSterge.textContent = "Șterge";
        butonSterge.style.backgroundColor = "#ff4d4d";
        butonSterge.style.color = "white";
        butonSterge.style.border = "none";
        butonSterge.style.padding = "5px 10px";
        butonSterge.style.borderRadius = "6px";
        butonSterge.style.cursor = "pointer";

        butonSterge.addEventListener("click", async () => {
          const refInterval = ref(bazaDate, `/ani/${an}/${luna}/${zi}/${tip}`);
          const snapshot = await get(refInterval);
          let sloturiInBd = snapshot.val() || [];
          sloturiInBd = sloturiInBd.filter((s) => s !== slot);
          await set(refInterval, sloturiInBd);
          afiseazaPopup(zi, luna, an);
        });

        divSlot.appendChild(textOra);
        divSlot.appendChild(butonSterge);
        listaOre.appendChild(divSlot);
      });
    }
  } else {
    listaOre.innerHTML = "<em>Nicio oră adăugată încă.</em>";
  }

  butonAdauga.onclick = async function () {
    const optSelectat = selectOra.selectedOptions[0];
    const labelGrup = optSelectat.parentElement.label;
    const tip = labelGrup.split("(")[0].trim();
    const slot = optSelectat.value;

    const refInterval = ref(
      bazaDate,
      `/ani/${anSelectat}/${lunaSelectata}/${ziSelectata}/${tip}`
    );
    const snapshot = await get(refInterval);
    let sloturiInBd = snapshot.val() || [];

    if (!sloturiInBd.includes(slot)) {
      sloturiInBd.push(slot);
      await set(refInterval, sloturiInBd);
      alert(`Ora ${slot} (${tip}) a fost adăugată!`);
      afiseazaPopup(ziSelectata, lunaSelectata, anSelectat);
    } else {
      alert(`Ora ${slot} este deja adăugată!`);
    }
  };
};

// 🔹 Închidere popup
document.getElementById("close-popup").onclick = () =>
  (popup.style.display = "none");

// 🔹 Navigare între luni
butonInapoi.addEventListener("click", () => {
  dataCurenta.setMonth(dataCurenta.getMonth() - 1);
  afiseazaCalendar(dataCurenta);
});
butonInainte.addEventListener("click", () => {
  dataCurenta.setMonth(dataCurenta.getMonth() + 1);
  afiseazaCalendar(dataCurenta);
});

// 🔹 Inițializare
afiseazaZileSaptamana();
afiseazaCalendar(dataCurenta);
