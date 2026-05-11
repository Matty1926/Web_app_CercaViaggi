import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
  updateDoc
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
const tripsCounter = document.getElementById("trips-counter");
const sortSelect = document.getElementById("sort-select");
const totalBudgetEl = document.getElementById("total-budget");

// Modal edit
const editModal = document.getElementById("editModal");
const closeEditModal = document.getElementById("closeEditModal");
const editForm = document.getElementById("edit-form");

// Modal foto
const photoModal = document.getElementById("photoModal");
const closePhotoModal = document.getElementById("closePhotoModal");
const carouselImg = document.getElementById("carouselImg");
const prevPhoto = document.getElementById("prevPhoto");
const nextPhoto = document.getElementById("nextPhoto");
const carouselCounter = document.getElementById("carouselCounter");

let allTrips = [];
let currentPhotos = [];
let currentPhotoIndex = 0;
let editingTripId = null;

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

/* ------------------ FOTO: base64 compress ------------------ */
function compressImage(file, maxW = 1200) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/* ------------------ CAROUSEL ------------------ */
function openCarousel(photos, startIndex = 0) {
  if (!photos || !photos.length) return;
  currentPhotos = photos;
  currentPhotoIndex = startIndex;
  updateCarousel();
  photoModal.style.display = "flex";
}

function updateCarousel() {
  carouselImg.src = currentPhotos[currentPhotoIndex];
  carouselCounter.textContent = `${currentPhotoIndex + 1} / ${currentPhotos.length}`;
  prevPhoto.style.visibility = currentPhotos.length > 1 ? "visible" : "hidden";
  nextPhoto.style.visibility = currentPhotos.length > 1 ? "visible" : "hidden";
}

prevPhoto.addEventListener("click", () => {
  currentPhotoIndex = (currentPhotoIndex - 1 + currentPhotos.length) % currentPhotos.length;
  updateCarousel();
});

nextPhoto.addEventListener("click", () => {
  currentPhotoIndex = (currentPhotoIndex + 1) % currentPhotos.length;
  updateCarousel();
});

closePhotoModal.addEventListener("click", () => (photoModal.style.display = "none"));
photoModal.addEventListener("click", (e) => { if (e.target === photoModal) photoModal.style.display = "none"; });

/* ------------------ EDIT MODAL ------------------ */
closeEditModal.addEventListener("click", () => {
  editModal.style.display = "none";
  editingTripId = null;
});
editModal.addEventListener("click", (e) => { if (e.target === editModal) { editModal.style.display = "none"; editingTripId = null; } });

function openEditModal(trip) {
  editingTripId = trip.id;
  document.getElementById("edit-destination").value = trip.destination || "";
  document.getElementById("edit-date").value = trip.date || "";
  document.getElementById("edit-time").value = trip.time || "";
  document.getElementById("edit-airline").value = trip.airline || "";
  document.getElementById("edit-flightPrice").value = trip.flightPrice || "";
  document.getElementById("edit-hotel").value = trip.hotel || "";
  document.getElementById("edit-hotelPrice").value = trip.hotelPrice || "";
  document.getElementById("edit-notes").value = trip.notes || "";
  editModal.style.display = "flex";
}

editForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!editingTripId) return;

  const updated = {
    destination: document.getElementById("edit-destination").value.trim(),
    date: document.getElementById("edit-date").value.trim(),
    time: document.getElementById("edit-time").value.trim(),
    airline: document.getElementById("edit-airline").value.trim(),
    flightPrice: document.getElementById("edit-flightPrice").value ? Number(document.getElementById("edit-flightPrice").value) : null,
    hotel: document.getElementById("edit-hotel").value.trim(),
    hotelPrice: document.getElementById("edit-hotelPrice").value ? Number(document.getElementById("edit-hotelPrice").value) : null,
    notes: document.getElementById("edit-notes").value.trim(),
  };

  if (!updated.destination) return showToast("Inserisci una destinazione", "error");

  // Handle new photos in edit
  const photoInput = document.getElementById("edit-photos");
  if (photoInput.files.length > 0) {
    const existing = allTrips.find(t => t.id === editingTripId)?.photos || [];
    const newPhotos = await Promise.all(Array.from(photoInput.files).slice(0, 6 - existing.length).map(f => compressImage(f)));
    updated.photos = [...existing, ...newPhotos];
  }

  await updateDoc(doc(db, "trips", editingTripId), updated);
  editModal.style.display = "none";
  editingTripId = null;
  showToast("Viaggio aggiornato!");
});

/* ------------------ BUDGET BADGE ------------------ */
function getBudgetBadge(total) {
  if (!total) return "";
  if (total < 500) return '<span class="budget-badge low">💚 Budget</span>';
  if (total < 1500) return '<span class="budget-badge mid">💛 Medio</span>';
  return '<span class="budget-badge high">🔴 Premium</span>';
}

