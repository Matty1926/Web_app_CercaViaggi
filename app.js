import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDmcL2ckq11873STfhRkcKE2Meb12KV3JU",
  authDomain: "cercaviaggimp.firebaseapp.com",
  projectId: "cercaviaggimp",
  storageBucket: "cercaviaggimp.firebasestorage.app",
  messagingSenderId: "991205147594",
  appId: "1:991205147594:web:02b6e64502dcd2b9154533"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const tripsCol = collection(db, "trips");

// DOM
const tripForm = document.getElementById("trip-form");
const tripsList = document.getElementById("trips-list");
const searchInput = document.getElementById("search-input");
const themeToggle = document.getElementById("themeToggle");
const exportBtn = document.getElementById("exportBtn");
const toast = document.getElementById("toast");

let allTrips = [];

/* ------------------ TOAST ------------------ */
function showToast(message, type = "success") {
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => (toast.className = "toast"), 3000);
}

/* ------------------ THEME ------------------ */
function loadTheme() {
  const saved = localStorage.getItem("theme") || "dark";
  document.documentElement.setAttribute("data-theme", saved);
  themeToggle.textContent = saved === "dark" ? "🌙" : "☀️";
}

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
  themeToggle.textContent = next === "dark" ? "🌙" : "☀️";
});

loadTheme();

/* ------------------ EXPORT ------------------ */
exportBtn.addEventListener("click", () => {
  const data = JSON.stringify(allTrips, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "viaggi.json";
  a.click();

  showToast("Esportazione completata!");
});

/* ------------------ RENDER CARD ------------------ */
function renderTripCard(trip) {
  const card = document.createElement("article");
  card.className = "trip-card";

  card.innerHTML = `
    <div class="trip-header">
      <div class="trip-destination">${trip.destination}</div>
      <span class="trip-badge">Salvato</span>
    </div>

    <div class="trip-meta">
      ${trip.date ? `<span>Periodo: ${trip.date}</span>` : ""}
      ${trip.time ? `<span>Orari volo: ${trip.time}</span>` : ""}
      ${trip.airline ? `<span>Compagnia: ${trip.airline}</span>` : ""}
      ${trip.flightPrice ? `<span>Volo: €${trip.flightPrice}</span>` : ""}
      ${trip.hotel ? `<span>Hotel: ${trip.hotel}</span>` : ""}
      ${trip.hotelPrice ? `<span>Hotel: €${trip.hotelPrice}</span>` : ""}
    </div>

    <p class="trip-notes">${trip.notes || "Nessuna nota."}</p>

    <div class="trip-actions">
      <button class="btn-delete" data-id="${trip.id}">✕ Elimina</button>
    </div>
  `;

  card.querySelector(".btn-delete").addEventListener("click", async () => {
    await deleteDoc(doc(db, "trips", trip.id));
    showToast("Viaggio eliminato", "warning");
  });

  return card;
}

/* ------------------ RENDER LISTA ------------------ */
function renderTrips(filter = "") {
  tripsList.innerHTML = "";

  const f = filter.toLowerCase();
  const filtered = allTrips.filter(t =>
    t.destination.toLowerCase().includes(f)
  );

  if (!filtered.length) {
    tripsList.innerHTML = `<p style="color:#9ca3af;">Nessun viaggio trovato.</p>`;
    return;
  }

  filtered.forEach(t => tripsList.appendChild(renderTripCard(t)));
}

/* ------------------ FIRESTORE REALTIME ------------------ */
function subscribeTrips() {
  const q = query(tripsCol, orderBy("createdAt", "desc"));

  onSnapshot(q, snapshot => {
    allTrips = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    renderTrips(searchInput.value);
  });
}

subscribeTrips();

/* ------------------ FORM SUBMIT ------------------ */
tripForm.addEventListener("submit", async e => {
  e.preventDefault();

  const destination = destination.value.trim();
  if (!destination) return showToast("Inserisci una destinazione", "error");

  const data = {
    destination,
    date: date.value.trim(),
    time: time.value.trim(),
    airline: airline.value.trim(),
    flightPrice: flightPrice.value ? Number(flightPrice.value) : null,
    hotel: hotel.value.trim(),
    hotelPrice: hotelPrice.value ? Number(hotelPrice.value) : null,
    notes: notes.value.trim(),
    createdAt: Date.now()
  };

  await addDoc(tripsCol, data);
  tripForm.reset();
  showToast("Viaggio salvato!");
});

/* ------------------ SEARCH ------------------ */
searchInput.addEventListener("input", e => renderTrips(e.target.value));
