// app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// 🔧 Sostituisci con la tua config Firebase
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

// Elementi DOM
const tripForm = document.getElementById("trip-form");
const tripsList = document.getElementById("trips-list");
const searchInput = document.getElementById("search-input");

let allTrips = [];

// Render singola card viaggio
function renderTripCard(trip) {
  const card = document.createElement("article");
  card.className = "trip-card";
  card.dataset.id = trip.id;

  card.innerHTML = `
    <div class="trip-header">
      <div class="trip-destination">${trip.destination || "Senza destinazione"}</div>
      <span class="trip-badge">Salvato</span>
    </div>
    <div class="trip-meta">
      ${trip.date ? `<span>Periodo: ${trip.date}</span>` : ""}
      ${trip.budget ? ` · <span>Budget: €${trip.budget}</span>` : ""}
    </div>
    ${
      trip.notes
        ? `<p class="trip-notes">${trip.notes}</p>`
        : `<p class="trip-notes" style="opacity:.7;">Nessuna nota aggiunta.</p>`
    }
    <div class="trip-actions">
      <button class="btn-delete" data-id="${trip.id}">
        <span>✕</span> Elimina
      </button>
    </div>
  `;

  const deleteBtn = card.querySelector(".btn-delete");
  deleteBtn.addEventListener("click", async () => {
    try {
      await deleteDoc(doc(db, "trips", trip.id));
    } catch (err) {
      console.error("Errore eliminazione:", err);
      alert("Errore durante l'eliminazione del viaggio.");
    }
  });

  return card;
}

// Render lista filtrata
function renderTrips(filterText = "") {
  tripsList.innerHTML = "";

  const normalized = filterText.trim().toLowerCase();
  const filtered = normalized
    ? allTrips.filter((t) =>
        (t.destination || "").toLowerCase().includes(normalized)
      )
    : allTrips;

  if (!filtered.length) {
    tripsList.innerHTML =
      '<p style="color:#9ca3af;font-size:.85rem;">Nessun viaggio trovato. Aggiungine uno sopra 👆</p>';
    return;
  }

  filtered.forEach((trip) => {
    tripsList.appendChild(renderTripCard(trip));
  });
}

// Listener realtime Firestore
function subscribeTrips() {
  const q = query(tripsCol, orderBy("createdAt", "desc"));

  onSnapshot(
    q,
    (snapshot) => {
      allTrips = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data()
      }));
      renderTrips(searchInput.value);
    },
    (err) => {
      console.error("Errore snapshot:", err);
    }
  );
}

// Submit form
tripForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const destination = document.getElementById("destination").value.trim();
  const date = document.getElementById("date").value.trim();
  const time = document.getElementById("time").value.trim();
  const airline = document.getElementById("airline").value.trim();
  const flightPriceValue = document.getElementById("flightPrice").value;
  const hotel = document.getElementById("hotel").value.trim();
  const hotelPriceValue = document.getElementById("hotelPrice").value;
  const notes = document.getElementById("notes").value.trim();

  if (!destination) {
    alert("Inserisci almeno una destinazione.");
    return;
  }

  const flightPrice = flightPriceValue ? Number(flightPriceValue) : null;
  const hotelPrice = hotelPriceValue ? Number(hotelPriceValue) : null;

  try {
    await addDoc(tripsCol, {
      destination,
      date,
      time,
      airline,
      flightPrice,
      hotel,
      hotelPrice,
      notes,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    tripForm.reset();
  } catch (err) {
    console.error("Errore salvataggio:", err);
    alert("Errore durante il salvataggio del viaggio.");
  }
});


// Ricerca live
searchInput.addEventListener("input", (e) => {
  renderTrips(e.target.value);
});

// Avvio
subscribeTrips();