/* ------------------ RENDER CARD ------------------ */
function renderTripCard(trip) {
  const card = document.createElement("article");
  card.className = "trip-card";

  const totalCost = (trip.flightPrice || 0) + (trip.hotelPrice || 0);
  const budgetBadge = getBudgetBadge(totalCost);
  const hasPhotos = trip.photos && trip.photos.length > 0;

  card.innerHTML = `
    ${hasPhotos ? `
      <div class="trip-photos-strip" data-id="${trip.id}">
        ${trip.photos.slice(0, 3).map((p, i) => `<img src="${p}" class="photo-thumb" data-index="${i}" alt="foto" />`).join("")}
        ${trip.photos.length > 3 ? `<div class="photo-more">+${trip.photos.length - 3}</div>` : ""}
      </div>` : ""}

    <div class="trip-header">
      <div class="trip-destination">✈️ ${trip.destination}</div>
      <div class="trip-badges">
        <span class="trip-badge">Salvato</span>
        ${budgetBadge}
      </div>
    </div>

    <div class="trip-meta">
      ${trip.date ? `<span>📅 ${trip.date}</span>` : ""}
      ${trip.time ? `<span>🕐 ${trip.time}</span>` : ""}
      ${trip.airline ? `<span>🛫 ${trip.airline}</span>` : ""}
      ${trip.flightPrice ? `<span>💺 Volo: <strong>€${trip.flightPrice}</strong></span>` : ""}
      ${trip.hotel ? `<span>🏨 ${trip.hotel}</span>` : ""}
      ${trip.hotelPrice ? `<span>🛏️ Hotel: <strong>€${trip.hotelPrice}</strong></span>` : ""}
      ${totalCost > 0 ? `<span class="total-cost">💰 Totale: <strong>€${totalCost}</strong></span>` : ""}
    </div>

    ${trip.notes ? `<p class="trip-notes">${trip.notes}</p>` : ""}

    <div class="trip-actions">
      <button class="btn-edit" data-id="${trip.id}">✏️ Modifica</button>
      <button class="btn-delete" data-id="${trip.id}">✕ Elimina</button>
    </div>
  `;

  // Foto click
  if (hasPhotos) {
    card.querySelectorAll(".photo-thumb").forEach(img => {
      img.addEventListener("click", () => openCarousel(trip.photos, Number(img.dataset.index)));
    });
    const moreEl = card.querySelector(".photo-more");
    if (moreEl) moreEl.addEventListener("click", () => openCarousel(trip.photos, 3));
  }

  card.querySelector(".btn-delete").addEventListener("click", async () => {
    if (confirm(`Eliminare il viaggio a "${trip.destination}"?`)) {
      await deleteDoc(doc(db, "trips", trip.id));
      showToast("Viaggio eliminato", "warning");
    }
  });

  card.querySelector(".btn-edit").addEventListener("click", () => openEditModal(trip));

  return card;
}

/* ------------------ RENDER LISTA ------------------ */
function renderTrips(filter = "") {
  tripsList.innerHTML = "";

  const f = filter.toLowerCase();
  let filtered = allTrips.filter(t =>
    (t.destination || "").toLowerCase().includes(f) ||
    (t.airline || "").toLowerCase().includes(f) ||
    (t.hotel || "").toLowerCase().includes(f) ||
    (t.notes || "").toLowerCase().includes(f)
  );

  // Sort
  const sortVal = sortSelect ? sortSelect.value : "date_desc";
  if (sortVal === "date_desc") filtered.sort((a, b) => b.createdAt - a.createdAt);
  else if (sortVal === "date_asc") filtered.sort((a, b) => a.createdAt - b.createdAt);
  else if (sortVal === "price_asc") filtered.sort((a, b) => ((a.flightPrice || 0) + (a.hotelPrice || 0)) - ((b.flightPrice || 0) + (b.hotelPrice || 0)));
  else if (sortVal === "price_desc") filtered.sort((a, b) => ((b.flightPrice || 0) + (b.hotelPrice || 0)) - ((a.flightPrice || 0) + (a.hotelPrice || 0)));
  else if (sortVal === "alpha") filtered.sort((a, b) => a.destination.localeCompare(b.destination));

  // Update counter
  if (tripsCounter) tripsCounter.textContent = `${filtered.length} viaggio${filtered.length !== 1 ? "i" : ""}`;

  // Update total budget
  if (totalBudgetEl) {
    const total = filtered.reduce((sum, t) => sum + (t.flightPrice || 0) + (t.hotelPrice || 0), 0);
    totalBudgetEl.textContent = total > 0 ? `Budget totale: €${total.toLocaleString("it-IT")}` : "";
  }

  if (!filtered.length) {
    tripsList.innerHTML = `<div class="empty-state"><span>🗺️</span><p>Nessun viaggio trovato.</p></div>`;
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
tripForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const destinationEl = document.getElementById("destination");
  const destinationVal = destinationEl.value.trim();
  if (!destinationVal) return showToast("Inserisci una destinazione", "error");

  const photoInput = document.getElementById("photos");
  let photos = [];
  if (photoInput && photoInput.files.length > 0) {
    const btn = tripForm.querySelector(".btn-primary");
    btn.textContent = "Caricamento foto...";
    btn.disabled = true;
    photos = await Promise.all(Array.from(photoInput.files).slice(0, 6).map(f => compressImage(f)));
    btn.textContent = "Salva viaggio";
    btn.disabled = false;
  }

  const data = {
    destination: destinationVal,
    date: document.getElementById("date").value.trim(),
    time: document.getElementById("time").value.trim(),
    airline: document.getElementById("airline").value.trim(),
    flightPrice: document.getElementById("flightPrice").value ? Number(document.getElementById("flightPrice").value) : null,
    hotel: document.getElementById("hotel").value.trim(),
    hotelPrice: document.getElementById("hotelPrice").value ? Number(document.getElementById("hotelPrice").value) : null,
    notes: document.getElementById("notes").value.trim(),
    photos,
    createdAt: Date.now()
  };

  await addDoc(tripsCol, data);
  tripForm.reset();
  showToast("Viaggio salvato! 🎉");
});

/* ------------------ SEARCH & SORT ------------------ */
searchInput.addEventListener("input", e => renderTrips(e.target.value));
if (sortSelect) sortSelect.addEventListener("change", () => renderTrips(searchInput.value));
