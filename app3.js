import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDxAJYVyQNs0wz06mgpqgktHqJIV9nmsJ4",
  authDomain: "dia-med1.firebaseapp.com",
  databaseURL: "https://dia-med1-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "dia-med1",
  storageBucket: "dia-med1.firebasestorage.app",
  messagingSenderId: "257820925381",
  appId: "1:257820925381:web:10bf647387a385709effac",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Elemente calendar
const zileCalendar = document.getElementById("calendar-days");
const lunaAn = document.getElementById("month-year");
const butonInapoi = document.getElementById("prev-month");
const butonInainte = document.getElementById("next-month");
const zileSaptamana = document.getElementById("calendar-weekdays");

const popup = document.getElementById("popup");
const popupTitle = document.getElementById("popup-title");
const selectSlot = document.getElementById("slot-select");
const btnReserve = document.getElementById("reserve-slot-btn");

let dataCurenta = new Date();
let ziSelectata, lunaSelectata, anSelectat;

// Denumiri zile
const saptamana = ["Lun", "Mar", "Mie", "Joi", "Vin", "Sâm", "Dum"];

// Program prestabilit
const programZilnic = {
  1: [{ start: "08:00", end: "09:15", tip: "Pacienți cronici" }, { start:"09:30", end:"10:30", tip:"Rețete"}],
  2: [{ start: "08:00", end: "09:15", tip: "Pacienți cronici" }, { start:"09:30", end:"10:30", tip:"Rețete"}],
  3: [{ start: "14:00", end: "15:15", tip: "Pacienți cronici" }, { start:"15:30", end:"16:15", tip:"Rețete"}],
  4: [{ start: "08:00", end: "09:15", tip: "Pacienți cronici" }, { start:"09:30", end:"10:30", tip:"Rețete"}],
  5: [{ start: "14:00", end: "17:00", tip: "Pacienți cronici"}],
};

// Generare sloturi
function genereazaSloturi(start,end){
  const sloturi = [];
  let [h,m] = start.split(":").map(Number);
  const [eh,em] = end.split(":").map(Number);
  let curent = new Date(); curent.setHours(h,m,0,0);
  const limita = new Date(); limita.setHours(eh,em,0,0);
  while(curent<limita){
    const inceput = `${String(curent.getHours()).padStart(2,"0")}:${String(curent.getMinutes()).padStart(2,"0")}`;
    curent.setMinutes(curent.getMinutes()+15);
    const sfarsit = `${String(curent.getHours()).padStart(2,"0")}:${String(curent.getMinutes()).padStart(2,"0")}`;
    sloturi.push(`${inceput} - ${sfarsit}`);
  }
  return sloturi;
}

// Afișare zile sapt
function afiseazaZileSaptamana(){
  zileSaptamana.innerHTML="";
  saptamana.forEach(zi=>{
    const div = document.createElement("div");
    div.textContent = zi;
    div.style.fontWeight="bold";
    zileSaptamana.appendChild(div);
  });
}

// Afișare calendar
async function afiseazaCalendar(data){
  zileCalendar.innerHTML="";
  const an = data.getFullYear();
  const luna = data.getMonth();
  anSelectat = an; lunaSelectata = luna+1;

  const luniNume = ["Ianuarie","Februarie","Martie","Aprilie","Mai","Iunie","Iulie","August","Septembrie","Octombrie","Noiembrie","Decembrie"];
  lunaAn.textContent=`${luniNume[luna]} ${an} Se incarca...`;

  let primaZi = new Date(an,luna,1).getDay();
  primaZi = primaZi===0?6:primaZi-1;
  for(let i=0;i<primaZi;i++){
    const gol=document.createElement("button"); gol.disabled=true; zileCalendar.appendChild(gol);
  }

  const zileLuna = new Date(an,luna+1,0).getDate();
  const promises=[];
  for(let i=1;i<=zileLuna;i++){ promises.push(get(ref(db,`/ani/${an}/${luna+1}/${i}`))); }
  const rezultate = await Promise.all(promises);

  for(let i=1;i<=zileLuna;i++){
    const btnZi = document.createElement("button");
    btnZi.textContent=i;
    const snapshot = rezultate[i-1];
    const date = snapshot?snapshot.val():null;

    const azi = new Date(); const dataZi = new Date(an,luna,i);
    if(dataZi<azi.setHours(0,0,0,0)) btnZi.disabled=true;

    btnZi.addEventListener("click",()=>{ ziSelectata=i; afiseazaPopup(i,luna+1,an); });

    if(date){ const areSloturi = Object.values(date).some(interval=>interval&&interval.length>0); if(areSloturi) btnZi.style.backgroundColor="lightblue"; }

    zileCalendar.appendChild(btnZi);
  }

  butonInapoi.disabled=false; butonInainte.disabled=false;
  lunaAn.textContent=`${luniNume[luna]} ${an}`;
}

// Afișare popup
async function afiseazaPopup(zi,luna,an){
  popup.style.display="flex";
  popupTitle.textContent=`Rezervă pentru: ${zi}/${luna}/${an}`;
  selectSlot.innerHTML=""; selectSlot.disabled=false; btnReserve.disabled=false;

  let ziSapt = new Date(an,luna-1,zi).getDay();
  ziSapt = ziSapt===0?7:ziSapt;
  const program = programZilnic[ziSapt];
  if(!program){
    const opt=document.createElement("option"); opt.textContent="Fără program"; selectSlot.appendChild(opt);
    selectSlot.disabled=true; btnReserve.disabled=true; return;
  }

  const snapshot = await get(ref(db, `/ani/${an}/${luna}/${zi}`));
  const ocupate = snapshot.val()||{};

  program.forEach(({start,end,tip})=>{
    const sloturi = genereazaSloturi(start,end);
    sloturi.forEach(slot=>{
      const ocupat = ocupate[tip]?.includes(slot);
      if(!ocupat){
        const opt = document.createElement("option");
        opt.value=`${tip}|${slot}`;
        opt.textContent=`${slot} (${tip})`;
        selectSlot.appendChild(opt);
      }
    });
  });

  if(selectSlot.options.length===0){
    const opt=document.createElement("option"); opt.textContent="Nicio oră disponibilă";
    selectSlot.appendChild(opt); selectSlot.disabled=true; btnReserve.disabled=true;
  }
}

// Rezervare slot
btnReserve.onclick = async ()=>{
  const valoare = selectSlot.value; if(!valoare) return;
  const [tip,slot] = valoare.split("|");

  const refSlot = ref(db, `/ani/${anSelectat}/${lunaSelectata}/${ziSelectata}/${tip}`);
  const snapshot = await get(refSlot);
  let sloturiInBd = snapshot.val()||[];

  if(!sloturiInBd.includes(slot)){
    sloturiInBd.push(slot);
    await set(refSlot,sloturiInBd);
    alert(`Ora ${slot} (${tip}) a fost rezervată!`);
    popup.style.display="none";
    afiseazaCalendar(dataCurenta);
  } else { alert("Slotul a fost deja rezervat!"); }
};

// Închidere popup
document.getElementById("close-popup").onclick = ()=>popup.style.display="none";

// Navigare luni
butonInapoi.onclick=()=>{ dataCurenta.setMonth(dataCurenta.getMonth()-1); afiseazaCalendar(dataCurenta); };
butonInainte.onclick=()=>{ dataCurenta.setMonth(dataCurenta.getMonth()+1); afiseazaCalendar(dataCurenta); };

// Inițializare
afiseazaZileSaptamana();
afiseazaCalendar(dataCurenta);
